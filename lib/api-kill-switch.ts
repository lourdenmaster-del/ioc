/** When IOC_API_OFF=1|true, IOC API routes return 503. */
export function isApiDisabled(): boolean {
  const v = process.env.IOC_API_OFF?.trim();
  return v === "1" || v === "true";
}

export function killSwitchResponse(): Response | null {
  if (!isApiDisabled()) return null;
  return Response.json(
    { disabled: true, reason: "maintenance", error: "IOC_API_OFF" },
    { status: 503 }
  );
}
