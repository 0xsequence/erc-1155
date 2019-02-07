export {};

// Adding if method for mocha's describe method
/* https://github.com/mochajs/mocha/issues/591#issuecomment-443841252 */
/// <reference path="../node_modules/@types/mocha/index.d.ts" />
declare module "mocha" {
  interface SuiteFunction {
      if: (condition: boolean, message: string, func: (this: Mocha.Suite) => void) => void;
  }
}