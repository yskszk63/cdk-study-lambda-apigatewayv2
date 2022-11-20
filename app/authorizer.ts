export async function handler(event: unknown): Promise<unknown> {
  console.log(event);
  return {
    isAuthorized: true,
  }
}
