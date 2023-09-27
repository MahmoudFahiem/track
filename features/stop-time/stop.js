export const getCurrent = async ({ constants, URIS }) => {
  const options = {
    method: "GET",
    headers: {
      Authorization: `Basic ${btoa(constants.TOKEN + ":api_token")}`,
    },
  };
  const res = await sendReq(URIS.current(constants.BASE_URI), options);
  return await res.json();
};

export const stopCurrent = async ({ currentEntryId, constants, URIS }) => {
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
};

export const stopCurrentEntry = async ({ app, constants, URIS }) => {
  try {
    const currentEntry = await getCurrent({ constants, URIS });
    const stoppedEntry = await stopCurrent({
      currentEntryId: currentEntry.id,
      constants,
      URIS,
    });
    app.alert(JSON.stringify(stoppedEntry));
    //app.alert(`"${stoppedEntry.description}" stopped successfully`);
  } catch (e) {
    app.alert(e);
  }
};
