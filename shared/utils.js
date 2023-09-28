export const sendReq = async (uri, options) => {
  const apiURL = new URL(this.constants.PROXY);
  apiURL.searchParams.set("apiurl", uri);
  return await fetch(apiURL, options);
};


export const findNote = async (app, filter) => {
  const currentNote = await app.findNote(filter);
  if (!currentNote) throw new TypeError("Note is not available");
  return currentNote;
};
