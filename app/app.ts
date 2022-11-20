export async function handler(event: unknown): Promise<unknown> {
  console.log("OK!!");
  return {
    isBase64Encoded: false,
    statusCode: 200,
    body: JSON.stringify(event),
    headers: {
      "content-type": "application/json",
    },
  }
}
