// lib/metamask.js
import { MONAD_TESTNET } from "./monad";

export function hasMetaMask() {
  return typeof window !== "undefined" && typeof window.ethereum !== "undefined";
}

export async function ensureMonadNetwork() {
  if (!hasMetaMask()) throw new Error("MetaMask tidak terdeteksi");

  const { ethereum } = window;

  const currentChainId = await ethereum.request({ method: "eth_chainId" });
  if (currentChainId?.toLowerCase() === MONAD_TESTNET.chainIdHex) return;

  try {
    await ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: MONAD_TESTNET.chainIdHex }],
    });
    return;
  } catch (err) {
    const code = err?.code;
    if (code !== 4902) throw err;
  }

  await ethereum.request({
    method: "wallet_addEthereumChain",
    params: [
      {
        chainId: MONAD_TESTNET.chainIdHex,
        chainName: MONAD_TESTNET.chainName,
        rpcUrls: MONAD_TESTNET.rpcUrls,
        nativeCurrency: MONAD_TESTNET.nativeCurrency,
        blockExplorerUrls: MONAD_TESTNET.blockExplorerUrls,
      },
    ],
  });
}

export async function connectWallet() {
  if (!hasMetaMask()) throw new Error("MetaMask tidak terdeteksi");
  const { ethereum } = window;

  const accounts = await ethereum.request({ method: "eth_requestAccounts" });
  const address = accounts?.[0];
  if (!address) throw new Error("Tidak ada account yang dipilih di MetaMask");
  return address;
}
