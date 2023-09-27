export const URIS = {
  me: (baseUri) => `${baseUri}/me`,
  entries: (baseUri) => `${baseUri}/me/time_entries`,
  current: (baseUri) => `${baseUri}/me/time_entries/current`,
  track: (baseUri, workspaceId) =>
    `${baseUri}/workspaces/${workspaceId}/time_entries`,
  projects: (baseUri, workspaceId) =>
    `${baseUri}/workspaces/${workspaceId}/projects`,
  stop: (baseUri, workspaceId, entryId) =>
    `${baseUri}/workspaces/${workspaceId}/time_entries/${entryId}/stop`,
};

export const constants = {
  BASE_URI: "https://api.track.toggl.com/api/v9",
  PROXY: "https://plugins.amplenote.com/cors-proxy",
  TOKEN: "9dadf2301b6c1cba33e5eb477656d062",
  PASS: "api_token",
  WORKSPACE_ID: 4075588,
};
