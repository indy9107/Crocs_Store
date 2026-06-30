// Image upload/delete through our Cloudflare Worker backend (which talks to R2).
// No R2 S3 keys reach the browser. Same exported signatures as before so call
// sites don't change.
const BASE = import.meta.env.VITE_API_BASE_URL;

// ดึง object key กลับมาจาก public URL (เพื่อส่งให้ Worker ลบ) — key คือ segment
// สุดท้ายของ path ของ R2 public URL
export function getStoragePathFromPublicUrl(url) {
  if (!url) return null;
  try {
    const u = new URL(url);
    const seg = u.pathname.split("/").filter(Boolean);
    return seg.length > 0 ? seg[seg.length - 1] : null;
  } catch {
    return null;
  }
}

// ดาวน์โหลดไฟล์รูปจาก R2 ผ่าน Worker backend (same-origin CORS) แทนการ fetch
// จาก R2 public URL ตรงๆ ซึ่งอาจถูก browser บล็อกด้วย CORS หรือโดน rate-limit
// ของ r2.dev คืน Blob ให้ใช้สร้าง File สำหรับแชร์/ดาวน์โหลดได้ทันที
export async function fetchImageBlob(publicUrl) {
  const key = getStoragePathFromPublicUrl(publicUrl);
  if (!key) throw new Error("invalid image url");
  const res = await fetch(`${BASE}/images/${encodeURIComponent(key)}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.blob();
}

export async function uploadImage(file, prefix = "img") {
  const res = await fetch(`${BASE}/images`, {
    method: "POST",
    headers: {
      "Content-Type": file.type || "application/octet-stream",
      "X-Image-Prefix": prefix,
    },
    body: file,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);
  return data.url;
}

export async function removeImagesByPaths(paths) {
  const cleanPaths = paths.filter(Boolean);
  if (cleanPaths.length === 0) return { error: null };

  try {
    const res = await fetch(`${BASE}/images`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ keys: cleanPaths }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);
    return { error: null };
  } catch (error) {
    return { error };
  }
}
