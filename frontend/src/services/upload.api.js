import { apiRequest, apiUpload } from "./api.js";
import { resolveWorkspace } from "./workspace.js";
import { adaptUpload } from "./adapters.js";

export async function uploadFile(file, onProgress, hackathonId) {
  const { teamId } = await resolveWorkspace({ hackathonId });
  const formData = new FormData();
  formData.append("file", file);

  onProgress?.(30);
  const res = await apiUpload(`/teams/${teamId}/uploads`, formData);
  onProgress?.(100);

  return adaptUpload(res.upload);
}

export async function listUploads(hackathonId) {
  const { teamId } = await resolveWorkspace({ hackathonId });
  const res = await apiRequest(`/teams/${teamId}/uploads`);
  return (res.uploads || []).map(adaptUpload);
}

export async function deleteUpload(uploadId) {
  await apiRequest(`/uploads/${uploadId}`, { method: "DELETE" });
}
