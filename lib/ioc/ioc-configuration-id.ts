import { createHash } from "crypto";
import { IOC_MACHINE_VERSION } from "@/lib/ioc/ioc-machine-protocol";

/**
 * Opaque, deterministic id for machine/API consumers. Maps 1:1 with internal IOC
 * keys derived from birthdate; does not expose branded internal labels.
 */
export function configurationIdForInternalArchetype(internalKey: string): string {
  const h = createHash("sha256")
    .update(`ligs.ioc|${IOC_MACHINE_VERSION}|${internalKey}`, "utf8")
    .digest("hex");
  return `ioc_cfg_${h.slice(0, 20)}`;
}
