// ImageKit delivery is URL-based, so no SDK is needed to render optimized images.
// Pass any ik.imagekit.io URL through with a transform; local/other URLs pass unchanged.
export function ikImage(src, tr = "w-600,q-80,f-auto") {
  const base = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT;
  if (!src || !base || !src.startsWith("http") || !src.includes("ik.imagekit.io")) {
    return src;
  }
  const path = new URL(src).pathname;
  return `${base.replace(/\/$/, "")}${path}?tr=${tr}`;
}

// Signed client-side upload: fetch short-lived auth params, then POST the file to ImageKit.
// ponytail: single attempt, no retry/resize — add upload retry or an `tr` transform if uploads get flaky or files need normalizing.
export async function uploadImage(file) {
  const authRes = await fetch("/api/imagekit/auth");
  if (!authRes.ok) throw new Error("Could not get ImageKit upload credentials");
  const { token, expire, signature } = await authRes.json();

  const form = new FormData();
  form.append("file", file);
  form.append("fileName", file.name);
  form.append("publicKey", process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY);
  form.append("token", token);
  form.append("expire", expire);
  form.append("signature", signature);

  const res = await fetch("https://upload.imagekit.io/api/v1/files/upload", {
    method: "POST",
    body: form,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.message || "ImageKit upload failed");
  }

  const data = await res.json();
  return data.url;
}
