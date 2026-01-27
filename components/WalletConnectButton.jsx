"use client";

import { useWeb3 } from "../context/Web3Context";

export default function WalletConnectButton() {
  const { isMetaMaskInstalled, address, isOnMonad, error, connect } = useWeb3();

  if (!isMetaMaskInstalled) {
    return <div className="text-sm text-red-600">MetaMask belum terpasang</div>;
  }

  return (
    <div className="flex items-center gap-2">
      {address ? (
        <div className="text-sm">
          <span className="font-semibold">Wallet:</span> {address.slice(0, 6)}...
          {address.slice(-4)}
          {!isOnMonad && (
            <span className="ml-2 text-xs text-orange-600">Wrong network</span>
          )}
        </div>
      ) : (
        <div className="text-sm text-gray-600">Wallet belum connect</div>
      )}

      <button
        onClick={connect}
        className="px-3 py-1 rounded bg-black text-white text-sm"
      >
        {address ? "Reconnect" : "Connect Wallet"}
      </button>

      {error && (
        <div className="text-xs text-red-600 max-w-[300px] truncate">{error}</div>
      )}
    </div>
  );
}
