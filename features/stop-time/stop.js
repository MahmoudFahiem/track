/**
 * The function `confirmStopRunningEntry` checks if the current entry description matches the current
 * note name and prompts the user to confirm if they want to stop the running entry.
 *
 * @param app{Object} - The application object that provides access to the app's functionality and
 * context.
 * @param app.prompt{callable} - Prompt the user
 * @param currentEntryDescription{string} - The description of the current running entry.
 * @param currentNoteName{string} - The name of the current note or entry.
 * @returns{Promise<boolean>} The function `confirmStopRunningEntry` returns a boolean value.
 */
export const confirmStopRunningEntry = async (
  app,
  currentEntryDescription,
  currentNoteName
) => {
  if (currentEntryDescription === currentNoteName) return true;
  const value = await app.prompt(
    `Current running entry: "${currentEntryDescription}"`,
    {
      inputs: [
        {
          type: "checkbox",
          label: "Stop anyway?",
        },
      ],
    }
  );
  return value;
};