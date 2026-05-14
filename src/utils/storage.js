import { supabase } from "../supabaseClient";

const BUCKET = "crocs_images";

export function getStoragePathFromPublicUrl(url) {
  if (!url) return null;
  const parts = url.split(`/${BUCKET}/`);
  return parts.length > 1 ? parts[1] : null;
}

export async function uploadImage(file, prefix = "img") {
  const ext = (file.name?.split(".").pop() || "jpg").toLowerCase();
  const fileName = `${prefix}_${Date.now()}_${Math.random()
    .toString(36)
    .slice(2, 8)}.${ext}`;
  const arrayBuffer = await file.arrayBuffer();

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(fileName, arrayBuffer, { contentType: file.type });
  if (error) throw error;

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(fileName);
  return data.publicUrl;
}

export async function removeImagesByPaths(paths) {
  const cleanPaths = paths.filter(Boolean);
  if (cleanPaths.length === 0) return { error: null };
  return supabase.storage.from(BUCKET).remove(cleanPaths);
}
