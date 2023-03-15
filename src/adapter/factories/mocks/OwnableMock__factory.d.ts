import { Signer, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { PromiseOrValue } from "../../common";
import type { OwnableMock, OwnableMockInterface } from "../../mocks/OwnableMock";
declare type OwnableMockConstructorParams = [signer?: Signer] | ConstructorParameters<typeof ContractFactory>;
export declare class OwnableMock__factory extends ContractFactory {
    constructor(...args: OwnableMockConstructorParams);
    deploy(overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<OwnableMock>;
    getDeployTransaction(overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): TransactionRequest;
    attach(address: string): OwnableMock;
    connect(signer: Signer): OwnableMock__factory;
    static readonly bytecode = "0x60806040526000600155600060025534801561001a57600080fd5b50600080547fffffffffffffffffffffffff0000000000000000000000000000000000000000163390811782556040519091907f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0908290a3610404806100816000396000f3fe608060405234801561001057600080fd5b506004361061004c5760003560e01c8063776e8c30146100515780638da5cb5b1461005b578063aae7aa4b14610087578063f2fde38b1461008f575b600080fd5b6100596100a2565b005b6000546040805173ffffffffffffffffffffffffffffffffffffffff9092168252519081900360200190f35b6100596100bc565b61005961009d366004610351565b61017a565b6001600260008282546100b5919061038e565b9091555050565b60005473ffffffffffffffffffffffffffffffffffffffff163314610168576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152602660248201527f4f776e61626c65236f6e6c794f776e65723a2053454e4445525f49535f4e4f5460448201527f5f4f574e4552000000000000000000000000000000000000000000000000000060648201526084015b60405180910390fd5b60018060008282546100b5919061038e565b60005473ffffffffffffffffffffffffffffffffffffffff163314610221576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152602660248201527f4f776e61626c65236f6e6c794f776e65723a2053454e4445525f49535f4e4f5460448201527f5f4f574e45520000000000000000000000000000000000000000000000000000606482015260840161015f565b73ffffffffffffffffffffffffffffffffffffffff81166102c4576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152602a60248201527f4f776e61626c65237472616e736665724f776e6572736869703a20494e56414c60448201527f49445f4144445245535300000000000000000000000000000000000000000000606482015260840161015f565b6000805460405173ffffffffffffffffffffffffffffffffffffffff808516939216917f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e091a3600080547fffffffffffffffffffffffff00000000000000000000000000000000000000001673ffffffffffffffffffffffffffffffffffffffff92909216919091179055565b60006020828403121561036357600080fd5b813573ffffffffffffffffffffffffffffffffffffffff8116811461038757600080fd5b9392505050565b808201808211156103c8577f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b9291505056fea2646970667358221220215243c83440a734bd5320b037685c098161b47d238ce78f571947f111fe261764736f6c63430008120033";
    static readonly abi: ({
        anonymous: boolean;
        inputs: {
            indexed: boolean;
            internalType: string;
            name: string;
            type: string;
        }[];
        name: string;
        type: string;
        outputs?: undefined;
        stateMutability?: undefined;
    } | {
        inputs: never[];
        name: string;
        outputs: {
            internalType: string;
            name: string;
            type: string;
        }[];
        stateMutability: string;
        type: string;
        anonymous?: undefined;
    } | {
        inputs: {
            internalType: string;
            name: string;
            type: string;
        }[];
        name: string;
        outputs: never[];
        stateMutability: string;
        type: string;
        anonymous?: undefined;
    })[];
    static createInterface(): OwnableMockInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): OwnableMock;
}
export {};
