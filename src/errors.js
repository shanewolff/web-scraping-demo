class CustomError extends Error {
  /**
   * Base custom error class for all errors
   * @param {string} name Name of the error
   * @param {string} message Error message
   * @returns {CustomError} A new custom error object
   */
  constructor(name, message) {
    super(message);
    this.name = name;
    Error.captureStackTrace(this);
  }
}

class NetworkError extends CustomError {
  /**
   * Base custom error class for all types of network errors
   * @param {string} name Error name
   * @param {string} message Error message
   * @param {string} requestUrl URL of the request issued
   * @returns {NetworkError} A new network error object
   */
  constructor(name, message, requestUrl) {
    super(name, message);
    this.requestUrl = requestUrl;
  }
}

export class UnsuccessfulResponseError extends NetworkError {
  /**
   * Error class for all network responses which are not in 2xx category
   * @param {string} requestUrl URL of the request issued
   * @returns {UnsuccessfulResponseError} A new unsuccessful response error object
   */
  constructor(requestUrl) {
    super(
      'UnsuccessfulResponseError',
      `Unsuccessful network response returned for ${requestUrl}`,
      requestUrl
    );
  }
}

export class NoResponseError extends NetworkError {
  /**
   * Error class for all network responses which are classified in 5xx category
   * @param {string} requestUrl URL of the request issued
   * @returns {NoResponseError} A new no-response error object
   */
  constructor(requestUrl) {
    super(
      'NoResponseError',
      `No response received for the request ${requestUrl}`,
      requestUrl
    );
  }
}

export class FileWriteError extends CustomError {
  /**
   * Error class for unsuccessful file creation
   * @param {string} filePath The file path to be persisted
   * @returns {FileWriteError} A new file persisting error
   */
  constructor(filePath) {
    super('FileWriteError', `Data could not be written to ${filePath}`);
    this.filePath = filePath;
  }
}

export class CatalogPageCountNotFoundError extends CustomError {
  /**
   * Error class for total catalog page info not found
   */
  constructor() {
    super(
      'CatalogPageCountNotFoundError',
      'Could not locate or extract total catalog page count'
    );
  }
}

export class BookCategoryNotFoundError extends CustomError {
  /**
   * Error class for book category not found
   */
  constructor(bookPageUrl) {
    super(
      'BookCategoryNotFoundError',
      `Could not locate the book category breadcrumb on ${bookPageUrl}`
    );
  }
}

export class BookTitleNotFoundError extends CustomError {
  /**
   * Error class for book title not found
   */
  constructor(bookPageUrl) {
    super(
      'BookTitleNotFoundError',
      `Could not locate the book title on ${bookPageUrl}`
    );
  }
}

export class BookRatingNotFoundError extends CustomError {
  /**
   * Error class for book rating not found
   */
  constructor(bookPageUrl) {
    super(
      'BookRatingNotFoundError',
      `Could not locate the book rating on ${bookPageUrl}`
    );
  }
}

export class BookDescriptionNotFoundError extends CustomError {
  /**
   * Error class for book description not found
   */
  constructor(bookPageUrl) {
    super(
      'BookDescriptionNotFoundError',
      `Could not locate the book description on ${bookPageUrl}`
    );
  }
}

export class BookProductInfoNotFoundError extends CustomError {
  /**
   * Error class for book product info not found
   */
  constructor(bookPageUrl) {
    super(
      'BookProductInfoNotFoundError',
      `Could not locate the book product info on ${bookPageUrl}`
    );
  }
}

export class BookImageURLFoundError extends CustomError {
  /**
   * Error class for book image URL not found
   */
  constructor(bookPageUrl) {
    super(
      'BookImageURLFoundError',
      `Could not locate the book image URL on ${bookPageUrl}`
    );
  }
}
