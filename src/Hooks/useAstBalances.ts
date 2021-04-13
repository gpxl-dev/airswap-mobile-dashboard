import { Contract, BigNumber } from "ethers";
import ethersProvider from "../ethers";
import abi from "erc-20-abi";
import { useEffect, useState } from "react";

const astContract = new Contract(
  "0x27054b13b1b798b345b591a4d22e6562d47ea75a",
  abi,
  ethersProvider
);
const sAstContracts = [
  new Contract(
    "0x579120871266ccd8de6c85ef59e2ff6743e7cd15",
    abi,
    ethersProvider
  ),
  new Contract(
    "0xa4C5107184a88D4B324Dd10D98a11dd8037823Fe",
    abi,
    ethersProvider
  ),
  new Contract(
    "0x704c5818b574358dfb5225563852639151a943ec",
    abi,
    ethersProvider
  ),
];
type AstBalances = {
  // null when loading.
  ast: BigNumber | null;
  sAst: BigNumber | null;
};

const useAstBalances = (walletAddress: string | null) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [balances, setBalances] = useState<AstBalances>({
    ast: null,
    sAst: null,
  });
  useEffect(() => {
    const getBalances = async () => {
      setLoading(true);
      try {
        const astPromise: Promise<BigNumber> = astContract.balanceOf(
          walletAddress
        );
        const sAstPromises: Promise<BigNumber>[] = sAstContracts.map(
          (contract) => contract.balanceOf(walletAddress)
        );
        const [ast, ...sAst] = await Promise.all([astPromise, ...sAstPromises]);
        setBalances({
          ast,
          sAst: sAst.reduce((accumulator: BigNumber | null, bal) => {
            if (accumulator == null) return bal;
            return accumulator.add(bal);
          }, null),
        });
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    if (walletAddress) {
      getBalances();
    } else {
      setBalances({
        ast: null,
        sAst: null,
      });
    }
  }, [walletAddress]);

  return {
    loading,
    balances,
  };
};

export default useAstBalances;
