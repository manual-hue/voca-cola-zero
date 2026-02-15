let _parsed: Record<string, string> | undefined;

export function getServiceAccountCredentials(): Record<string, string> {
  if (_parsed) return _parsed;
  const base64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
  if (!base64) throw new Error("FIREBASE_SERVICE_ACCOUNT_BASE64 env var is not set");
  _parsed = JSON.parse(Buffer.from(base64, "base64").toString("utf-8"));
  return _parsed!;
}
