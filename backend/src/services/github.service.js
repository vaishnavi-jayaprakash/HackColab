import axios from "axios";

const githubApi = axios.create({
  baseURL: "https://api.github.com",
  headers: {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  },
});

export async function getRepository(owner, repo) {
  const response = await githubApi.get(`/repos/${owner}/${repo}`);

  return response.data;
}

export async function getBranches(owner, repo) {
  const response = await githubApi.get(
    `/repos/${owner}/${repo}/branches`
  );

  return response.data;
}

export async function getCommits(owner, repo, branch) {
  const response = await githubApi.get(
    `/repos/${owner}/${repo}/commits`,
    {
      params: {
        sha: branch,
        per_page: 20,
      },
    }
  );

  return response.data;
}

export async function getPullRequests(owner, repo) {
  const response = await githubApi.get(
    `/repos/${owner}/${repo}/pulls`,
    {
      params: {
        state: "all",
        per_page: 20,
      },
    }
  );

  return response.data;
}

export async function getCommitDetails(owner, repo, commitSha) {
  const response = await githubApi.get(
    `/repos/${owner}/${repo}/commits/${commitSha}`
  );

  return response.data;
}

export async function getBranch(owner, repo, branch) {
  const response = await githubApi.get(
    `/repos/${owner}/${repo}/branches/${encodeURIComponent(branch)}`
  );

  return response.data;
}