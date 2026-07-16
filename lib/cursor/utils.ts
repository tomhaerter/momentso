// TODO: replace for browser compatibility
export function encodeApiKey(apiKey: string): string {
  return Buffer.from(`${apiKey}:`).toString("base64")
}
