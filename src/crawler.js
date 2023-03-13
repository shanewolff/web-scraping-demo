import axios from "axios";
import axiosRetry from "axios-retry";
import { NoResponseError, UnsuccessfulResponseError } from "./errors.js";

axiosRetry(axios, { retries: 3 });

/**
 * Load the  HTML page from the URL and return the HTML content.
 * @param {string} url URL of the HTML page
 * @returns {Promise<string>} HTML content string if status is 200
 * @throws {UnsuccessfulResponseError|NoResponseError} Otherwise
 */
export const getHtmlResponse = async (url) => {
  try {
    const response = await axios.get(url);
    if (response.status === 200) {
      return response.data;
    }
    throw new UnsuccessfulResponseError(url);
  } catch (error) {
    throw new NoResponseError(url);
  }
};

/**
 * Download a readable stream of the asset object denoted by the URL
 * @param assetUrl URL of the asset to download
 * @returns {Promise<ReadableStream>} A readable stream of data of the asset
 * @throws {UnsuccessfulResponseError|NoResponseError} Otherwise
 */
export const getAssetStream = async (assetUrl) => {
  try {
    const response = await axios.get(assetUrl, { responseType: "stream" });
    if (response.status === 200) {
      return response.data;
    }
    throw new UnsuccessfulResponseError(assetUrl);
  } catch (error) {
    throw new NoResponseError(assetUrl);
  }
};
