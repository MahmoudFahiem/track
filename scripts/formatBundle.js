import clipboard from "clipboardy";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BUNDLE_NAME = "bundle.js";
const ROOT_PATH = path.join(__dirname, "../");
const DIST_PATH = path.join(ROOT_PATH, "dist");
const INPUT_PATH = path.join(DIST_PATH, BUNDLE_NAME);
const OUTPUT_PATH = path.join(DIST_PATH, "bundle_formatted.js");

const operations = [
  (input) => input.trim(),
  (input) => input.replace(/"use strict"(;)*(\n)*/g, ""),
  (input) => input.replace(/;$/g, ""),
  (input) => input.replace(/(var|const|let)\splugin(\s)*=(\s)*/g, "return "),
];

const formatBundle = (parsedFile, operations) => {
  return operations.reduce(
    (formattedBundle, operation) => operation(formattedBundle),
    parsedFile
  );
};

const main = () => {
  try {
    if (!fs.existsSync(INPUT_PATH))
      return console.error(`Input file not found at path: ${INPUT_PATH}`);
    const parsedFile = fs.readFileSync(INPUT_PATH).toString();
    const formattedBundle = formatBundle(parsedFile, operations);
    fs.writeFileSync(OUTPUT_PATH, formattedBundle, {
      encoding: "utf8",
      flag: "w+",
    });
    console.log("File Generated successfully! in " + OUTPUT_PATH);
    clipboard.writeSync(formattedBundle);
    console.log("File is copied to clipboard!");
  } catch (e) {
    console.error("Error: ", e);
  }
};

main();
