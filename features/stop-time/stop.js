import { constants, URIS } from "../../shared/constants";

export const getCurrent = async () => {
  const options = {
    method: "GET",
    headers: {
      Authorization: `Basic ${btoa(constants.TOKEN + ":api_token")}`,
    },
  };
  const res = await sendReq(URIS.current(constants.BASE_URI), options);
  return await res.json();
};

export const stopCurrent = async (currentEntryId) => {
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
