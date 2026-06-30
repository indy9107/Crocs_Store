// Cloudflare Worker: backend proxy in front of D1 (database) + R2 (images).
// Browser → this Worker → D1/R2. No secrets reach the browser; auth lives in
// the D1/R2 bindings declared in wrangler.toml.
//
// Endpoints:
//   GET    /shoes          list all shoes (newest first)
//   GET    /shoes/:id      single shoe
//   POST   /shoes          insert {model,price,size,color,image_url,detail_images}
//   PUT    /shoes/:id      update {..fields..}
//   DELETE /shoes          bulk delete {ids:[..]}
//   POST   /images         upload (raw body, Content-Type + X-Image-Prefix) -> {url}
//   DELETE /images         delete {keys:[..]} -> {error}

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS, HEAD",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Image-Prefix",
  "Access-Control-Max-Age": "86400",
};

function json(body, status = 200, extra = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...CORS, ...extra },
  });
}

// detail_images stored as JSON string in D1; parse to array for the client.
function parseRow(row) {
  if (!row) return null;
  let detail_images = [];
  if (row.detail_images) {
    try {
      const parsed = JSON.parse(row.detail_images);
      detail_images = Array.isArray(parsed) ? parsed : [];
    } catch {
      detail_images = [];
    }
  }
  return { ...row, detail_images };
}

const ALLOWED_FIELDS = [
  "model",
  "price",
  "size",
  "color",
  "image_url",
  "detail_images",
];

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const { pathname } = url;
    const method = request.method;

    if (method === "OPTIONS") {
      return new Response(null, { status: 204, headers: CORS });
    }

    try {
      // ---- Shoes ----
      if (pathname === "/shoes" && method === "GET") {
        const { results } = await env.DB.prepare(
          `SELECT * FROM shoes ORDER BY created_at DESC`,
        ).all();
        return json(results.map(parseRow));
      }

      const shoeMatch = pathname.match(/^\/shoes\/([^/]+)$/);
      if (shoeMatch) {
        const id = decodeURIComponent(shoeMatch[1]);

        if (method === "GET") {
          const row = await env.DB.prepare(`SELECT * FROM shoes WHERE id = ?`)
            .bind(id)
            .first();
          return row ? json(parseRow(row)) : json({ error: "not found" }, 404);
        }

        if (method === "PUT") {
          const fields = await request.json();
          const sets = [];
          const params = [];
          for (const key of ALLOWED_FIELDS) {
            if (key in fields) {
              sets.push(`${key} = ?`);
              params.push(
                key === "detail_images"
                  ? JSON.stringify(fields[key] || [])
                  : fields[key],
              );
            }
          }
          if (sets.length === 0) return json({ ok: true });
          params.push(id);
          await env.DB.prepare(
            `UPDATE shoes SET ${sets.join(", ")} WHERE id = ?`,
          )
            .bind(...params)
            .run();
          return json({ ok: true });
        }
      }

      if (pathname === "/shoes" && method === "POST") {
        const b = await request.json();
        const id = crypto.randomUUID();
        await env.DB.prepare(
          `INSERT INTO shoes (id, model, price, size, color, image_url, detail_images)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
        )
          .bind(
            id,
            b.model,
            b.price,
            b.size,
            b.color,
            b.image_url ?? null,
            JSON.stringify(b.detail_images || []),
          )
          .run();
        return json({ id }, 201);
      }

      if (pathname === "/shoes" && method === "DELETE") {
        const { ids } = await request.json();
        if (!Array.isArray(ids) || ids.length === 0) {
          return json({ ok: true });
        }
        const placeholders = ids.map(() => "?").join(", ");
        await env.DB.prepare(`DELETE FROM shoes WHERE id IN (${placeholders})`)
          .bind(...ids)
          .run();
        return json({ ok: true });
      }

      // ---- Images (R2) ----
      // Stream a single object back to the browser. Routed through the Worker
      // (instead of the R2 public URL) so the response always carries CORS
      // headers — the browser can then fetch() the bytes for sharing/download
      // without being blocked. Also avoids R2.dev rate limits in production.
      const imageMatch = pathname.match(/^\/images\/([^/]+)$/);
      if (imageMatch && method === "GET") {
        const key = decodeURIComponent(imageMatch[1]);
        const object = await env.BUCKET.get(key);
        if (!object) return json({ error: "not found" }, 404);
        const headers = new Headers();
        object.writeHttpMetadata(headers);
        headers.set("Cache-Control", "public, max-age=31536000, immutable");
        headers.set("ETag", object.httpEtag);
        return new Response(object.body, {
          status: 200,
          headers: { ...CORS, ...Object.fromEntries(headers) },
        });
      }

      if (pathname === "/images" && method === "POST") {
        const contentType =
          request.headers.get("Content-Type") || "application/octet-stream";
        const prefix = request.headers.get("X-Image-Prefix") || "img";
        const ext = contentTypeToExt(contentType);
        const key = `${prefix}_${Date.now()}_${Math.random()
          .toString(36)
          .slice(2, 8)}.${ext}`;

        const body = await request.arrayBuffer();
        await env.BUCKET.put(key, body, {
          httpMetadata: { contentType },
        });

        const base = env.R2_PUBLIC_URL?.endsWith("/")
          ? env.R2_PUBLIC_URL
          : `${env.R2_PUBLIC_URL || ""}/`;
        return json({ url: `${base}${key}` }, 201);
      }

      if (pathname === "/images" && method === "DELETE") {
        const { keys } = await request.json();
        const clean = (keys || []).filter(Boolean);
        if (clean.length === 0) return json({ error: null });
        try {
          await Promise.all(clean.map((k) => env.BUCKET.delete(k)));
          return json({ error: null });
        } catch (error) {
          return json({ error: { message: error.message } });
        }
      }

      return json({ error: "not found" }, 404);
    } catch (error) {
      return json({ error: error.message }, 500);
    }
  },
};

function contentTypeToExt(contentType) {
  const map = {
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
    "image/avif": "avif",
  };
  return map[contentType.toLowerCase()] || "bin";
}
