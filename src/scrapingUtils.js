import * as cheerio from 'cheerio';
import { getHtmlResponse } from './crawler.js';
import logger from './logger.js';
import { bookAnchorSelector, paginationSelector } from './selectors.js';
import {
  extractBookCategory,
  extractBookDescription,
  extractBookImageUrl,
  extractBookProductInfo,
  extractBookRating,
  extractBookTitle,
} from './dataExtractors.js';
import * as path from 'path';
import { downloadAsset } from './commonUtils.js';
import { CatalogPageCountNotFoundError } from './errors.js';

/**
 * Given the base URL of the website to scrape, the catalog page URLs are
 * constructed by identifying the number of catalog pages
 * @param {string} baseUrl Base URL of the scraping website
 * @returns {Promise<string[]|null>} A promise which resolves a list of
 * catalog page URLs or null if base URL loading fails
 * @throws {CatalogPageCountNotFoundError} A new catalog page count not found error if data is not found
 */
export const constructCatalogPageUrls = async (baseUrl) => {
  let $;
  try {
    // Load the home page HTML content with Cheerio
    $ = cheerio.load(await getHtmlResponse(baseUrl));
  } catch (error) {
    logger.error(error.message);
    return null;
  }

  // Number of catalog pages to scrape
  let numOfCatalogPages;
  try {
    numOfCatalogPages = Number(
      $(paginationSelector).text().trim().match(/\d+$/).at(0)
    );
  } catch (error) {
    throw new CatalogPageCountNotFoundError();
  }

  // Construct catalog page URLs by incrementing the page number sequentially
  const catalogPageUrls = [];
  for (let pageNum = 1; pageNum <= numOfCatalogPages; ++pageNum) {
    catalogPageUrls.push(
      new URL(`catalogue/page-${pageNum}.html`, baseUrl).href
    );
  }

  return catalogPageUrls;
};

/**
 * Construct all book details page links available within a given catalog page
 * @param {string} catalogPageUrl URL of the catalog page
 * @param {string} baseUrl URL of the home page
 * @returns {Promise<string[]>} A promise which resolves a list of book page URLs or an empty list if fails
 */
const constructBookPageUrlsInCatalogPage = async (catalogPageUrl, baseUrl) => {
  let $;
  try {
    // Load catalog page with Cheerio
    $ = cheerio.load(await getHtmlResponse(catalogPageUrl));
  } catch (error) {
    logger.error(error.message);
    return [];
  }
  const { urls, errors } = $(bookAnchorSelector)
    .toArray()
    .reduce(
      // Construct book details page URL from each book link
      (result, element) => {
        const elementHref = $(element).attr('href');
        if (elementHref) {
          result.urls.push(new URL(`catalogue/${elementHref}`, baseUrl).href);
        } else {
          ++result.errors;
        }
        return result;
      },
      { urls: [], errors: 0 }
    );

  if (errors > 0) {
    logger.warn(
      `${errors} URL(s) could not be found on ${catalogPageUrl} due to href attribute not found`
    );
  }
  return urls;
};

/**
 * Construct all book details page links available on all catalog pages
 * @param {string[]} catalogPageUrls A list of catalog page URLs
 * @param {string} baseUrl The URL of the home page
 * @returns {Promise<string[]>} A promise which resolves a list of all available book details page URLs
 */
export const constructAllBookPageUrls = async (catalogPageUrls, baseUrl) =>
  (
    await Promise.allSettled(
      catalogPageUrls.map((url) =>
        constructBookPageUrlsInCatalogPage(url, baseUrl)
      )
    )
  )
    // Extract promise result values
    .map((result) => result.value)
    // Concat all book page URL lists into a single list
    .reduce(
      (accumulator, currentValue) => accumulator.concat(currentValue),
      []
    );

/**
 * Construct an object with all book details by calling parsing functions
 * @param {function} $ Cheerio load function object
 * @param {string} bookPageUrl Current book details page URL
 * @returns {Object} An object containing all book details
 */
const parseBookInfo = ($, bookPageUrl) => {
  return {
    url: bookPageUrl,
    category: extractBookCategory($, bookPageUrl),
    title: extractBookTitle($, bookPageUrl),
    rating: extractBookRating($),
    description: extractBookDescription($),
    productInfo: extractBookProductInfo($),
    imageUrl: extractBookImageUrl($, bookPageUrl),
  };
};

/**
 * Extract the book details from a given book page URL
 * @param {string} bookPageUrl URL of the book details page
 * @returns {Promise<Object|null>} A promise which resolves an object containing
 * book details or null if URL is not accessible
 */
export const extractBookInfo = async (bookPageUrl) => {
  let $;
  try {
    // Load book page with Cheerio
    $ = cheerio.load(await getHtmlResponse(bookPageUrl));
  } catch (error) {
    logger.error(error.message);
    return null;
  }
  // Return book page details by parsing HTML response
  return parseBookInfo($, bookPageUrl);
};

/**
 * Extract the book details from a list of book page URLs
 * @param {string[]} bookPageUrls A list of book pages to scrape
 * @returns {Promise<Object[]>} A promise which resolves a list of book details for the provided book page URLs
 */
export const extractAllBookInfo = async (bookPageUrls) =>
  (
    await Promise.allSettled(bookPageUrls.map((url) => extractBookInfo(url)))
  ).reduce((bookInfoList, result) => {
    if (result.value) {
      bookInfoList.push(result.value);
    }
    return bookInfoList;
  }, []);

/**
 * Download book images provided by asset URLs
 * @param {{url: string, identifier: string}[]} imageData
 * @param {string} dataDirectory The directory in which the images should be downloaded.
 * @returns {Promise<{[p: string]: PromiseSettledResult<Awaited<*>>, [p: number]: PromiseSettledResult<Awaited<*>>,
 * [p: symbol]: PromiseSettledResult<Awaited<*>>}>} A promise which resolves a list of promise results
 */
export const downloadBookImages = async (imageData, dataDirectory) => {
  return Promise.allSettled(
    imageData.map((imageDatum) => {
      const imageExtension = imageDatum.url.match(/(?!\.)[a-z0-9]+$/i).at(0);
      const imageName = `${imageDatum.identifier}.${imageExtension}`;
      const imageFilePath = path.resolve(dataDirectory, imageName);
      return downloadAsset(imageDatum.url, imageFilePath);
    })
  );
};
