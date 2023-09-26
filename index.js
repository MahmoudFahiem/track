import { _sendReq } from "./shared/utils";

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
        try {
          const task = await app.getTask(app.context.taskUUID);
          const note = await app.findNote({ uuid: app.context.noteUUID });
          const entry = await this._startTracking({
            description: task.content.trim(),
          });
          const entryJSON = JSON.stringify(entry);
          app.alert(`Currently tracking, ${entryJSON}`);
          return "";
        } catch (e) {
          app.alert(e);
        }
      },
    },
    Stop: {
      async check(app) {
        return app.context.taskUUID;
      },
      async run(app) {
        try {
          const currentEntry = await this._getCurrent();
          const stoppedEntry = await this._stopCurrent(currentEntry.id);
          app.alert(JSON.stringify(stoppedEntry));
          //app.alert(`"${stoppedEntry.description}" stopped successfully`);
          return "";
        } catch (e) {
          app.alert(e);
        }
      },
    },
  },
  appOption(app) {
    app.settings["current_entry_id"] = "Hello";
    app.alert(app.settings["current_entry_id"]);
  },
  async _getCurrent() {
    const options = {
      method: "GET",
      headers: {
        Authorization: `Basic ${btoa(this.constants.TOKEN + ":api_token")}`,
      },
    };
    const res = await _sendReq(
      this.URIS.current(this.constants.BASE_URI),
      options
    );
    return await res.json();
  },
  async _stopCurrent(currentEnryId) {
    const options = {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${btoa(this.constants.TOKEN + ":api_token")}`,
      },
    };
    const uri = this.URIS.stop(
      this.constants.BASE_URI,
      this.constants.WORKSPACE_ID,
      currentEnryId
    );
    const res = await _sendReq(uri, options);
    return await res.json();
  },
  async _startTracking({ description }) {
    const body = {
      created_with: "amplenote track plugin",
      description,
      duration: -1,
      start: new Date().toISOString(),
      workspace_id: this.constants.WORKSPACE_ID,
    };
    const options = {
      method: "POST",
      body: JSON.stringify(body),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${btoa(this.constants.TOKEN + ":api_token")}`,
      },
    };
    const uri = this.URIS.track(
      this.constants.BASE_URI,
      this.constants.WORKSPACE_ID
    );
    const entry = await _sendReq(uri, options);
    return await entry.json();
  },
};
