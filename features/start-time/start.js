// import { sendTrackingRequest } from "../../shared/entriesService";

// /**
//  * The function formatTaskDescription is used to format a task description.
//  * @param taskDescription - The task description is a string that represents the description of a task.
//  * @returns string - The formatted task description
//  */
// export const formatTaskDescription = (taskDescription) => {
//   return taskDescription.replaceAll(/{.+/g, "").trim();
// };

// /**
//  * The function `startTimeEntry` starts tracking time for a task and displays an alert with the
//  * tracking information.
//  * @param app{object} - The application object that provides access to the app's functionality and
//  * context.
//  * @param constants{object} - Constants object
//  * @param uris{object} - URIS object
//  */
// export const startTimeEntry = async (app, constants, uris) => {
//   try {
//     const task = await app.getTask(app.context.taskUUID);
//     if (!task) throw new TypeError("Task not found");
//     const formattedTask = formatTaskDescription(task.content);
//     const entry = await sendTrackingRequest(formattedTask, constants, uris);
//     app.alert(`Currently tracking, "${entry.description}"`);
//   } catch (e) {
//     app.alert(`startTimeEntry: ${e}`);
//   }
// };
