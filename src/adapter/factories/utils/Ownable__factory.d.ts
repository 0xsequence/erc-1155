import { Signer, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { PromiseOrValue } from "../../common";
import type { Ownable, OwnableInterface } from "../../utils/Ownable";
declare type OwnableConstructorParams = [signer?: Signer] | ConstructorParameters<typeof ContractFactory>;
export declare class Ownable__factory extends ContractFactory {
    constructor(...args: OwnableConstructorParams);
    deploy(overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<Ownable>;
    getDeployTransaction(overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): TransactionRequest;
    attach(address: string): Ownable;
    connect(signer: Signer): Ownable__factory;
    static readonly bytecode = "0x608060405234801561001057600080fd5b50600080547fffffffffffffffffffffffff0000000000000000000000000000000000000000163390811782556040519091907f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0908290a36102cb806100776000396000f3fe608060405234801561001057600080fd5b50600436106100365760003560e01c80638da5cb5b1461003b578063f2fde38b14610067575b600080fd5b6000546040805173ffffffffffffffffffffffffffffffffffffffff9092168252519081900360200190f35b61007a610075366004610258565b61007c565b005b60005473ffffffffffffffffffffffffffffffffffffffff163314610128576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152602660248201527f4f776e61626c65236f6e6c794f776e65723a2053454e4445525f49535f4e4f5460448201527f5f4f574e4552000000000000000000000000000000000000000000000000000060648201526084015b60405180910390fd5b73ffffffffffffffffffffffffffffffffffffffff81166101cb576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152602a60248201527f4f776e61626c65237472616e736665724f776e6572736869703a20494e56414c60448201527f49445f4144445245535300000000000000000000000000000000000000000000606482015260840161011f565b6000805460405173ffffffffffffffffffffffffffffffffffffffff808516939216917f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e091a3600080547fffffffffffffffffffffffff00000000000000000000000000000000000000001673ffffffffffffffffffffffffffffffffffffffff92909216919091179055565b60006020828403121561026a57600080fd5b813573ffffffffffffffffffffffffffffffffffffffff8116811461028e57600080fd5b939250505056fea2646970667358221220142f6fda398d8c1ffe25daf80e99165e7a65359f86ec34f9a4986d95e7fc73aa64736f6c63430008120033";
    static readonly abi: ({
        inputs: never[];
        stateMutability: string;
        type: string;
        anonymous?: undefined;
        name?: undefined;
        outputs?: undefined;
    } | {
        anonymous: boolean;
        inputs: {
            indexed: boolean;
            internalType: string;
            name: string;
            type: string;
        }[];
        name: string;
        type: string;
        stateMutability?: undefined;
        outputs?: undefined;
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
    static createInterface(): OwnableInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): Ownable;
}
export {};
