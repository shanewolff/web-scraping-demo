import * as dotenv from "dotenv";
import logger from "./logger.js";
import {
  constructAllBookPageUrls,
  constructCatalogPageUrls,
  downloadBookImages,
  extractAllBookInfo,
} from "./scrapingUtils.js";
import { getDuration, writeToJsonFile } from "./commonUtils.js";

// Configure dotenv
dotenv.config();

/**
 * Execute book scraping job
 * @param {string} baseUrl The home page URL of the book scraping website
 * @param {string} outputFilePath The file path in which the scraped data should be persisted
 * @returns {Promise<Object[]>} A promise which resolves a list of book data
 */
const executeBookScrapingJob = async (baseUrl, outputFilePath) => {
  logger.info("Book data scraping job started");

  // The job starting time
  const start = performance.now();

  // Construct all book catalog page URLs
  const catalogPageUrls = await constructCatalogPageUrls(baseUrl);
  logger.info(`Number of catalog page URLs found: ${catalogPageUrls.length}`);

  // Construct all book details page URLs within those catalog pages.
  const bookPageUrls = await constructAllBookPageUrls(catalogPageUrls, baseUrl);
  logger.info(`Number of book details page URLs found: ${bookPageUrls.length}`);

  // Scrape all book data from book details page URLs
  const bookData = await extractAllBookInfo(bookPageUrls, baseUrl);
  logger.info(`Number of books scraped: ${bookData.length}`);

  try {
    await writeToJsonFile(outputFilePath, bookData);
    logger.info(`The book data has been persisted to ${outputFilePath}`);
  } catch (error) {
    logger.error(error.message);
  }

  // The job completed time
  const end = performance.now();

  // The total duration of the job
  const duration = getDuration(start, end);
  logger.info(
    `Book data scraping job completed in ${duration.hours} hr(s) ${duration.minutes} min(s) and ${duration.seconds} sec(s)`
  );

  return bookData;
};

/**
 * Download assets of book data
 * @param {Object[]} bookData Scraped book data
 * @param dataDirectory Data directory where assets will be saved
 * @returns {Promise<void>} A promise which downloads and saves assets
 */
const downloadAssets = async (bookData, dataDirectory) => {
  logger.info("Book data asset download job started");
  const start = performance.now();
  const imageData = bookData.map((datum) => ({
    url: datum.imageUrl,
    identifier: datum.productInfo.find((item) => item.key === "UPC").value,
  }));
  logger.info(
    `Number of assets scheduled to be downloaded: ${imageData.length}`
  );
  let rejectedPromises = 0;
  (await downloadBookImages(imageData, dataDirectory)).forEach((result) => {
    if (result.status === "rejected") {
      ++rejectedPromises;
      logger.error(result.reason.message);
    }
  });
  logger.info(
    `Number of assets successfully downloaded: ${
      imageData.length - rejectedPromises
    }`
  );
  const end = performance.now();
  const duration = getDuration(start, end);
  logger.info(
    `Book data asset download job completed in ${duration.hours} hr(s) ${duration.minutes} min(s) and ${duration.seconds} sec(s)`
  );
};

const BASE_URL = "http://books.toscrape.com";
const DATA_DIR = process.env.DATA_DIR ?? "data";
let bookData;
try {
  bookData = await executeBookScrapingJob(
    BASE_URL,
    `${DATA_DIR}/book-data.json`
  );
} catch (error) {
  logger.error(error.message);
}
await downloadAssets(bookData, `${DATA_DIR}/assets`);
