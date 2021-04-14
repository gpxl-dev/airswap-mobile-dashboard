import { useEffect, useState } from "react";
import axios from "axios";

type Space = {
  filters: {
    invalids: string[];
  };
};

type SnapshotProposal = {
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

type ActivateProposal = {
  id: string;
  status: "ACCEPTED" | "REJECTED" | "NOT_STARTED";
  name: string;
  /**
   * Javascript timestamp
   */
  endDate: number;
  /**
   * Javascript timestamp
   */
  startDate: number;
  root: string;
  block: number;
  votes: {
    Yes: string;
    No: string;
  };
};

type SnapshotVote = {
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
  onActivate: boolean;
  status: string | null;
  votes: {
    Yes: {
      points: string | null;
      voters: number;
    };
    No: {
      points: string | null;
      voters: number;
    };
  };
  communityUrl: string | null;
  githubUrl: string | null;
  proposalUrl: string;
  voters: string[];
};

const snapShotApiUrlBase = "https://hub.snapshot.page/api";
// Note: proxy needed due to CORS header on API
const activateApiUrlBase =
  "https://api.codetabs.com/v1/proxy/?quest=https://api.activate.codefi.network/api/v2";
const proposalUrlBase = "https://shot.eth.link/#/vote.airswap.eth/proposal";

const communityLinkRegex = /(?:https:\/\/)community\.airswap\.io[a-zA-Z0-9\-_.!&%/]+/;
const githubLinkRegex = /(?:https:\/\/)github\.com\/airswap[a-zA-Z0-9\-_.!&%/]+/;

const useProposals = () => {
  const [proposalData, setProposalData] = useState<ReducedProposal[] | null>(
    null
  );

  useEffect(() => {
    const get = async () => {
      const proposalsPromise = axios.get<{
        [proposalId: string]: SnapshotProposal;
      }>(`${snapShotApiUrlBase}/vote.airswap.eth/proposals`);
      const spacePromise = axios.get<Space>(
        `${snapShotApiUrlBase}/spaces/vote.airswap.eth`
      );
      const activateProposalsPromise = axios.get<ActivateProposal[]>(
        `${activateApiUrlBase}/proposals/vote.airswap.eth`
      );
      const [
        snapshotProposalsResponse,
        spaceResponse,
        activateProposalsResponse,
      ] = await Promise.all([
        proposalsPromise,
        spacePromise,
        activateProposalsPromise,
      ]);
      spaceResponse.data.filters.invalids.forEach((invalidId) => {
        delete snapshotProposalsResponse.data[invalidId];
      });
      Object.values(snapshotProposalsResponse.data).forEach((prop) => {
        if (!prop.msg.payload.name.startsWith("AIP")) {
          delete snapshotProposalsResponse.data[prop.authorIpfsHash];
        }
      });
      const proposalIds = Object.keys(snapshotProposalsResponse.data);
      const votingDataPromises = proposalIds.map((id) =>
        axios.get<{
          [voterAddress: string]: SnapshotVote;
        }>(`${snapShotApiUrlBase}/vote.airswap.eth/proposal/${id}`)
      );
      const votingDataResponses = await Promise.all(votingDataPromises);
      const votingData: { [proposalId: string]: SnapshotVote[] } = {};
      votingDataResponses.forEach(
        (r, i) => (votingData[proposalIds[i]] = Object.values(r.data))
      );

      const data: ReducedProposal[] = Object.values(
        snapshotProposalsResponse.data
      )
        .sort((a, b) => b.msg.payload.end - a.msg.payload.end)
        .map((proposalData) => {
          const now = Date.now() / 1000;
          const proposalId = proposalData.authorIpfsHash;
          const snapshotProposal = proposalData.msg.payload;
          const activateProposal = activateProposalsResponse.data.find(
            (p) => p.id === proposalId
          );
          const votes = votingData[proposalId];
          return {
            id: proposalId,
            name: snapshotProposal.name,
            body: snapshotProposal.body,
            active: snapshotProposal.end > now && snapshotProposal.start <= now,
            start: snapshotProposal.start,
            end: snapshotProposal.end,
            onActivate: !!activateProposal,
            votes: {
              Yes: {
                points: activateProposal?.votes.Yes || null,
                voters: votes?.filter((v) => {
                  const i = snapshotProposal.choices.indexOf("Yes") + 1;
                  return v.msg.payload.choice === i;
                }).length,
              },
              No: {
                points: activateProposal?.votes.No || null,
                voters: votes?.filter((v) => {
                  const i = snapshotProposal.choices.indexOf("No") + 1;
                  return v.msg.payload.choice === i;
                }).length,
              },
            },
            status: activateProposal?.status || null,
            proposalUrl: `${proposalUrlBase}/${proposalId}`,
            communityUrl: (communityLinkRegex.exec(snapshotProposal.body) || [
              null,
            ])[0],
            githubUrl: (githubLinkRegex.exec(snapshotProposal.body) || [
              null,
            ])[0],
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
