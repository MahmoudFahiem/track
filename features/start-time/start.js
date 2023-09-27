import { URIS, constants } from "../../shared/constants";

export const startTracking = async ({ description }) => {
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
  const uri = URIS.track(constants.BASE_URI, constants.WORKSPACE_ID);
  const entry = await _sendReq(uri, options);
  return await entry.json();
};

export const startTimeEntry = async (app) => {
  try {
    const task = await app.getTask(app.context.taskUUID);
    const entry = await _startTracking({
      description: task.content.trim(),
    });
    const entryJSON = JSON.stringify(entry);
    app.alert(`Currently tracking, ${entryJSON}`);
  } catch (e) {
    app.alert(e);
  }
};
