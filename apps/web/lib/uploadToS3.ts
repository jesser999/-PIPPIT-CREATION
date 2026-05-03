"use client";

export interface UploadProgress {
  loaded: number;
  total: number;
  percent: number;
}

/**
 * Uploads a File directly to S3/MinIO using a presigned PUT URL.
 * Reports progress via the onProgress callback.
 * Uses XMLHttpRequest (not fetch) to get upload progress events.
 */
export function uploadToS3(
  presignedUrl: string,
  file: File,
  contentType: string,
  onProgress?: (progress: UploadProgress) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress({
          loaded: e.loaded,
          total: e.total,
          percent: Math.round((e.loaded / e.total) * 100),
        });
      }
    });

    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
      } else {
        reject(new Error(`S3 upload failed with status ${xhr.status}`));
      }
    });

    xhr.addEventListener("error", () => reject(new Error("Network error during S3 upload")));
    xhr.addEventListener("abort", () => reject(new Error("S3 upload aborted")));

    xhr.open("PUT", presignedUrl);
    xhr.setRequestHeader("Content-Type", contentType);
    xhr.send(file);
  });
}
