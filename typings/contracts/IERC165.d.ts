/* Generated by ts-generator ver. 0.0.8 */
/* tslint:disable */

import { Contract, ContractTransaction, EventFilter, Signer } from "ethers";
import { Listener, Provider } from "ethers/providers";
import { Arrayish, BigNumber, BigNumberish, Interface } from "ethers/utils";
import {
  TransactionOverrides,
  TypedEventDescription,
  TypedFunctionDescription
} from ".";

interface IERC165Interface extends Interface {
  functions: {
    supportsInterface: TypedFunctionDescription<{
      encode([_interfaceId]: [Arrayish]): string;
    }>;
  };

  events: {};
}

export class IERC165 extends Contract {
  connect(signerOrProvider: Signer | Provider | string): IERC165;
  attach(addressOrName: string): IERC165;
  deployed(): Promise<IERC165>;

  on(event: EventFilter | string, listener: Listener): IERC165;
  once(event: EventFilter | string, listener: Listener): IERC165;
  addListener(eventName: EventFilter | string, listener: Listener): IERC165;
  removeAllListeners(eventName: EventFilter | string): IERC165;
  removeListener(eventName: any, listener: Listener): IERC165;

  interface: IERC165Interface;

  functions: {
    supportsInterface(_interfaceId: Arrayish): Promise<boolean>;
  };

  supportsInterface(_interfaceId: Arrayish): Promise<boolean>;

  filters: {};

  estimate: {
    supportsInterface(_interfaceId: Arrayish): Promise<BigNumber>;
  };
}