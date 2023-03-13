import winston, { format, transports } from "winston";

const { printf, combine, timestamp, json } = format;
const { File, Console } = transports;

// Define a custom console log format to show level, message, timestamp and metadata
const customConsoleLogFormat = printf(
  ({ level, message, timestamp, ...metadata }) => {
    let logString = `${timestamp} ${level}: ${message}`;
    if (metadata && Object.entries(metadata).length !== 0) {
      logString += ` ${JSON.stringify(metadata)}`;
    }
    return logString;
  }
);

// Define a custom file log format to include timestamp
const customFileLogFormat = combine(timestamp(), json());

// Define a logger instance
const logger = winston.createLogger({
  level: "debug",
  format: json(),
  // Add two separate transports for combined logs and error logs
  transports: [
    new File({
      filename: "logs/error.log",
      level: "error",
      format: customFileLogFormat,
    }),
    new File({ filename: "logs/combined.log", format: customFileLogFormat }),
  ],
});

// If the environment is not production, add logs to console as well
if (process.env.NODE_ENV !== "production") {
  logger.add(
    new Console({
      format: combine(timestamp(), customConsoleLogFormat),
    })
  );
}

export default logger;
