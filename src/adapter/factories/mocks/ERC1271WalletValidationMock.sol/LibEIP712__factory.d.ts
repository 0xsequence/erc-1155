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
    static readonly bytecode = "0x6080604052348015600f57600080fd5b5060405160953803806095833981016040819052602a916031565b6000556049565b600060208284031215604257600080fd5b5051919050565b603f8060566000396000f3fe6080604052600080fdfea264697066735822122037156843bc171e499afc64a1215611401502286696479e350818b7eaf0b20b0f64736f6c63430008120033";
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
