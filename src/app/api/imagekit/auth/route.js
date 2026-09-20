import { NextResponse } from "next/server";
import { randomUUID, createHmac } from "node:crypto";

export async function GET() {
  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
  const publicKey = process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY;
  if (!privateKey || !publicKey) {
    return NextResponse.json({ error: "ImageKit keys are not configured" }, { status: 500 });
  }

  const token = randomUUID();
  const expire = Math.floor(Date.now() / 1000) + 600;
  const signature = createHmac("sha1", privateKey).update(token + expire).digest("hex");

  return NextResponse.json({ token, expire, signature });
}
