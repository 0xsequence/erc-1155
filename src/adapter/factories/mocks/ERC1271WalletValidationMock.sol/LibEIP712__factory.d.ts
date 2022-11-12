import { Signer, ContractFactory, BytesLike, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { PromiseOrValue } from "../../../common";
import type { LibEIP712, LibEIP712Interface } from "../../../mocks/ERC1271WalletValidationMock.sol/LibEIP712";
declare type LibEIP712ConstructorParams = [signer?: Signer] | ConstructorParameters<typeof ContractFactory>;
export declare class LibEIP712__factory extends ContractFactory {
    constructor(...args: LibEIP712ConstructorParams);
    deploy(domain_hash_1155: PromiseOrValue<BytesLike>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<LibEIP712>;
    getDeployTransaction(domain_hash_1155: PromiseOrValue<BytesLike>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): TransactionRequest;
    attach(address: string): LibEIP712;
    connect(signer: Signer): LibEIP712__factory;
    static readonly bytecode = "0x6080604052348015600f57600080fd5b506040516080380380608083398181016040526020811015602f57600080fd5b5051600055603f8060416000396000f3fe6080604052600080fdfea2646970667358221220063f87e2343ff946c2d6b04d43f5f1a37ea1880917297aba5a44c95596dce24364736f6c63430007040033";
    static readonly abi: {
        inputs: {
            internalType: string;
            name: string;
            type: string;
        }[];
        stateMutability: string;
        type: string;
    }[];
    static createInterface(): LibEIP712Interface;
    static connect(address: string, signerOrProvider: Signer | Provider): LibEIP712;
}
export {};
