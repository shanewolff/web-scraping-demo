# Web Scraping Demo

This repository contains a demo web scraping job developed with NodeJS. The chosen website for scraping is [ToScrape - Books](http://books.toscrape.com). All book details available in the website are scraped with this scraping job.

## How to run?

To setup the environment, NodeJS v18 or above and Yarn v1 are required to be installed. After these requirements are met, follow the below steps to scrape the website.

1. Run `yarn install` in repo root to install all dependencies.
2. Create a `.env` file and add `DATA_DIR` variable as mentioned in `.env.example` file. It should be the file path where all data will be persisted. If not set, a default directory `data` in the repo root will be considered.
3. Run `yarn run start` to execute the scraping job.

Once the job completed running, the scraped book info will be available as a JSON file at `DATA_DIR/book-data.json`. The downloaded book images will be available at `DATA_DIR/assets`. All logs will be saved inside `logs` directory in the repo root. If `logs/error.log` file does not contain any error logs, the job has been executed successfully.
