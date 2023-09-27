import { startTimeEntry } from "./features/start-time/start";
import { getCurrent, stopCurrent } from "./features/stop-time/stop";

const main = {
  insertText: {
    Start: {
      async check(app) {
        return app.context.taskUUID;
      },
      async run(app) {
        try {
          await startTimeEntry(app);
          return "";
        } catch (e) {
          app.alert(e);
        }
      },
    },
    Stop: {
      async check(app) {
        return app.context.taskUUID;
      },
      async run(app) {
        try {
          const currentEntry = await getCurrent();
          const stoppedEntry = await stopCurrent(currentEntry.id);
          app.alert(JSON.stringify(stoppedEntry));
          //app.alert(`"${stoppedEntry.description}" stopped successfully`);
          return "";
        } catch (e) {
          app.alert(e);
        }
      },
    },
  },
};
