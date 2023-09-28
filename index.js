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
        await this._startMain.startTimeEntry(app, this.constants, this.URIS);
        return "";
      },
    },
    // Stop: {
    //   async check(app) {
    //     return app.context.taskUUID;
    //   },
    //   async run(app) {
    //     await stopCurrentEntry(app, this.constants, this.URIS);
    //     return "";
    //   },
    // },
  },
  /** App Options */
  appOption: {
    // Stop: async function (app) {
    //   await stopCurrentEntry(app, this.constants, this.URIS);
    // },
  },
  /** Note Options */
  noteOption: {
    Stop: async function (app, noteUUID) {
      try {
        const currentEntry = await this._stopMain.getCurrentTimeEntry(
          constants,
          uris
        );
        if (!currentEntry) return app.alert("There is no running time entry.");
        const currentNote = await this._utils.findNote(app, { uuid: noteUUID });
        const isStopCurrent = await this._stopMain.confirmStopRunningEntry(
          app,
          currentEntry.description,
          currentNote.name
        );
        if (!isStopCurrent) return;
        const stoppedEntry = await this._stopMain.stopCurrentTimeEntry(
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
  _startMain: {
    /**
     * The function formatTaskDescription is used to format a task description.
     * @param taskDescription - The task description is a string that represents the description of a task.
     * @returns string - The formatted task description
     */
    formatTaskDescription: (taskDescription) => {
      return taskDescription.replaceAll(/{.+/g, "").trim();
    },
    /**
     * The function `startTimeEntry` starts tracking time for a task and displays an alert with the
     * tracking information.
     * @param {object} app - The application object that provides access to the app's functionality and
     * context.
     * @param {object} constants - Constants object
     * @param {object} uris - URIS object
     */
    startTimeEntry: async (app, constants, uris) => {
      try {
        const task = await app.getTask(app.context.taskUUID);
        if (!task) throw new TypeError("Task not found");
        const formattedTask = this._startMain.formatTaskDescription(
          task.content
        );
        const entry = await sendTrackingRequest(formattedTask, constants, uris);
        app.alert(`Currently tracking, "${entry.description}"`);
      } catch (e) {
        app.alert(`startTimeEntry: ${e}`);
      }
    },
  },
  _stopMain: {
    /**
     * The function `confirmStopRunningEntry` checks if the current entry description matches the current
     * note name and prompts the user to confirm if they want to stop the running entry.
     *
     * @param app{Object} - The application object that provides access to the app's functionality and
     * context.
     * @param app.prompt{callable} - Prompt the user
     * @param currentEntryDescription{string} - The description of the current running entry.
     * @param currentNoteName{string} - The name of the current note or entry.
     * @returns{Promise<boolean>} The function `confirmStopRunningEntry` returns a boolean value.
     */
    confirmStopRunningEntry: async (
      app,
      currentEntryDescription,
      currentNoteName
    ) => {
      if (currentEntryDescription === currentNoteName) return true;
      const value = await app.prompt(
        `Current running entry: "${currentEntryDescription}"`,
        {
          inputs: [
            {
              type: "checkbox",
              label: "Stop anyway?",
            },
          ],
        }
      );
      return value;
    },
  },
  _entriesService: {
    /**
     * The function `getCurrentTimeEntry` retrieves the current time entry using the provided constants and
     * URIs.
     * @param constants{object} Constants object
     * @param uris{object} URIS object
     * @returns The function `getCurrentTimeEntry` is returning the result of calling `res.json()`.
     */
    getCurrentTimeEntry: async (constants, URIS) => {
      const options = {
        method: "GET",
        headers: {
          Authorization: `Basic ${btoa(constants.TOKEN + ":api_token")}`,
        },
      };
      const res = await sendReq(URIS.current(constants.BASE_URI), options);
      return await res.json();
    },
    /**
     * The function `stopCurrentTimeEntry` is used to stop a current time entry by sending a PATCH request
     * to the specified URI with the provided options.
     * @param currentEntryId{string} - the ID of the time entry that you want to stop.
     * @param constants{object} - An object containing various constants
     * @param URIS{object} - URIS is an object that contains different URIs for making API requests.
     * @returns the stopped time entry.
     */
    stopCurrentTimeEntry: async (currentEntryId, constants, URIS) => {
      const options = {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${btoa(constants.TOKEN + ":api_token")}`,
        },
      };
      const uri = URIS.stop(
        constants.BASE_URI,
        constants.WORKSPACE_ID,
        currentEntryId
      );
      const res = await sendReq(uri, options);
      return await res.json();
    },
    /**
     * The function `startTracking` is used to create a new time tracking entry with a given description
     * and other constants.
     * @param description{string} Task description
     * @param constants{object} Constants object
     * @param uris{object} URIS object
     * @returns The function `startTracking` is returning the response from the `sendReq` function as a
     * JSON object.
     */
    sendTrackingRequest: async (description, constants, uris) => {
      const body = {
        created_with: "Amplenote track plugin",
        description,
        duration: -1,
        start: new Date().toISOString(),
        workspace_id: constants.WORKSPACE_ID,
      };
      const options = {
        method: "POST",
        body: JSON.stringify(body),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${btoa(constants.TOKEN + ":api_token")}`,
        },
      };
      const uri = uris.track(constants.BASE_URI, constants.WORKSPACE_ID);
      const entry = await sendReq(uri, options);
      return await entry.json();
    },
  },
  _utils: {
    /**
     * This function is used to send a request thought Amplenote proxy.
     *
     * @param {string} uri - The URI to send.
     * @param {object} options - The request options.
     * @returns {Promise<Response>} The request response.
     */
    sendRequest: async (uri, options) => {
      const apiURL = new URL(this.constants.PROXY);
      apiURL.searchParams.set("apiurl", uri);
      return await fetch(apiURL, options);
    },
    /**
     * A wrapper for app's findNote method that throws error if the note is not found
     *
     * @param {object} app - The application object that provides access to the app's functionality and
     * context.
     * @param {object} filter - A filter object that filters the notes.
     * @returns {object} The note option object.
     * @throws TypeError if the note is not found.
     */
    findNote: async (app, filter) => {
      const currentNote = await app.findNote(filter);
      if (!currentNote) throw new TypeError("Note is not available.");
      return currentNote;
    },
  },
};
