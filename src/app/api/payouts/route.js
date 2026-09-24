import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ error: "Deprecated in favor of Supabase direct fetch" }, { status: 410 });
}

export async function POST() {
  return NextResponse.json({ error: "Deprecated in favor of Supabase direct mutation" }, { status: 410 });
}
