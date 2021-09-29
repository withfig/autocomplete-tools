import chalk from "chalk";

// An enum representing the log level and the color to use
// in chalk to render this level.
// eslint-disable-next-line no-shadow
export enum Level {
  INFO = "blue",
  ERROR = "red",
  SUCCESS = "green",
}

/**
 * Log a message in the console. Can specify a Level, which
 * will be INFO by default.
 *
 * @param message The message to log
 * @param level The level to log
 */
export default abstract class SpecLogger {
  static log(message: string, level: Level = Level.INFO): void {
    console.log(chalk[level](message));
  }
}
