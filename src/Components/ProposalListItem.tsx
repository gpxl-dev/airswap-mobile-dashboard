import classNames from "classnames";
import { FC } from "react";
import { AiOutlineGithub } from "react-icons/ai";
import { FaVoteYea } from "react-icons/fa";
import { GoChevronRight } from "react-icons/go";
import { BsFillLightningFill } from "react-icons/bs";
import { VscCommentDiscussion } from "react-icons/vsc";
import ReactMarkdown from "react-markdown";
import { ReducedProposal } from "../Hooks/useProposals";
import { utils } from "ethers";

const ProposalListItem: FC<{
  proposal: ReducedProposal;
  expanded: boolean;
  voted: boolean;
  onToggleExpanded: () => void;
}> = ({ proposal, expanded, voted, onToggleExpanded }) => {
  const isCompleted = proposal.end * 1000 < Date.now();
  return (
    <div className="contents">
      <button
        className={classNames(
          "col-start-1 p-4 -m-4",
          "cursor-pointer select-none focus:outline-none",
          "transition-transform duration-150 transform rotate-0",
          expanded ? "rotate-90" : ""
        )}
        style={{
          WebkitTapHighlightColor: "transparent",
        }}
        onClick={onToggleExpanded}
      >
        <GoChevronRight />
      </button>
      <div onClick={onToggleExpanded}>
        {isCompleted && (
          <span
            className={classNames(
              "text-xs tracking-tighter border px-1 mr-2 text-opacity-80 rounded-sm",
              proposal.status === "ACCEPTED"
                ? "border-green-600 bg-green-800 text-white"
                : "border-red-600 bg-red-800 text-white"
            )}
          >
            {proposal.status}
          </span>
        )}
        <span className="font-semibold">{proposal.name}</span>
      </div>
      {/* <div className="grid grid-flow-col gap-2">
        <a href={proposal.proposalUrl} target="_blank" rel="noreferrer">
          <BsFillLightningFill />
        </a>
        {proposal.communityUrl && (
          <a href={proposal.communityUrl} target="_blank" rel="noreferrer">
            <VscCommentDiscussion />
          </a>
        )}
        {proposal.githubUrl && (
          <a href={proposal.githubUrl} target="_blank" rel="noreferrer">
            <AiOutlineGithub />
          </a>
        )}
      </div> */}
      {voted ? <FaVoteYea /> : "-"}
      {expanded && (
        <div className="col-start-2">
          {
            <div className="grid grid-flow-col justify-items-center mb-4">
              <a
                href={proposal.proposalUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center text-sm underline"
              >
                <BsFillLightningFill className="mr-1" /> Snapshot voting
              </a>
              {proposal.communityUrl && (
                <a
                  href={proposal.communityUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center text-sm underline"
                >
                  <VscCommentDiscussion className="mr-2" /> AirSwap forum
                  discussion
                </a>
              )}
              {proposal.githubUrl && (
                <a
                  href={proposal.githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center text-sm underline"
                >
                  <AiOutlineGithub className="mr-2" /> GitHub discussion
                </a>
              )}
            </div>
          }
          <ReactMarkdown className="prose-sm text-gray-600">
            {proposal.body}
          </ReactMarkdown>
          {isCompleted && (
            <div className="flex-col mt-4">
              <h4 className="font-semibold text-sm mb-2">Voting overview</h4>
              <div className="flex w-full h-2">
                <div
                  style={{ flex: proposal.votes.Yes.points || "0" }}
                  className="bg-green-700 rounded-l-sm"
                >
                  &nbsp;
                </div>
                <div
                  style={{ flex: proposal.votes.No.points || "0" }}
                  className="bg-red-700 rounded-r-sm"
                >
                  &nbsp;
                </div>
              </div>
              <div
                className="grid text-xs justify-items-end mt-1"
                style={{ gridTemplateColumns: "repeat(3, auto)" }}
              >
                <div className="justify-self-start">Yes</div>
                <div>
                  {utils.commify(proposal.votes.Yes.points || "0")} points
                </div>
                <div> ({utils.commify(proposal.votes.Yes.voters)} voters)</div>
                <div className="justify-self-start">No</div>
                <div>
                  {utils.commify(proposal.votes.No.points || "0")} points
                </div>
                <div> ({utils.commify(proposal.votes.No.voters)} voters)</div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProposalListItem;
