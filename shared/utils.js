export const sendReq = async (uri, options) => {
  const apiURL = new URL(this.constants.PROXY);
  apiURL.searchParams.set("apiurl", uri);
  return await fetch(apiURL, options);
};
