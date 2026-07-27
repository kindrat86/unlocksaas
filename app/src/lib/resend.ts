import { Resend } from "resend";

let _resend: Resend | null = null;

/**
 * The owner's universal BCC — EVERY email the portfolio sends, from any domain,
 * always BCCs this address so there is a complete copy of every outbound
 * message. Applied here so all 14 dispatch call sites get it without per-site
 * changes.
 */
const ALWAYS_BCC = "sales@sipiteno.com";

/**
 * Wrapped Resend client whose `emails.send` ALWAYS injects the BCC. Returns the
 * same Resend instance otherwise — `emails.create`, batching, etc. all pass
 * through. The only intercepted method is `send`, which merges the BCC into the
 * payload's `bcc` array (dedup, case-insensitive).
 */
function withAutoBcc(resend: Resend): Resend {
  const origSend = resend.emails.send.bind(resend.emails);
  const wrappedSend = async (payload: any) => {
    const bcc = Array.isArray(payload.bcc) ? payload.bcc : payload.bcc ? [payload.bcc] : [];
    const merged = Array.from(new Set([...bcc.map(String), ALWAYS_BCC]));
    return origSend({ ...payload, bcc: merged });
  };
  // Proxy so every other property/method passes through untouched.
  return new Proxy(resend, {
    get(target, prop) {
      if (prop === "emails") {
        return new Proxy(target.emails, {
          get(ep, epProp) {
            if (epProp === "send") return wrappedSend;
            const v = (target.emails as any)[epProp];
            return typeof v === "function" ? v.bind(target.emails) : v;
          },
        });
      }
      const v = (target as any)[prop];
      return typeof v === "function" ? v.bind(target) : v;
    },
  });
}

export function getResend(): Resend {
  if (!_resend) {
    const raw = new Resend(process.env.RESEND_API_KEY!);
    _resend = withAutoBcc(raw);
  }
  return _resend;
}

/**
 * Canonical From address for all customer-facing email.
 */
export const FROM_ADDRESS =
  process.env.RESEND_FROM ?? "Maryan from UnlockSaaS <maryan@unlocksaas.com>";

export const REPLY_TO = "maryan@unlocksaas.com";
