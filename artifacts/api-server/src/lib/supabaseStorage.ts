/**
 * Photo storage on Supabase Storage (used when SUPABASE_URL and
 * SUPABASE_SERVICE_ROLE_KEY are set; otherwise the Replit object storage is used).
 *
 * Flow: the API creates a one-time signed upload URL, the browser PUTs the
 * file straight to Supabase, and the photo is then served from the bucket's
 * public URL via GET /api/storage/objects/<path> (a redirect).
 */
import { randomUUID } from "node:crypto";

const BUCKET = process.env.SUPABASE_STORAGE_BUCKET || "house-photos";
const MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/heic", "image/heif"];

export function isSupabaseStorageConfigured(): boolean {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

function baseUrl(): string {
  return process.env.SUPABASE_URL!.replace(/\/+$/, "");
}

function headers(extra: Record<string, string> = {}): Record<string, string> {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return { apikey: key, Authorization: `Bearer ${key}`, ...extra };
}

export class UploadValidationError extends Error {}

let bucketReady: Promise<void> | null = null;

/** Create the public photo bucket on first use if it doesn't exist yet. */
function ensureBucket(): Promise<void> {
  bucketReady ??= (async () => {
    const res = await fetch(`${baseUrl()}/storage/v1/bucket/${BUCKET}`, { headers: headers() });
    if (res.ok) return;
    const create = await fetch(`${baseUrl()}/storage/v1/bucket`, {
      method: "POST",
      headers: headers({ "Content-Type": "application/json" }),
      body: JSON.stringify({
        id: BUCKET,
        name: BUCKET,
        public: true,
        file_size_limit: MAX_BYTES,
        allowed_mime_types: ALLOWED_TYPES,
      }),
    });
    if (!create.ok && create.status !== 409) {
      throw new Error(`Could not create storage bucket: ${create.status} ${await create.text()}`);
    }
  })().catch((err) => {
    bucketReady = null; // retry next time
    throw err;
  });
  return bucketReady;
}

const EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/gif": "gif", "image/heic": "heic", "image/heif": "heif",
};

/** Returns the signed URL the browser uploads to, and the path to save on the listing. */
export async function createPhotoUpload(opts: { contentType: string; size: number; userId: string }) {
  if (!ALLOWED_TYPES.includes(opts.contentType)) {
    throw new UploadValidationError("Only photos can be uploaded (JPG, PNG, WebP, GIF, HEIC)");
  }
  if (opts.size > MAX_BYTES) {
    throw new UploadValidationError("Photo is too large (maximum 10 MB)");
  }
  await ensureBucket();

  const owner = opts.userId.replace(/[^a-zA-Z0-9_-]/g, "");
  const objectKey = `houses/${owner}/${randomUUID()}.${EXTENSIONS[opts.contentType]}`;

  const res = await fetch(`${baseUrl()}/storage/v1/object/upload/sign/${BUCKET}/${objectKey}`, {
    method: "POST",
    headers: headers({ "Content-Type": "application/json" }),
    body: "{}",
  });
  if (!res.ok) {
    throw new Error(`Could not create upload URL: ${res.status} ${await res.text()}`);
  }
  const { url } = (await res.json()) as { url: string };

  return {
    uploadURL: `${baseUrl()}/storage/v1${url}`,
    // Saved on the listing as /api/storage/objects/<key>
    objectPath: `/objects/${objectKey}`,
  };
}

/** Public URL for a stored photo key (the part after /objects/). */
export function publicPhotoUrl(objectKey: string): string {
  const safe = objectKey.split("/").map(encodeURIComponent).join("/");
  return `${baseUrl()}/storage/v1/object/public/${BUCKET}/${safe}`;
}
