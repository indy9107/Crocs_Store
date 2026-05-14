// บีบอัดและย่อขนาดรูปภาพก่อนอัปโหลด ลดทั้งเวลา/แบนด์วิดท์ และพื้นที่เก็บใน Supabase
// ใช้ Canvas API ไม่ต้องเพิ่ม dependency

const DEFAULTS = {
  maxWidth: 1600,
  maxHeight: 1600,
  quality: 0.85,
  mimeType: "image/jpeg",
};

export async function compressImage(file, options = {}) {
  if (!(file instanceof File) && !(file instanceof Blob)) return file;
  if (!file.type?.startsWith("image/")) return file;

  const { maxWidth, maxHeight, quality, mimeType } = { ...DEFAULTS, ...options };

  // imageOrientation: "from-image" → รองรับ EXIF rotation จากกล้องมือถือ
  let bitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    return file; // ถ้าเบราว์เซอร์ decode ไฟล์นี้ไม่ได้ ส่งไฟล์เดิมไปแทน
  }

  const ratio = Math.min(
    maxWidth / bitmap.width,
    maxHeight / bitmap.height,
    1, // ห้ามขยายภาพให้ใหญ่กว่าเดิม
  );
  const targetWidth = Math.round(bitmap.width * ratio);
  const targetHeight = Math.round(bitmap.height * ratio);

  const canvas = document.createElement("canvas");
  canvas.width = targetWidth;
  canvas.height = targetHeight;

  const ctx = canvas.getContext("2d");
  // เติมพื้นขาวก่อนวาด เผื่อต้นฉบับเป็น PNG โปร่งแสงที่จะถูกแปลงเป็น JPEG
  if (mimeType === "image/jpeg") {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, targetWidth, targetHeight);
  }
  ctx.drawImage(bitmap, 0, 0, targetWidth, targetHeight);
  bitmap.close?.();

  const blob = await new Promise((resolve) =>
    canvas.toBlob(resolve, mimeType, quality),
  );
  if (!blob) return file;

  // ถ้าหลังบีบอัดแล้วใหญ่กว่าเดิม (เช่นภาพต้นฉบับเล็กมาก/บีบมาแล้ว) → ใช้ของเดิม
  if (blob.size >= file.size) return file;

  const ext = mimeType === "image/jpeg" ? "jpg" : mimeType.split("/")[1];
  const baseName = (file.name || "image").replace(/\.[^.]+$/, "");
  return new File([blob], `${baseName}.${ext}`, {
    type: mimeType,
    lastModified: Date.now(),
  });
}

export async function compressImages(files, options = {}) {
  return Promise.all(
    Array.from(files).map((file) => compressImage(file, options)),
  );
}
