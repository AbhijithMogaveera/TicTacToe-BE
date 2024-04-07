export async function delay(delay: number) {
  return new Promise((accept, reject) => setTimeout(accept, delay));
}
