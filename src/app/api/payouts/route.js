import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const dbPath = path.join(process.cwd(), "data", "payouts.json");

function readPayouts() {
  try {
    if (fs.existsSync(dbPath)) {
      return JSON.parse(fs.readFileSync(dbPath, "utf-8"));
    }
  } catch (err) {
    console.error("Error reading payouts JSON:", err);
  }
  return [];
}

function writePayouts(data) {
  try {
    const dir = path.dirname(dbPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Error writing payouts JSON:", err);
  }
}

export async function GET() {
  const data = readPayouts();
  return NextResponse.json(data);
}

export async function POST(req) {
  try {
    const body = await req.json();
    const data = readPayouts();
    
    // Check if it already exists (update)
    const existingIdx = data.findIndex(p => p.id === body.id);
    if (existingIdx >= 0) {
      data[existingIdx] = { ...data[existingIdx], ...body };
    } else {
      data.unshift(body);
    }
    
    writePayouts(data);
    return NextResponse.json({ success: true, payout: body });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
