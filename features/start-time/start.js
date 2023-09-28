import { sendReq } from "../../shared/utils";

/**
 * The function `startTracking` is used to create a new time tracking entry with a given description
 * and other constants.
 * @param description{string} Task description
 * @param constants{object} Constants object
 * @param uris{object} URIS object
 * @returns The function `startTracking` is returning the response from the `sendReq` function as a
 * JSON object.
 */
const sendTrackingRequest = async (description, constants, uris) => {
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
};

/**
 * The function formatTaskDescription is used to format a task description.
 * @param taskDescription - The task description is a string that represents the description of a task.
 * @returns string - The formatted task description
 */
const formatTaskDescription = (taskDescription) => {
  return taskDescription.replaceAll(/{Track:.+/g, "").trim();
};

/**
 * The function `startTimeEntry` starts tracking time for a task and displays an alert with the
 * tracking information.
 * @param app{object} - The application object that provides access to the app's functionality and
 * context.
 * @param constants{object} - Constants object
 * @param uris{object} - URIS object
 */
export const startTimeEntry = async (app, constants, uris) => {
  try {
    const task = await app.getTask(app.context.taskUUID);
    if (!task) throw new TypeError("Task not found");
    const formattedTask = formatTaskDescription(task.content);
    const entry = await sendTrackingRequest(formattedTask, constants, uris);
    app.alert(`Currently tracking, "${entry.description}"`);
  } catch (e) {
    app.alert(`startTimeEntry: ${e}`);
  }
};
