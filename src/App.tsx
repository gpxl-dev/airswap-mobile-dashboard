import { useCallback, useState } from "react";
import ReactMarkdown from "react-markdown";
import classNames from "classnames";
import { FaVoteYea } from "react-icons/fa";
import { VscCommentDiscussion } from "react-icons/vsc";
import { AiOutlineGithub, AiOutlineLoading } from "react-icons/ai";
import { GoChevronRight } from "react-icons/go";
import { FaSearchDollar } from "react-icons/fa";
import useProposals from "./Hooks/useProposals";
import ASTBalance from "./Components/ASTBalance";

function App() {
  const [addressFieldValue, setAddressFieldValue] = useState<string>(
    localStorage.astDashboardDefaultAddress
  );
  const [balanceAddress, setBalanceAddress] = useState<string>(
    localStorage.astDashboardDefaultAddress
  );
  const [balanceLoading, setBalanceLoading] = useState<boolean>(
    !!localStorage.astDashboardDefaultAddress
  );
  const onLoadStart = useCallback(() => {
    setBalanceLoading(true);
  }, []);
  const onLoadComplete = useCallback(() => {
    setBalanceLoading(false);
  }, []);
  const [expanded, setExpanded] = useState<string[]>([]);
  const [showConfirmDefaultChange, setShowConfirmDefaultChange] = useState<
    "set" | "unset" | null
  >(null);

  const isNotDefaultAddress =
    balanceAddress &&
    localStorage.astDashboardDefaultAddress !== balanceAddress;
  const isDefaultAddress =
    balanceAddress &&
    localStorage.astDashboardDefaultAddress === balanceAddress;

  const proposals = useProposals();

  return (
    <div className="flex flex-col h-full items-center justify-center p-4 max-w-lg mx-auto">
      <h1 className="font-bold text-lg">
        Airswap balance & voting status proof of concept
      </h1>
      <div className="flex flex-col my-2">
        <label htmlFor="address" className="font-semibold uppercase text-sm">
          <div className="flex justify-between items-center">
            Wallet address
            {(isDefaultAddress || showConfirmDefaultChange === "unset") &&
              showConfirmDefaultChange !== "set" && (
                <button
                  className={classNames(
                    "relative text-xs text-airswapblue underline focus:outline-none"
                  )}
                  onClick={() => {
                    if (showConfirmDefaultChange === "unset") return;
                    setShowConfirmDefaultChange("unset");
                    setTimeout(() => setShowConfirmDefaultChange(null), 2500);
                    localStorage.astDashboardDefaultAddress = "";
                  }}
                >
                  <span
                    className={
                      showConfirmDefaultChange === "unset" ? "opacity-0" : ""
                    }
                  >
                    clear default address
                  </span>
                  <span
                    className={classNames(
                      "absolute inset-0 pointer-events-none opacity-0 transition-opacity",
                      "text-right",
                      showConfirmDefaultChange === "unset" && "opacity-100"
                    )}
                  >
                    default cleared
                  </span>
                </button>
              )}
          </div>
        </label>
        <div className="flex border border-black rounded-sm">
          <input
            name="address"
            autoComplete="none"
            className="p-2 w-96 font-mono text-sm text-center"
            style={{ maxWidth: "80vw" }}
            id="address"
            value={addressFieldValue}
            onChange={(e) => {
              setAddressFieldValue(e.target.value);
              setBalanceAddress("");
            }}
          />
          <button
            type="button"
            disabled={!addressFieldValue}
            className="text-white bg-airswapblue text-lg px-2 disabled:opacity-50"
            onClick={() => {
              if (balanceLoading) return;
              setBalanceAddress(addressFieldValue);
              setBalanceLoading(true);
            }}
          >
            {balanceLoading ? (
              <AiOutlineLoading className="animate-spin" />
            ) : (
              <FaSearchDollar />
            )}
          </button>
        </div>
        {(isNotDefaultAddress || showConfirmDefaultChange === "set") &&
          showConfirmDefaultChange !== "unset" && (
            <button
              className={classNames(
                "relative -mb-4 text-xs text-airswapblue underline focus:outline-none"
              )}
              onClick={() => {
                if (showConfirmDefaultChange === "set") return;
                setShowConfirmDefaultChange("set");
                setTimeout(() => setShowConfirmDefaultChange(null), 2500);
                localStorage.astDashboardDefaultAddress = balanceAddress;
              }}
            >
              <span
                className={
                  showConfirmDefaultChange === "set" ? "opacity-0" : ""
                }
              >
                save as default address for this browser
              </span>
              <span
                className={classNames(
                  "inset-0 absolute pointer-events-none opacity-0 transition-opacity",
                  showConfirmDefaultChange === "set" && "opacity-100"
                )}
              >
                Default address saved
              </span>
            </button>
          )}
        {}
      </div>
      <ASTBalance
        className="mt-6"
        address={balanceAddress}
        onLoadStart={onLoadStart}
        onLoadComplete={onLoadComplete}
      />
      {!proposals ? (
        "Loading proposals"
      ) : (
        <div
          className="grid gap-4 items-center my-8"
          style={{
            gridTemplateColumns: "auto auto 2rem 2rem",
          }}
        >
          {proposals.map((proposal) => (
            <div className="contents">
              <button
                className={classNames(
                  "p-4 -m-4",
                  "cursor-pointer select-none focus:outline-none",
                  "transition-transform duration-150 transform rotate-0",
                  expanded.includes(proposal.id) ? "rotate-90" : ""
                )}
                style={{
                  WebkitTapHighlightColor: "transparent",
                }}
                onClick={() => {
                  setExpanded((prev) =>
                    prev.includes(proposal.id)
                      ? prev.filter((id) => id !== proposal.id)
                      : prev.concat([proposal.id])
                  );
                }}
              >
                <GoChevronRight />
              </button>
              <div
                onClick={() => {
                  setExpanded((prev) =>
                    prev.includes(proposal.id)
                      ? prev.filter((id) => id !== proposal.id)
                      : prev.concat([proposal.id])
                  );
                }}
              >
                {proposal.name}
              </div>
              <div className="grid grid-rows-1 gap-2">
                {proposal.communityUrl && (
                  <a
                    href={proposal.communityUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <VscCommentDiscussion />
                  </a>
                )}
                {proposal.githubUrl && (
                  <a href={proposal.githubUrl} target="_blank" rel="noreferrer">
                    <AiOutlineGithub />
                  </a>
                )}
              </div>
              {proposal.voters.includes(addressFieldValue) ? (
                <FaVoteYea />
              ) : (
                "-"
              )}
              {expanded.includes(proposal.id) && (
                <div className="col-span-3 col-start-2">
                  <ReactMarkdown className="prose text-gray-600">
                    {proposal.body}
                  </ReactMarkdown>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;
