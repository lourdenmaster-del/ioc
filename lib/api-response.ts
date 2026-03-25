import { NextResponse } from "next/server";
import { log } from "@/lib/log";

export function errorResponse(
  status: number,
  message: string,
  requestId: string
): NextResponse {
  log("info", "response", { requestId, status });
  return NextResponse.json({ error: message }, { status });
}
