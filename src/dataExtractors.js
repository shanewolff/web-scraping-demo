import { bookPageSelectors } from './selectors.js';
import {
  BookCategoryNotFoundError,
  BookDescriptionNotFoundError,
  BookImageURLFoundError,
  BookProductInfoNotFoundError,
  BookRatingNotFoundError,
  BookTitleNotFoundError,
} from './errors.js';

/**
 * Extract book category from the book details page
 * @param {function} $ Cheerio load function object
 * @returns {string} Book category
 * @throws {BookCategoryNotFoundError} A new book category not found error if category breadcrumb not found
 */
export const extractBookCategory = ($, bookPageUrl) => {
  // Select the breadcrumb before the last one
  const $category = $(bookPageSelectors.breadcrumbs).eq(-2);
  if (!$category) {
    throw new BookCategoryNotFoundError(bookPageUrl);
  }
  // Return the text content of the selected breadcrumb
  return $category.text().trim();
};

/**
 * Extract book title from the book details page
 * @param {function} $ Cheerio load function object
 * @returns {string} Book title
 * @throws {BookTitleNotFoundError} A new book title not found error if the title element could not be located
 */
export const extractBookTitle = ($, bookPageUrl) =>
  // Return the text content of the selected title element
  {
    const titleElementArray = $(bookPageSelectors.title);
    if (titleElementArray.length === 0) {
      throw new BookTitleNotFoundError(bookPageUrl);
    }
    return titleElementArray.eq(0).text().trim();
  };

/**
 * Extract book rating from the book details page
 * @param {function} $ Cheerio load function object
 * @returns {string} Book rating
 */
export const extractBookRating = ($) => {
  try {
    // Return the star rating from the class name applied to star rating element
    return $(bookPageSelectors.rating)
      .eq(0)
      .attr('class')
      .trim()
      .match(/[A-Z][a-z]+$/)
      .at(0);
  } catch (error) {
    throw new BookRatingNotFoundError(bookPageUrl);
  }
};

/**
 * Extract the book description from the book details page
 * @param {function} $ Cheerio load function object
 * @returns {string} Book description
 */
export const extractBookDescription = ($) => {
  try {
    // Return the text content of the selected description element
    return $(bookPageSelectors.description).text().trim();
  } catch (error) {
    throw new BookDescriptionNotFoundError(bookPageUrl);
  }
};

/**
 * Extract book product information from the book details page
 * @param {function} $ Cheerio load function object
 * @returns {Object} Book product information
 */
export const extractBookProductInfo = ($) => {
  try {
    // Collect info keys
    const productInfoKeys = $(bookPageSelectors.productInfoKeys)
      .toArray()
      .map((element) => $(element).text().trim());
    // Collect info data
    const productInfoData = $(bookPageSelectors.productInfoData)
      .toArray()
      .map((element) => $(element).text().trim());
    // Find the least number of items
    const items =
      productInfoKeys.length < productInfoData.length
        ? productInfoKeys.length
        : productInfoData.length;
    const productInfo = [];
    // Combine keys and data values
    for (let index = 0; index < items; ++index) {
      productInfo.push({
        key: productInfoKeys[index],
        value: productInfoData[index],
      });
    }
    // Return the book product info object
    return productInfo;
  } catch (error) {
    throw new BookProductInfoNotFoundError(bookPageUrl);
  }
};

/**
 * Extract the book image URL from the book details page
 * @param {function} $ Cheerio load function object
 * @param {string} bookPageUrl Current book details page URL
 * @returns {string} Book image URL
 */
export const extractBookImageUrl = ($, bookPageUrl) => {
  try {
    // Return the text content of the selected description element
    return new URL($(bookPageSelectors.image).attr('src').trim(), bookPageUrl)
      .href;
  } catch (error) {
    throw new BookImageURLFoundError(bookPageUrl);
  }
};
