import { mkdir, writeFile } from "node:fs/promises";
import { FileWriteError } from "./errors.js";
import * as path from "path";
import { getAssetStream } from "./crawler.js";
import { createWriteStream } from "fs";

/**
 * Persist given JSON data in the specified file path
 * @param {string} filePath File path with extension (.json) in which the data should be persisted
 * @param {*} data JSON convertible data to persist
 * @returns {Promise<boolean>} A promise resolves true if success
 * @throws {FileWriteError} A file write error otherwise
 */
export const writeToJsonFile = async (filePath, data) => {
  try {
    await mkdir(path.dirname(filePath), { recursive: true });
    await writeFile(filePath, JSON.stringify(data), "utf8");
    return true;
  } catch (error) {
    throw new FileWriteError(filePath);
  }
};

/**
 * Download the asset specified by the URL and save it in the file path
 * @param {string} assetUrl The URL of the downloadable asset
 * @param {string} filePath The file path where the asset should be saved
 * @returns {Promise<boolean>} A promise which resolves true if saved successfully
 * @throws {FileWriteError} A file write error otherwise
 */
export const downloadAsset = async (assetUrl, filePath) => {
  const dataStream = await getAssetStream(assetUrl);
  try {
    await mkdir(path.dirname(filePath), { recursive: true });
  } catch (error) {
    throw new FileWriteError(filePath);
  }
  const writer = createWriteStream(filePath);
  dataStream.pipe(writer);
  return new Promise((resolve, reject) => {
    writer.on("finish", () => resolve(true));
    writer.on("error", () => reject(new FileWriteError(filePath)));
  });
};

/**
 * Calculate the time elapsed in between two timestamps
 * @param {number} start A number denotes the starting point of an event in millisecond accuracy
 * @param {number} end A number denotes the end point of an event in millisecond accuracy
 * @returns {{seconds: number, hours: number, minutes: number}} An object describes the elapsed time
 */
export const getDuration = (start, end) => {
  const diff = end - start;
  return {
    seconds: Math.floor((diff / 1_000) % 60),
    minutes: Math.floor((diff / 60_000) % 60),
    hours: Math.floor((diff / 3_600_000) % 24),
  };
};
