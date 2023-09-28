import { sendReq } from "../../shared/utils";

/**
 * The function `getCurrentTimeEntry` retrieves the current time entry using the provided constants and
 * URIs.
 * @param constants{object} Constants object
 * @param uris{object} URIS object
 * @returns The function `getCurrentTimeEntry` is returning the result of calling `res.json()`.
 */
const getCurrentTimeEntry = async (constants, URIS) => {
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
const stopCurrentTimeEntry = async (currentEntryId, constants, URIS) => {
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

/**
 * The function `stopCurrentEntry` stops the current time entry and displays a success message or an
 * error message.
 * @param app{object} - The application object that provides access to the app's functionality and
 * context.
 * @param constants{object} - Constants object
 * @param uris{object} - URIS object
 */
export const stopCurrentEntry = async (app, constants, URIS) => {
  try {
    const currentEntry = await getCurrentTimeEntry({ constants, URIS });
    const stoppedEntry = await stopCurrentTimeEntry({
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
