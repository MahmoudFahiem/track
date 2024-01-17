import { filterTags } from "./utils/commonUtls";

type App = {
  alert: (message: string) => void;
};

const appOption = (app: App) => {
  const filteredTags = filterTags([], "");
  app.alert("Workingggggg");
  return filterTags;
};

export const plugin = {
  appOption,
};
