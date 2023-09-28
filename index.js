import { startTimeEntry } from "./features/start-time/start";
import {
  stopCurrentTimeEntry,
  getCurrentTimeEntry,
} from "./shared/entriesService";
import { confirmStopRunningEntry } from "./features/stop-time/stop";
import { sendReq, findNote } from "./shared/utils";

const main = {
  /** Constants */
  constants: {
    BASE_URI: "https://api.track.toggl.com/api/v9",
    PROXY: "https://plugins.amplenote.com/cors-proxy",
    TOKEN: "9dadf2301b6c1cba33e5eb477656d062",
    PASS: "api_token",
    WORKSPACE_ID: 4075588,
  },
  /** URIS */
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
  /** Insert Text */
  insertText: {
    Start: {
      async check(app) {
        return app.context.taskUUID;
      },
      async run(app) {
        await startTimeEntry(app, this.constants, this.URIS);
        return "";
      },
    },
    Stop: {
      async check(app) {
        return app.context.taskUUID;
      },
      async run(app) {
        await stopCurrentEntry(app, this.constants, this.URIS);
        return "";
      },
    },
  },
  /** App Options */
  appOption: {
    Stop: async function (app) {
      await stopCurrentEntry(app, this.constants, this.URIS);
    },
  },
  /** Note Options */
  noteOption: {
    Stop: async function (app, noteUUID) {
      try {
        const currentEntry = await getCurrentTimeEntry(constants, uris);
        if (!currentEntry) return app.alert("There is no running time entry.");
        const currentNote = await findNote(app, { uuid: noteUUID });
        const isStopCurrent = await confirmStopRunningEntry(
          app,
          currentEntry.description,
          currentNote.name
        );
        if (!isStopCurrent) return;
        const stoppedEntry = await stopCurrentTimeEntry(
          currentEntry.id,
          constants,
          uris
        );
        app.alert(`"${stoppedEntry.description}" stopped successfully`);
      } catch (e) {
        app.alert(`stopCurrentEntry: ${e}`);
      }
    },
  },
};
