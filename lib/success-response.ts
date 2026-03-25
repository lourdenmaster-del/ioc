import { NextResponse } from "next/server";
import { log } from "@/lib/log";

export function successResponse<T>(
  status: number,
  data: T,
  requestId: string
): NextResponse {
  log("info", "response", { requestId, status });
  return NextResponse.json({ status: "ok", requestId, data }, { status });
}
