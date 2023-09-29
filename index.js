// Javascript updated 9/28/2023, 8:14:20 PM by Amplenote Plugin Builder from source code within "https://github.com/MahmoudFahiem/track"
const main = {
  /** Constants */
  constants: {
    BASE_URI: "https://api.track.toggl.com/api/v9",
    PROXY: "https://plugins.amplenote.com/cors-proxy",
    PASS: "api_token",
    WORKSPACE_ID: 4075588,
  },
  /** URIS */
  uris: {
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
        /**
         * @type {main}
         */
        const self = this;
        await self._startMain.startTimeEntry.call(self, app);
        return "";
      },
    },
    Stop: {
      async check(app) {
        return app.context.taskUUID;
      },
      async run(app) {
        /**
         * @type {main}
         */
        const self = this;
        try {
          const currentEntry =
            await self._entriesService.getCurrentTimeEntry.call(
              self,
              self._utils.getToken(app)
            );
          if (!currentEntry)
            return app.alert("There is no running time entry.");
          const task = await self._utils.getTask.call(
            self,
            app,
            app.context.taskUUID
          );
          const formattedTask = self._utils.formatTaskDescription.call(
            self,
            task.content
          );
          const isStopCurrent =
            await self._stopMain.confirmStopRunningEntry.call(
              self,
              app,
              currentEntry.description.trim(),
              formattedTask
            );
          if (!isStopCurrent) return;
          const stoppedEntry =
            await self._entriesService.stopCurrentTimeEntry.call(
              self,
              currentEntry.id,
              self._utils.getToken(app),
              self._utils.getWorkspaceId(app)
            );
          app.alert(`"${stoppedEntry.description}" stopped successfully`);
        } catch (e) {
          app.alert(e);
        }
        return "";
      },
    },
  },
  /** Note Options */
  noteOption: {
    Start: async function (app, noteUUID) {
      /**
       * @type {main}
       */
      const self = this;
      try {
        const note = await self._utils.findNote.call(self, app, {
          uuid: noteUUID,
        });
        const token = self._utils.getToken(app);
        const currentEntry =
          await self._entriesService.getCurrentTimeEntry.call(self, token);
        const isOverrideCurrentEntry =
          self._startMain.confirmOverrideRunningEntry.call(
            self,
            app,
            currentEntry
          );
        if (!isOverrideCurrentEntry) return;
        const entry = await self._entriesService.sendTrackingRequest.call(
          self,
          note.name,
          self._utils.getToken.call(self, app),
          self._utils.getWorkspaceId.call(self, app)
        );
        app.alert(`Currently tracking, "${entry.description}"`);
      } catch (e) {
        app.alert(e);
      }
    },
    Stop: async function (app, noteUUID) {
      /**
       * @type {main}
       */
      const self = this;
      try {
        const currentEntry =
          await self._entriesService.getCurrentTimeEntry.call(
            self,
            self._utils.getToken(app)
          );
        if (!currentEntry) return app.alert("There is no running time entry.");
        const currentNote = await self._utils.findNote.call(self, app, {
          uuid: noteUUID,
        });
        const isStopCurrent = await self._stopMain.confirmStopRunningEntry.call(
          self,
          app,
          currentEntry.description,
          currentNote.name
        );
        if (!isStopCurrent) return;
        const stoppedEntry =
          await self._entriesService.stopCurrentTimeEntry.call(
            self,
            currentEntry.id,
            self._utils.getToken(app),
            self._utils.getWorkspaceId(app)
          );
        app.alert(`"${stoppedEntry.description}" stopped successfully`);
      } catch (e) {
        app.alert(e);
      }
    },
  },
  /** Start Time Feature */
  _startMain: {
    /**
     * The function `startTimeEntry` starts tracking time for a task and displays an alert with the
     * tracking information.
     *
     * @param {object} app - The application object that provides access to the app's functionality and
     * context.
     */
    startTimeEntry: async function (app) {
      /**
       * @type {main}
       */
      const self = this;
      try {
        const task = await self._utils.getTask.call(
          self,
          app,
          app.context.taskUUID
        );
        const formattedTask = self._utils.formatTaskDescription.call(
          self,
          task.content
        );
        const entry = await self._entriesService.sendTrackingRequest.call(
          self,
          formattedTask,
          self._utils.getToken(app),
          self._utils.getWorkspaceId(app)
        );
        app.alert(`Currently tracking, "${entry.description}"`);
      } catch (e) {
        app.alert(`startTimeEntry: ${e}`);
      }
    },
    /**
     * The function `confirmOverrideRunningEntry` checks if the
     *
     * @param {object} app - The application object that provides access to the app's functionality and
     * context.
     * @param {string} currentEntryDescription - The description of the current running entry.
     * @returns {Promise<boolean>} The function `confirmStopRunningEntry` returns a boolean value.
     */
    confirmOverrideRunningEntry: async (app, currentEntry) => {
      if (!currentEntry) return true;
      const value = await app.prompt(
        `Current running entry: "${currentEntry.description}"`,
        {
          inputs: [
            {
              type: "checkbox",
              label: "Override?",
            },
          ],
        }
      );
      return value;
    },
  },
  /** Stop Time Feature */
  _stopMain: {
    /**
     * The function `confirmStopRunningEntry` checks if the current entry description matches the current
     * note name and prompts the user to confirm if they want to stop the running entry.
     *
     * @param {object} app - The application object that provides access to the app's functionality and
     * context.
     * @param {string} currentEntryDescription - The description of the current running entry.
     * @param {string} currentTaskName - The name of the current note or task.
     * @returns {Promise<boolean>} The function `confirmStopRunningEntry` returns a boolean value.
     */
    confirmStopRunningEntry: async (
      app,
      currentEntryDescription,
      currentTaskName
    ) => {
      if (currentEntryDescription === currentTaskName) return true;
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
  /** Time Entries Service */
  _entriesService: {
    /**
     * The function `getCurrentTimeEntry` retrieves the current time entry using the provided constants and
     * URIs.
     * @param {string} token - Toggl Track personal token.
     * @returns currentEntry object.
     */
    getCurrentTimeEntry: async function (token) {
      /**
       * @type {main}
       */
      const self = this;
      const options = {
        method: "GET",
        headers: {
          Authorization: `Basic ${btoa(token + ":api_token")}`,
        },
      };
      const res = await self._utils.sendRequest.call(
        self,
        self.uris.current(self.constants.BASE_URI),
        options
      );
      return await res.json();
    },
    /**
     * The function `stopCurrentTimeEntry` is used to stop a current time entry by sending a PATCH request
     * to the specified URI with the provided options.
     * @param {string} currentEntryId - the ID of the time entry that you want to stop.
     * @param {string} token - Toggl Track personal token.
     * @param {string} workspaceId workspace id
     * @returns {object} the stopped time entry.
     */
    stopCurrentTimeEntry: async function (currentEntryId, token, workspaceId) {
      /**
       * @type {main}
       */
      const self = this;
      const options = {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${btoa(token + ":api_token")}`,
        },
      };
      const uri = self.uris.stop(
        self.constants.BASE_URI,
        workspaceId,
        currentEntryId
      );
      const res = await self._utils.sendRequest.call(self, uri, options);
      return await res.json();
    },
    /**
     * The function `startTracking` is used to create a new time tracking entry with a given description
     * and other constants.
     * @param {string} description Task description
     * @param {string} workspaceId workspace id
     * @param {string} token - Toggl Track personal token.
     * @returns The function `startTracking` is returning the response from the `sendReq` function as a
     * JSON object.
     */
    sendTrackingRequest: async function (description, token, workspaceId) {
      /**
       * @type {main}
       */
      const self = this;
      const body = {
        created_with: "Amplenote track plugin",
        description,
        duration: -1,
        start: new Date().toISOString(),
        workspace_id: workspaceId,
      };
      const options = {
        method: "POST",
        body: JSON.stringify(body),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${btoa(token + ":api_token")}`,
        },
      };
      const uri = self.uris.track(self.constants.BASE_URI, workspaceId);
      const entry = await self._utils.sendRequest.call(self, uri, options);
      return await entry.json();
    },
  },
  /** General Utils */
  _utils: {
    /**
     * This function is used to send a request thought Amplenote proxy.
     *
     * @param {string} uri - The URI to send.
     * @param {object} options - The request options.
     * @returns {Promise<Response>} The request response.
     */
    sendRequest: async function (uri, options) {
      /**
       * @type {main}
       */
      const self = this;
      const apiURL = new URL(self.constants.PROXY);
      apiURL.searchParams.set("apiurl", uri);
      return await fetch(apiURL, options);
    },
    /**
     * A wrapper for app's findNote method that throws error if the note is not found
     *
     * @param {object} app - The application object that provides access to the app's functionality and
     * context.
     * @param {object} filter - A filter object that filters the notes.
     * @returns {Promise<object>} The note object.
     * @throws TypeError if the note is not found.
     */
    findNote: async function (app, filter) {
      const currentNote = await app.findNote(filter);
      if (!currentNote) throw new TypeError("Note is not available.");
      return currentNote;
    },
    /**
     * This function is used to format a task description.
     *
     * @param {string} taskDescription - The task description is a string that represents the description of a task.
     * @returns {string} - The formatted task description
     */
    formatTaskDescription: function (taskDescription) {
      /**
       * @type {main}
       */
      const self = this;
      return taskDescription.replaceAll(/{.+/g, "").trim();
    },
    /**
     * A wrapper for app's findNote method that throws error if the note is not found.
     *
     * @param {object} app - The application object that provides access to the app's functionality and
     * context.
     * @param {string} taskUUID - A unique identifier for the task.
     * @returns {Promise<object>} The task object.
     * @throws TypeError if the note is not found.
     */
    getTask: async function (app, taskUUID) {
      /**
       * @type {main}
       */
      const self = this;
      const task = await app.getTask(taskUUID);
      if (!task) throw new TypeError("Task not found");
      return task;
    },
    /**
     * Gets person token from the plugin settings.
     *
     * @param {object} app - The application object that provides access to the app's functionality and
     * context.
     * @returns {string} The user token.
     * @throws TypeError if the token is not set.
     */
    getToken: function (app) {
      /**
       * @type {main}
       */
      const self = this;
      const token = app.settings["Personal Token"];
      if (!token)
        throw new TypeError(
          "Toggl Track's personal token is not configured. Please add it in the plugin's settings."
        );
      return token;
    },
    /**
     * Gets workspace from the plugin settings.
     *
     * @param {object} app - The application object that provides access to the app's functionality and
     * context.
     * @returns {number} The workspace id.
     * @throws TypeError if the token is not set.
     */
    getWorkspaceId: function (app) {
      /**
       * @type {main}
       */
      const self = this;
      const workspaceId = app.settings["Workspace Id"];
      if (!workspaceId)
        throw new TypeError(
          "Workspace id is not configured. Please add it in the plugin's settings."
        );
      const workspaceIdNumber = parseInt(workspaceId);
      if (isNaN(workspaceId))
        throw new TypeError("Workspace id is not a valid number.");
      return workspaceIdNumber;
    },
  },
};
