import { useCallback, useState, Fragment } from "react";
import classNames from "classnames";
import { AiOutlineLoading } from "react-icons/ai";
import { FaSearchDollar } from "react-icons/fa";
import useProposals from "./Hooks/useProposals";
import ASTBalance from "./Components/ASTBalance";
import ProposalListItem from "./Components/ProposalListItem";

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

  const toggleExpanded = (proposalId: string) => {
    setExpanded((prev) =>
      prev.includes(proposalId)
        ? prev.filter((id) => id !== proposalId)
        : prev.concat([proposalId])
    );
  };

  const isNotDefaultAddress =
    balanceAddress &&
    localStorage.astDashboardDefaultAddress !== balanceAddress;
  const isDefaultAddress =
    balanceAddress &&
    localStorage.astDashboardDefaultAddress === balanceAddress;

  const proposals = useProposals();

  const categorisedProposals = [
    {
      label: "active",
      proposals: proposals?.filter((p) => p.active),
    },
    {
      label: "upcoming",
      proposals: proposals?.filter((p) => p.start * 1000 > Date.now()),
    },
    {
      label: "past",
      proposals: proposals?.filter(
        (p) => p.end * 1000 < Date.now() && p.voters.length
      ),
    },
  ];

  return (
    <div className="flex flex-col h-full items-center justify-center p-4 max-w-lg mx-auto">
      <h1 className="font-bold text-lg mb-4">
        AirSwap balance & voting status
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
      <h1 className="font-bold text-base mt-6 mb-4">
        AirSwap improvement proposals
      </h1>
      {!proposals ? (
        "Loading proposals"
      ) : (
        <div
          className="grid gap-4 items-center"
          style={{
            gridTemplateColumns: "auto auto 2rem",
          }}
        >
          {categorisedProposals.map(({ label, proposals }) => {
            if (!proposals?.length && label === "upcoming") return null;
            return (
              <Fragment key={label}>
                <h3 className="col-span-full col-start-1 uppercase font-bold text-center text-sm border-t border-b border-gray-300 py-3">
                  {label}
                </h3>
                {proposals?.length ? (
                  proposals.map((proposal) => (
                    <ProposalListItem
                      key={proposal.id}
                      proposal={proposal}
                      expanded={expanded.includes(proposal.id)}
                      voted={proposal.voters.includes(balanceAddress)}
                      onToggleExpanded={() => toggleExpanded(proposal.id)}
                    />
                  ))
                ) : (
                  <div className="col-span-full col-start-1 italic opacity-60 text-center my-4">{`There are currently no ${label} proposals`}</div>
                )}
              </Fragment>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default App;
