import { NextResponse } from "next/server";

// Zero-dependency liveness probe for the serverless runtime.
export async function GET() {
  return NextResponse.json({ ok: true, node: process.version, time: Date.now() });
}
