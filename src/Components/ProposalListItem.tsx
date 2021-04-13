import classNames from "classnames";
import { FC } from "react";
import { AiOutlineGithub } from "react-icons/ai";
import { FaVoteYea } from "react-icons/fa";
import { GoChevronRight } from "react-icons/go";
import { VscCommentDiscussion } from "react-icons/vsc";
import ReactMarkdown from "react-markdown";
import { ReducedProposal } from "../Hooks/useProposals";

const ProposalListItem: FC<{
  proposal: ReducedProposal;
  expanded: boolean;
  voted: boolean;
  onToggleExpanded: () => void;
}> = ({ proposal, expanded, voted, onToggleExpanded }) => {
  return (
    <div className="contents">
      <button
        className={classNames(
          "p-4 -m-4",
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
      <div onClick={onToggleExpanded}>{proposal.name}</div>
      <div className="grid grid-rows-1 gap-2">
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
      </div>
      {voted ? <FaVoteYea /> : "-"}
      {expanded && (
        <div className="col-span-3 col-start-2">
          <ReactMarkdown className="prose text-gray-600">
            {proposal.body}
          </ReactMarkdown>
        </div>
      )}
    </div>
  );
};

export default ProposalListItem;
