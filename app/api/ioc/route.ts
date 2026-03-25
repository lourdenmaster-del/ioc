import { NextResponse } from "next/server";
import { killSwitchResponse } from "@/lib/api-kill-switch";
import { getArchetypeFromBirthdate } from "@/lib/ioc/archetype-from-birthdate";
import { getIocTextForArchetype } from "@/lib/ioc/ioc-map";
import { buildIocFreeBlock, normalizeIocBlockForClipboard } from "@/lib/ioc/ioc-split";

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
  return NextResponse.json({ archetype, iocFree });
}
