import { utils } from "ethers";
import { FC, useEffect } from "react";
import { AiOutlineLoading } from "react-icons/ai";
import airswapLogo from "../svg/airswap.svg";
import useAstBalances from "../Hooks/useAstBalances";
import classNames from "classnames";

const ASTBalance: FC<{
  address: string | null;
  onLoadComplete?: () => void;
  onLoadStart?: () => void;
  className?: string;
}> = ({ address, onLoadStart, onLoadComplete, className }) => {
  const { loading, balances } = useAstBalances(address);

  useEffect(() => {
    if (!loading && onLoadComplete) {
      onLoadComplete();
    } else if (loading && onLoadStart) {
      onLoadStart();
    }
  }, [loading, onLoadComplete, onLoadStart]);

  const hasBalances = balances.sAst && balances.ast;
  const total = hasBalances && balances.ast!.add(balances.sAst!);
  const percentStaked =
    hasBalances && (balances.sAst!.toNumber() / total!.toNumber()) * 100;

  return (
    <div className={classNames("flex items-center", className)}>
      <div className="flex flex-col">
        <div className="text-base">
          {/* Wallet balance:{" "} */}
          <div className="flex items-center">
            <img
              src={airswapLogo}
              className="w-4 h-4 mr-1"
              alt="airswap logo"
            />
            {hasBalances ? (
              <>
                <span className="font-normal">
                  {utils.commify(
                    parseFloat(utils.formatUnits(total!.toString(), 4)).toFixed(
                      1
                    )
                  )}{" "}
                  (
                </span>
                <span className="font-normal">
                  {(percentStaked || 0).toFixed(0)}% staked)
                </span>
              </>
            ) : loading ? (
              <AiOutlineLoading className="animate-spin" />
            ) : (
              "--"
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ASTBalance;
