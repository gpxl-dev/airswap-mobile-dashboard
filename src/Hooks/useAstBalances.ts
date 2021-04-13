import { Contract, BigNumber } from "ethers";
import ethersProvider from "../ethers";
import abi from "erc-20-abi";
import { useEffect, useState } from "react";

const astContract = new Contract(
  "0x27054b13b1b798b345b591a4d22e6562d47ea75a",
  abi,
  ethersProvider
);
const sAstContract = new Contract(
  "0x579120871266ccd8De6c85EF59E2fF6743E7CD15",
  abi,
  ethersProvider
);
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
        const sAstPromise: Promise<BigNumber> = sAstContract.balanceOf(
          walletAddress
        );
        const [ast, sAst] = await Promise.all([astPromise, sAstPromise]);
        setBalances({
          ast,
          sAst,
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
