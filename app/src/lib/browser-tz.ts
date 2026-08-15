// Browser-reported IANA timezone (e.g. "Europe/Athens"), captured at submit
// time. Sent as `tz` so the drip engine can schedule sends during THIS lead's
// local 9am-6pm rather than the server's clock.
export function browserTimezone(): string | undefined {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return typeof tz === "string" && tz.includes("/") ? tz : undefined;
  } catch {
    return undefined;
  }
}
