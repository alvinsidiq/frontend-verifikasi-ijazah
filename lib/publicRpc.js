import { JsonRpcProvider } from "ethers";
import { MONAD_TESTNET } from "./monad";

export function getPublicProvider() {
  return new JsonRpcProvider(MONAD_TESTNET.rpcUrls[0]);
}
