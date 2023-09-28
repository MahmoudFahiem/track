/**
 * The function `getCurrentTimeEntry` retrieves the current time entry using the provided constants and
 * URIs.
 * @param constants{object} Constants object
 * @param uris{object} URIS object
 * @returns The function `getCurrentTimeEntry` is returning the result of calling `res.json()`.
 */
export const getCurrentTimeEntry = async (constants, URIS) => {
  const options = {
    method: "GET",
    headers: {
      Authorization: `Basic ${btoa(constants.TOKEN + ":api_token")}`,
    },
  };
  const res = await sendReq(URIS.current(constants.BASE_URI), options);
  return await res.json();
};

/**
 * The function `stopCurrentTimeEntry` is used to stop a current time entry by sending a PATCH request
 * to the specified URI with the provided options.
 * @param currentEntryId{string} - the ID of the time entry that you want to stop.
 * @param constants{object} - An object containing various constants
 * @param URIS{object} - URIS is an object that contains different URIs for making API requests.
 * @returns the stopped time entry.
 */
export const stopCurrentTimeEntry = async (currentEntryId, constants, URIS) => {
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
