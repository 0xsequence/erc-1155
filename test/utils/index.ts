import * as chai from 'chai'
import chaiAsPromised from 'chai-as-promised'
import chaiBignumber from 'chai-bignumber'
import chaiString from 'chai-string'
import * as ethers from 'ethers'

export * from './contract'
export * from './misc'

const BigNumber = ethers.utils.BigNumber
export { BigNumber }

export const expect = chai
  .use(chaiString)
  .use(chaiAsPromised)
  .use(chaiBignumber(ethers.utils.BigNumber)).expect
