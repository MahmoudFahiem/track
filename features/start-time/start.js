export const _startTracking = async ({ description }) => {
  const body = {
    created_with: "Amplenote track plugin",
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
