"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { BrowserProvider } from "ethers";
import { hasMetaMask, connectWallet, ensureMonadNetwork } from "../lib/metamask";
import { MONAD_TESTNET } from "../lib/monad";

const Web3Context = createContext(null);

export function Web3Provider({ children }) {
  const [isMetaMaskInstalled, setIsMetaMaskInstalled] = useState(false);
  const [address, setAddress] = useState(null);
  const [chainIdHex, setChainIdHex] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    setIsMetaMaskInstalled(hasMetaMask());
    if (!hasMetaMask()) return;

    const { ethereum } = window;

    const updateChain = async () => {
      try {
        const cid = await ethereum.request({ method: "eth_chainId" });
        setChainIdHex(cid);
      } catch {}
    };

    const updateAccounts = async () => {
      try {
        const acc = await ethereum.request({ method: "eth_accounts" });
        setAddress(acc?.[0] || null);
      } catch {}
    };

    updateChain();
    updateAccounts();

    const onChainChanged = (cid) => setChainIdHex(cid);
    const onAccountsChanged = (accs) => setAddress(accs?.[0] || null);

    ethereum.on("chainChanged", onChainChanged);
    ethereum.on("accountsChanged", onAccountsChanged);

    return () => {
      ethereum.removeListener("chainChanged", onChainChanged);
      ethereum.removeListener("accountsChanged", onAccountsChanged);
    };
  }, []);

  const isOnMonad = (chainIdHex || "").toLowerCase() === MONAD_TESTNET.chainIdHex;

  const provider = useMemo(() => {
    if (!hasMetaMask()) return null;
    return new BrowserProvider(window.ethereum);
  }, [address, chainIdHex]);

  const connect = async () => {
    setError("");
    try {
      await ensureMonadNetwork();
      const addr = await connectWallet();
      setAddress(addr);
      const cid = await window.ethereum.request({ method: "eth_chainId" });
      setChainIdHex(cid);
    } catch (e) {
      setError(e?.message || String(e));
    }
  };

  const value = {
    isMetaMaskInstalled,
    address,
    chainIdHex,
    isOnMonad,
    error,
    provider,
    connect,
  };

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>;
}

export function useWeb3() {
  const ctx = useContext(Web3Context);
  if (!ctx) throw new Error("useWeb3 harus dipakai di dalam <Web3Provider />");
  return ctx;
}
