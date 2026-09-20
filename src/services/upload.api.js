import { apiRequest, USE_MOCK, mockDelay } from "./api.js";

// Backend is expected to hand back a pre-signed S3 URL; the frontend
// uploads directly to S3 with it. Mocked here so the Submission page
// can be built and demoed before that endpoint exists.
export async function getUploadUrl({ fileName, fileType }) {
  if (USE_MOCK) {
    return mockDelay({
      uploadUrl: `https://mock-s3-bucket.s3.amazonaws.com/${fileName}`,
      fields: {},
    });
  }
  return apiRequest("/uploads/presign", { method: "POST", body: { fileName, fileType } });
}

export async function uploadFile(file, onProgress) {
  if (USE_MOCK) {
    for (let pct = 20; pct <= 100; pct += 20) {
      await new Promise((r) => setTimeout(r, 150));
      onProgress?.(pct);
    }
    return mockDelay({
      id: `f${Date.now()}`,
      name: file.name,
      size: file.size,
      uploadedAgo: "just now",
    });
  }
  const { uploadUrl } = await getUploadUrl({ fileName: file.name, fileType: file.type });
  await fetch(uploadUrl, { method: "PUT", body: file });
  return { id: file.name, name: file.name, size: file.size };
}
