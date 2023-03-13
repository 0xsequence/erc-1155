import { Signer, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { PromiseOrValue } from "../../../common";
import type { ERC2981Global, ERC2981GlobalInterface } from "../../../tokens/ERC2981/ERC2981Global";
declare type ERC2981GlobalConstructorParams = [signer?: Signer] | ConstructorParameters<typeof ContractFactory>;
export declare class ERC2981Global__factory extends ContractFactory {
    constructor(...args: ERC2981GlobalConstructorParams);
    deploy(overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ERC2981Global>;
    getDeployTransaction(overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): TransactionRequest;
    attach(address: string): ERC2981Global;
    connect(signer: Signer): ERC2981Global__factory;
    static readonly bytecode = "0x608060405234801561001057600080fd5b506102e6806100206000396000f3fe608060405234801561001057600080fd5b50600436106100415760003560e01c806301ffc9a7146100465780632a55205a1461006e578063c9823cc6146100ad575b600080fd5b6100596100543660046101cc565b6100d1565b60405190151581526020015b60405180910390f35b61008161007c366004610215565b610170565b6040805173ffffffffffffffffffffffffffffffffffffffff9093168352602083019190915201610065565b6000546001546100819173ffffffffffffffffffffffffffffffffffffffff169082565b60007fd5aadfa6000000000000000000000000000000000000000000000000000000007fffffffff0000000000000000000000000000000000000000000000000000000083160161012457506001919050565b7f01ffc9a7000000000000000000000000000000000000000000000000000000007fffffffff000000000000000000000000000000000000000000000000000000008316145b92915050565b604080518082019091526000805473ffffffffffffffffffffffffffffffffffffffff1680835260015460208401819052919283929091906103e8906101b69087610237565b6101c09190610275565b92509250509250929050565b6000602082840312156101de57600080fd5b81357fffffffff000000000000000000000000000000000000000000000000000000008116811461020e57600080fd5b9392505050565b6000806040838503121561022857600080fd5b50508035926020909101359150565b808202811582820484141761016a577f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b6000826102ab577f4e487b7100000000000000000000000000000000000000000000000000000000600052601260045260246000fd5b50049056fea264697066735822122087687791d7575f4a7d1f0def9dcfe1ad5904d82c618342ff386dcc36b20e759a64736f6c63430008120033";
    static readonly abi: {
        inputs: {
            internalType: string;
            name: string;
            type: string;
        }[];
        name: string;
        outputs: {
            internalType: string;
            name: string;
            type: string;
        }[];
        stateMutability: string;
        type: string;
    }[];
    static createInterface(): ERC2981GlobalInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): ERC2981Global;
}
export {};
