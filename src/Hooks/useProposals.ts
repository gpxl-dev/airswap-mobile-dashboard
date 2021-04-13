import { useEffect, useState } from "react";
import axios from "axios";

type Space = {
  filters: {
    invalids: string[];
  };
};

type Proposal = {
  address: string;
  sig: string;
  authorIpfsHash: string;
  replayerIpfsHash: string;
  msg: {
    timestamp: string;
    version: string;
    type: string;
    payload: {
      start: number;
      end: number;
      name: string;
      body: string;
      choices: string[];
    };
  };
};

type Vote = {
  address: string;
  msg: {
    version: string;
    timestamp: number;
    type: "vote";
    payload: {
      choice: number;
      metadata: {};
      proposal: string;
    };
  };
  sig: string;
  authorIpfsHash: string;
  replayerIpfsHash: string;
};

export type ReducedProposal = {
  id: string;
  name: string;
  body: string;
  active: boolean;
  start: number;
  end: number;
  choices: {
    [choiceName: string]: number;
  };
  communityUrl: string | null;
  githubUrl: string | null;
  voters: string[];
};

const URLBase = "https://hub.snapshot.page/api";

const communityLinkRegex = /(?:https:\/\/)community\.airswap\.io[a-zA-Z0-9\-_.!&%/]+/;
const githubLinkRegex = /(?:https:\/\/)github\.com\/airswap[a-zA-Z0-9\-_.!&%/]+/;

const useProposals = () => {
  const [proposalData, setProposalData] = useState<ReducedProposal[] | null>(
    null
  );

  useEffect(() => {
    const get = async () => {
      const proposalsPromise = axios.get<{
        [proposalId: string]: Proposal;
      }>(`${URLBase}/vote.airswap.eth/proposals`);
      const spacePromise = axios.get<Space>(
        `${URLBase}/spaces/vote.airswap.eth`
      );
      const [proposalResponse, spaceResponse] = await Promise.all([
        proposalsPromise,
        spacePromise,
      ]);
      spaceResponse.data.filters.invalids.forEach((invalidId) => {
        delete proposalResponse.data[invalidId];
      });
      Object.values(proposalResponse.data).forEach((prop) => {
        if (!prop.msg.payload.name.startsWith("AIP")) {
          delete proposalResponse.data[prop.authorIpfsHash];
        }
      });
      const proposalIds = Object.keys(proposalResponse.data);
      const votingDataPromises = proposalIds.map((id) =>
        axios.get<{
          [voterAddress: string]: Vote;
        }>(`${URLBase}/vote.airswap.eth/proposal/${id}`)
      );
      const votingDataResponses = await Promise.all(votingDataPromises);
      const votingData: { [proposalId: string]: Vote[] } = {};
      votingDataResponses.forEach(
        (r, i) => (votingData[proposalIds[i]] = Object.values(r.data))
      );

      const data: ReducedProposal[] = Object.values(proposalResponse.data)
        .sort((a, b) => b.msg.payload.end - a.msg.payload.end)
        .map((proposalData) => {
          const now = Date.now() / 1000;
          const proposalId = proposalData.authorIpfsHash;
          const proposal = proposalData.msg.payload;
          const votes = votingData[proposalId];
          return {
            id: proposalId,
            name: proposal.name,
            body: proposal.body,
            active: proposal.end > now && proposal.start <= now,
            start: proposal.start,
            end: proposal.end,
            communityUrl: (communityLinkRegex.exec(proposal.body) || [null])[0],
            githubUrl: (githubLinkRegex.exec(proposal.body) || [null])[0],
            choices: proposal.choices.reduce(
              (
                choiceData: {
                  [choice: string]: number;
                },
                choice,
                i
              ) => {
                choiceData[choice] = votes?.filter(
                  (v) => v.msg.payload.choice === i
                ).length;
                return choiceData;
              },
              {}
            ),
            voters: votes?.map((v) => v.address) || [],
          };
        });
      setProposalData(data);
    };

    get();
  }, []);

  return proposalData;
};

export default useProposals;
