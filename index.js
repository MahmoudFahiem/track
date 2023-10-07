// Javascript updated 9/28/2023, 8:14:20 PM by Amplenote Plugin Builder from source code within "https://github.com/MahmoudFahiem/track"
const main = {
  /** Constants */
  constants: {
    BASE_URI: "https://api.track.toggl.com/api/v9",
    PROXY: "https://plugins.amplenote.com/cors-proxy",
    PASS: "api_token",
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
    clients: (baseUri, workspaceId) =>
      `${baseUri}/workspaces/${workspaceId}/clients`,
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
          const note = await self._utils.findNote.call(self, app, {
            uuid: task.noteUUID,
          });
          await self._startMain.startTimeEntry.call(
            self,
            app,
            formattedTask,
            note.tags
          );
        } catch (e) {
          app.alert(e);
        }
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
        await self._startMain.startTimeEntry.call(
          self,
          app,
          note.name,
          note.tags
        );
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
    "Create a project": async function (app, noteUUID) {
      /**
       * @type {main}
       */
      const self = this;
      try {
        const currentNote = await self._utils.findNote.call(self, app, {
          uuid: noteUUID,
        });
        await self._projectMain.createProject.call(self, app, currentNote.name);
      } catch (e) {
        app.alert(e);
      }
    },
  },
  /** App Options */
  appOption: {
    "Create a project": async function (app) {
      /**
       * @type {main}
       */
      const self = this;
      try {
        await self._projectMain.createProject.call(self, app);
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
     * @param {string} entryDescription - The entry description.
     * @param {Nullable<Array<string>>} noteTags - note tags
     * @returns {Promise<void>}
     */
    startTimeEntry: async function (app, entryDescription, noteTags) {
      /**
       * @type {main}
       */
      const self = this;
      const token = self._utils.getToken.call(self, app);
      const workspaceId = self._utils.getWorkspaceId.call(self, app);
      const currentEntry = await self._entriesService.getCurrentTimeEntry.call(
        self,
        token
      );
      const isOverrideCurrentEntry =
        await self._startMain.confirmOverrideRunningEntry.call(
          self,
          app,
          currentEntry
        );
      if (!isOverrideCurrentEntry) return;
      const projects = await self._entriesService.getProjects.call(
        self,
        token,
        workspaceId
      );
      /**
       * @type {EntryDetails}
       */
      const entryDetails = await self._startMain.promptUserForEntryDetails.call(
        self,
        app,
        projects,
        entryDescription,
        noteTags || []
      );
      if (!entryDetails) return;
      const entry = await self._entriesService.sendTrackingRequest.call(
        self,
        entryDetails,
        token,
        workspaceId
      );
      app.alert(`start tracking: "${entry.description}"`);
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
    /**
     * Prompts the user for entry details
     * @param {object} app - The application object that provides access to the app's functionality and
     * context.
     * @param {Array<object>} projects - Workspace projects
     * @param {string} description - Entry description
     * @param {Array<string>} tags - Entry tags
     * @returns {Promise<EntryDetails>} User values
     */
    promptUserForEntryDetails: async function (
      app,
      projects,
      description,
      tags
    ) {
      /**
       * @type {main}
       */
      const self = this;
      const projectsOptions = projects.map((project) => ({
        label: project.name,
        value: project.id,
      }));
      const formValues = await app.prompt(`Choose Entry Details:`, {
        inputs: [
          {
            label: "Description",
            type: "text",
            value: description,
          },
          {
            label: "Project",
            type: "select",
            options: projectsOptions,
          },
          {
            label: "Is Billable",
            type: "checkbox",
          },
          {
            label: "Tags",
            type: "text",
            value: tags.join(", "),
          },
        ],
      });
      if (!formValues) return;
      const projectId = parseInt(formValues[1]);
      if (isNaN(projectId)) throw new TypeError("Invalid project id number");
      return {
        description: formValues[0],
        projectId: projectId,
        isBillable: formValues[2],
        tags: self._utils.splitStringOnComma.call(self, formValues[3]),
      };
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
  _clientMain: {
    /**
     * Creates a new client.
     * @param {object} app - The application object that provides access to the app's functionality and
     * context.
     */
    createClient: async function (app) {
      /**
       * @type {main}
       */
      const self = this;
      const clientName = await self._clientMain.promptUserForClientDetails.call(
        self,
        app
      );
      if (!clientName) return;
      const token = self._utils.getToken.call(self, app);
      const workspaceId = self._utils.getWorkspaceId.call(self, app);
      const createdClient = await self._entriesService.createClient.call(
        self,
        token,
        workspaceId,
        clientName
      );
      app.alert(`Client "${createdClient.name}" created successfully`);
    },
    /**
     * Prompts the user for client information.
     * @param {object} app - The application object that provides access
     * @returns {string} - Client name
     */
    promptUserForClientDetails: async function (app) {
      return await app.prompt("Enter client details:", {
        inputs: [
          {
            label: "Client Name",
            type: "text",
            placeholder: "Client Name",
          },
        ],
      });
    },
  },
  _projectMain: {
    /**
     * Creates a new project.
     * @param {object} app - The application object that provides access to the app's functionality and
     * context.
     * @param {string} currentProjectName - The name of the current project
     */
    createProject: async function (app, currentProjectName = "") {
      /**
       * @type {main}
       */
      const self = this;
      const token = self._utils.getToken.call(self, app);
      const workspaceId = self._utils.getWorkspaceId.call(self, app);
      const clients = await self._entriesService.getClients.call(
        self,
        token,
        workspaceId
      );
      const projectDetails =
        await self._projectMain.promptUserForProjectDetails.call(
          self,
          app,
          clients,
          currentProjectName
        );
      if (!projectDetails) return;
      const createdProject = await self._entriesService.createProject.call(
        self,
        token,
        workspaceId,
        projectDetails
      );
      app.alert(`Project "${createdProject.name}" is created successfully`);
    },
    /**
     * Prompts the user for project details.
     * @param {object} app - The application object that provides access.
     * @param {Array<object>} clients - workspace clients
     * @param {string} currentProjectName - The name of the current project
     * @returns {Promise<ProjectDetails>} project data object.
     */
    promptUserForProjectDetails: async function (
      app,
      clients,
      currentProjectName
    ) {
      const clientOptions = clients.map((client) => ({
        label: client.name,
        value: client.name,
      }));
      const formValues = await app.prompt("Enter Project Details:", {
        inputs: [
          {
            label: "Project Name",
            type: "text",
            value: currentProjectName || "",
          },
          {
            label: "Client Name",
            type: "select",
            options: clientOptions,
          },
          {
            label: "Or Enter New Client Name",
            type: "text",
          },
          {
            label: "Is Active",
            type: "checkbox",
            value: true,
          },
          {
            label: "Is Private",
            type: "checkbox",
            value: true,
          },
        ],
      });
      if (!formValues) return;
      return {
        name: formValues[0],
        clientName: formValues[1] || formValues[2],
        isActive: formValues[3],
        isPrivate: formValues[4],
      };
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
     * @param {number} workspaceId workspace id
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
     * @param {EntryDetails} entryDetails - entry details
     * @param {number} workspaceId - workspace id
     * @param {string} token - Toggl Track personal token.
     * @returns the response from the `sendReq` function as a JSON object.
     */
    sendTrackingRequest: async function (entryDetails, token, workspaceId) {
      /**
       * @type {main}
       */
      const self = this;
      const body = {
        created_with: "Amplenote track plugin",
        description: entryDetails.description,
        project_id: entryDetails.projectId,
        tags: entryDetails.tags || [],
        billable: entryDetails.isBillable || false,
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
      const res = await self._utils.sendRequest.call(self, uri, options);
      return await res.json();
    },
    /**
     * The function `getProjects` is used to retrieve workspace projects.
     * @param {number} workspaceId workspace id
     * @param {string} token - Toggl Track personal token.
     * @returns the response from the `sendReq` function as a JSON object.
     */
    getProjects: async function (token, workspaceId) {
      /**
       * @type {main}
       */
      const self = this;
      const options = {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${btoa(token + ":api_token")}`,
        },
      };
      const searchParams = new URLSearchParams({
        active: true,
      });
      const uri = `${self.uris.projects(
        self.constants.BASE_URI,
        workspaceId
      )}?${searchParams}`;
      const res = await self._utils.sendRequest.call(self, uri, options);
      return await res.json();
    },
    /**
     * The function `createProject` is used to create a project.
     * @param {number} workspaceId workspace id.
     * @param {string} token - Toggl Track personal token.
     * @param {ProjectDetails} projectDetails - project data object.
     * @returns the response from the `sendReq` function as a JSON object.
     */
    createProject: async function (token, workspaceId, projectDetails) {
      /**
       * @type {main}
       */
      const self = this;
      const options = {
        method: "POST",
        body: JSON.stringify({
          name: projectDetails.name,
          client_name: projectDetails.clientName,
          active: projectDetails.isActive,
          is_private: projectDetails.isPrivate,
        }),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${btoa(token + ":api_token")}`,
        },
      };
      const uri = self.uris.projects(self.constants.BASE_URI, workspaceId);
      const res = await self._utils.sendRequest.call(self, uri, options);
      return await res.json();
    },
    /**
     * The function `getClients` is used to retrieve workspace clients.
     * @param {number} workspaceId workspace id
     * @param {string} token - Toggl Track personal token.
     * @returns the response from the `sendReq` function as a JSON object.
     */
    getClients: async function (token, workspaceId) {
      /**
       * @type {main}
       */
      const self = this;
      const options = {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${btoa(token + ":api_token")}`,
        },
      };
      const searchParams = new URLSearchParams({
        archived: false,
      });
      const uri = `${self.uris.clients(
        self.constants.BASE_URI,
        workspaceId
      )}?${searchParams}`;
      const res = await self._utils.sendRequest.call(self, uri, options);
      return await res.json();
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
      const res = await fetch(apiURL, options);
      if (!res.ok)
        throw new TypeError(
          `Error while sending a request to ${apiURL} with status code ${res.status}`
        );
      return res;
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
    /**
     *
     * @param {string} string - The string like array to be splitted
     * @returns {Array<string>} - Array of strings
     */
    splitStringOnComma: function (string) {
      if (!string) return [];
      return string.split(",").map((string) => string.trim());
    },
  },
};
