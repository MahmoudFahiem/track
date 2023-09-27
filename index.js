import { startTimeEntry } from "./features/start-time/start";
import { stopCurrentEntry } from "./features/stop-time/stop";

const main = {
  constants: {
    BASE_URI: "https://api.track.toggl.com/api/v9",
    PROXY: "https://plugins.amplenote.com/cors-proxy",
    TOKEN: "9dadf2301b6c1cba33e5eb477656d062",
    PASS: "api_token",
    WORKSPACE_ID: 4075588,
  },
  URIS: {
    me: (baseUri) => `${baseUri}/me`,
    entries: (baseUri) => `${baseUri}/me/time_entries`,
    current: (baseUri) => `${baseUri}/me/time_entries/current`,
    track: (baseUri, workspaceId) =>
      `${baseUri}/workspaces/${workspaceId}/time_entries`,
    projects: (baseUri, workspaceId) =>
      `${baseUri}/workspaces/${workspaceId}/projects`,
    stop: (baseUri, workspaceId, entryId) =>
      `${baseUri}/workspaces/${workspaceId}/time_entries/${entryId}/stop`,
  },
  insertText: {
    Start: {
      async check(app) {
        return app.context.taskUUID;
      },
      async run(app) {
        await startTimeEntry({
          app,
          constants: this.constants,
          uris: this.URIS,
        });
        return "";
      },
    },
    Stop: {
      async check(app) {
        return app.context.taskUUID;
      },
      async run(app) {
        await stopCurrentEntry({
          app,
          constants: this.constants,
          uris: this.URIS,
        });
        return "";
      },
    },
  },
};
