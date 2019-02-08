import * as chai from 'chai'
import chaiAsPromised from 'chai-as-promised'
const ChaiBigNumber = require('chai-bignumber')
import chaiString from 'chai-string'
import * as ethers from 'ethers'

export * from './contract'
export * from './helpers'

const BigNumber = ethers.utils.BigNumber
export { BigNumber }

export const { assert, expect } = chai
  .use(chaiString)
  .use(chaiAsPromised)
  .use(ChaiBigNumber());

describe.if = function (condition: boolean, message: string, func: (this: Mocha.Suite) => void): void {
  const run: Mocha.PendingSuiteFunction = condition ? this : this.skip;
  run(message, func);
}