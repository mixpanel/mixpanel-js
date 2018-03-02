export function sleep(durationMs) {
  return new Promise(resolve => setTimeout(resolve, durationMs));
}

export async function conditionAsync(predicate) {
  let val = await predicate();
  while (!val) {
    await sleep(50);
    val = await predicate();
  }
  return val;
}