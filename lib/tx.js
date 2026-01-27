export async function sendTx(txPromise, { onHash } = {}) {
  const tx = await txPromise;
  if (onHash) onHash(tx.hash);
  const receipt = await tx.wait();
  return { tx, receipt };
}
