import { useState, useCallback } from "react";
import type { UppyFile } from "@uppy/core";

interface UploadMetadata {
  name: string;
  size: number;
  contentType: string;
}

interface UploadResponse {
  uploadURL: string;
  objectPath: string;
  metadata: UploadMetadata;
}

interface UseUploadOptions {
  /** Base path where object storage routes are mounted (default: "/api/storage") */
  basePath?: string;
  /**
   * Optional callback that returns extra headers to include with the
   * /uploads/request-url request.  Use this to forward a Bearer token:
   *
   *   getHeaders: async () => {
   *     const token = await getToken();
   *     return token ? { Authorization: `Bearer ${token}` } : {};
   *   }
   */
  getHeaders?: () => Promise<Record<string, string>> | Record<string, string>;
  onSuccess?: (response: UploadResponse) => void;
  onError?: (error: Error) => void;
}

/**
 * React hook for handling file uploads with presigned URLs.
 *
 * Two-step upload flow:
 * 1. Request a presigned URL from the backend (sends JSON metadata, NOT the file)
 * 2. Upload the file directly to the presigned URL via PUT
 */
export function useUpload(options: UseUploadOptions = {}) {
  const basePath = options.basePath ?? "/api/storage";
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [progress, setProgress] = useState(0);

  const requestUploadUrl = useCallback(
    async (file: File): Promise<UploadResponse> => {
      const extraHeaders = options.getHeaders ? await options.getHeaders() : {};

      const response = await fetch(`${basePath}/uploads/request-url`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...extraHeaders,
        },
        body: JSON.stringify({
          name: file.name,
          size: file.size,
          contentType: file.type || "application/octet-stream",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Upload URL request failed: ${response.status}`);
      }

      return response.json();
    },
    [basePath, options.getHeaders],
  );

  const uploadToPresignedUrl = useCallback(
    async (file: File, uploadURL: string): Promise<void> => {
      const response = await fetch(uploadURL, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type || "application/octet-stream",
        },
      });

      if (!response.ok) {
        throw new Error(`Storage upload failed: ${response.status} ${response.statusText}`);
      }
    },
    [],
  );

  const uploadFile = useCallback(
    async (file: File): Promise<UploadResponse | null> => {
      setIsUploading(true);
      setError(null);
      setProgress(0);

      try {
        setProgress(20);
        const uploadResponse = await requestUploadUrl(file);

        setProgress(40);
        await uploadToPresignedUrl(file, uploadResponse.uploadURL);

        setProgress(100);
        options.onSuccess?.(uploadResponse);
        return uploadResponse;
      } catch (err) {
        const uploadError = err instanceof Error ? err : new Error("Upload failed");
        setError(uploadError);
        options.onError?.(uploadError);
        return null;
      } finally {
        setIsUploading(false);
      }
    },
    [requestUploadUrl, uploadToPresignedUrl, options],
  );

  const getUploadParameters = useCallback(
    async (
      file: UppyFile<Record<string, unknown>, Record<string, unknown>>,
    ): Promise<{
      method: "PUT";
      url: string;
      headers?: Record<string, string>;
    }> => {
      const extraHeaders = options.getHeaders ? await options.getHeaders() : {};

      const response = await fetch(`${basePath}/uploads/request-url`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...extraHeaders,
        },
        body: JSON.stringify({
          name: file.name,
          size: file.size,
          contentType: file.type || "application/octet-stream",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get upload URL");
      }

      const data = await response.json();
      return {
        method: "PUT",
        url: data.uploadURL,
        headers: { "Content-Type": file.type || "application/octet-stream" },
      };
    },
    [basePath, options.getHeaders],
  );

  return {
    uploadFile,
    getUploadParameters,
    isUploading,
    error,
    progress,
  };
}
