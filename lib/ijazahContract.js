import { Contract } from "ethers";
import { IJAZAH_ABI } from "./ijazahAbi";

export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

export function getIjazahContract(providerOrSigner) {
  if (!CONTRACT_ADDRESS) {
    throw new Error("NEXT_PUBLIC_CONTRACT_ADDRESS belum diset");
  }
  return new Contract(CONTRACT_ADDRESS, IJAZAH_ABI, providerOrSigner);
}
