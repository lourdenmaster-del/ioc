import { NextResponse } from "next/server";
import { killSwitchResponse } from "@/lib/api-kill-switch";
import { log } from "@/lib/log";
import { getArchetypeFromBirthdate } from "@/lib/ioc/archetype-from-birthdate";
import { configurationIdForInternalArchetype } from "@/lib/ioc/ioc-configuration-id";
import { buildIocLiteProtocolResponse } from "@/lib/ioc/ioc-machine-protocol";
import { getIocTextForArchetype } from "@/lib/ioc/ioc-map";
import { buildIocFreeBlock, normalizeIocBlockForClipboard } from "@/lib/ioc/ioc-split";

export async function GET(request: Request) {
  const kill = killSwitchResponse();
  if (kill) return kill;

  const { searchParams } = new URL(request.url);
  const birthdate = searchParams.get("birthdate")?.trim() ?? "";
  const archetype = getArchetypeFromBirthdate(birthdate);
  const full = getIocTextForArchetype(archetype);
  const iocFree = normalizeIocBlockForClipboard(buildIocFreeBlock(full));
  log("info", "ioc_machine_get", {
    endpoint: "/api/ioc",
    path: "machine",
    success: true,
    archetype,
  });
  const configuration_id = configurationIdForInternalArchetype(archetype);
  return NextResponse.json(buildIocLiteProtocolResponse({ configuration_id, iocFree }));
}

export async function POST(request: Request) {
  const kill = killSwitchResponse();
  if (kill) return kill;

  let body: { birthdate?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const birthdate = typeof body?.birthdate === "string" ? body.birthdate : "";
  const archetype = getArchetypeFromBirthdate(birthdate);
  const full = getIocTextForArchetype(archetype);
  const iocFree = normalizeIocBlockForClipboard(buildIocFreeBlock(full));
  log("info", "ioc_generate_free", {
    endpoint: "/api/ioc",
    path: "human",
    success: true,
    archetype,
  });
  return NextResponse.json({ archetype, iocFree });
}
