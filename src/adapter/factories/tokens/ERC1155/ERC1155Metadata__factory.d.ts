import { Signer, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { PromiseOrValue } from "../../../common";
import type { ERC1155Metadata, ERC1155MetadataInterface } from "../../../tokens/ERC1155/ERC1155Metadata";
declare type ERC1155MetadataConstructorParams = [signer?: Signer] | ConstructorParameters<typeof ContractFactory>;
export declare class ERC1155Metadata__factory extends ContractFactory {
    constructor(...args: ERC1155MetadataConstructorParams);
    deploy(_name: PromiseOrValue<string>, _baseURI: PromiseOrValue<string>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ERC1155Metadata>;
    getDeployTransaction(_name: PromiseOrValue<string>, _baseURI: PromiseOrValue<string>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): TransactionRequest;
    attach(address: string): ERC1155Metadata;
    connect(signer: Signer): ERC1155Metadata__factory;
    static readonly bytecode = "0x60806040523480156200001157600080fd5b5060405162000ad338038062000ad383398101604081905262000034916200013e565b600162000042838262000238565b50600062000051828262000238565b5050506200035f565b634e487b7160e01b600052604160045260246000fd5b600082601f8301126200008257600080fd5b815167ffffffffffffffff80821115620000a057620000a06200005a565b604051601f83017fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe0908116603f01168101908282118183101715620000e957620000e96200005a565b816040528381526020925086838588010111156200010657600080fd5b600091505b838210156200012a57858201830151818301840152908201906200010b565b600093810190920192909252949350505050565b600080604083850312156200015257600080fd5b825167ffffffffffffffff808211156200016b57600080fd5b620001798683870162000070565b935060208501519150808211156200019057600080fd5b506200019f8582860162000070565b9150509250929050565b600181811c90821680620001be57607f821691505b602082108103620001df57634e487b7160e01b600052602260045260246000fd5b50919050565b601f8211156200023357600081815260208120601f850160051c810160208610156200020e5750805b601f850160051c820191505b818110156200022f578281556001016200021a565b5050505b505050565b815167ffffffffffffffff8111156200025557620002556200005a565b6200026d81620002668454620001a9565b84620001e5565b602080601f831160018114620002c357600084156200028c5750858301515b7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff600386901b1c1916600185901b1785556200022f565b6000858152602081207fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe08616915b828110156200031257888601518255948401946001909101908401620002f1565b50858210156200034f57878501517fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff600388901b60f8161c191681555b5050505050600190811b01905550565b610764806200036f6000396000f3fe608060405234801561001057600080fd5b506004361061004c5760003560e01c806301ffc9a71461005157806306fdde03146100795780630e89341c1461008e5780636c0360eb146100a1575b600080fd5b61006461005f366004610364565b6100a9565b60405190151581526020015b60405180910390f35b610081610148565b60405161007091906103d1565b61008161009c366004610422565b6101d6565b61008161020a565b60007ff176cbe4000000000000000000000000000000000000000000000000000000007fffffffff000000000000000000000000000000000000000000000000000000008316016100fc57506001919050565b7f01ffc9a7000000000000000000000000000000000000000000000000000000007fffffffff000000000000000000000000000000000000000000000000000000008316145b92915050565b600180546101559061043b565b80601f01602080910402602001604051908101604052809291908181526020018280546101819061043b565b80156101ce5780601f106101a3576101008083540402835291602001916101ce565b820191906000526020600020905b8154815290600101906020018083116101b157829003601f168201915b505050505081565b606060006101e383610217565b6040516020016101f49291906104aa565b6040516020818303038152906040529050919050565b600080546101559061043b565b60608160000361025a57505060408051808201909152600181527f3000000000000000000000000000000000000000000000000000000000000000602082015290565b818060005b8215610285578061026f816105e6565b915061027e9050600a8461064d565b925061025f565b60008167ffffffffffffffff8111156102a0576102a0610661565b6040519080825280601f01601f1916602001820160405280156102ca576020820181803683370190505b50905060006102da600184610690565b90505b831561035a576102ee600a856106a3565b6102f99060306106b7565b60f81b8282610307816106ca565b935081518110610319576103196106ff565b60200101907effffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916908160001a905350610353600a8561064d565b93506102dd565b5095945050505050565b60006020828403121561037657600080fd5b81357fffffffff00000000000000000000000000000000000000000000000000000000811681146103a657600080fd5b9392505050565b60005b838110156103c85781810151838201526020016103b0565b50506000910152565b60208152600082518060208401526103f08160408501602087016103ad565b601f017fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe0169190910160400192915050565b60006020828403121561043457600080fd5b5035919050565b600181811c9082168061044f57607f821691505b602082108103610488577f4e487b7100000000000000000000000000000000000000000000000000000000600052602260045260246000fd5b50919050565b600081516104a08185602086016103ad565b9290920192915050565b600080845481600182811c9150808316806104c657607f831692505b602080841082036104fe577f4e487b710000000000000000000000000000000000000000000000000000000086526022600452602486fd5b818015610512576001811461054557610572565b7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff0086168952841515850289019650610572565b60008b81526020902060005b8681101561056a5781548b820152908501908301610551565b505084890196505b5050505050506105ae610585828661048e565b7f2e6a736f6e000000000000000000000000000000000000000000000000000000815260050190565b95945050505050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b60007fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff8203610617576106176105b7565b5060010190565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601260045260246000fd5b60008261065c5761065c61061e565b500490565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b81810381811115610142576101426105b7565b6000826106b2576106b261061e565b500690565b80820180821115610142576101426105b7565b6000816106d9576106d96105b7565b507fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff0190565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fdfea26469706673582212202e9f86dee7a15ba8b1032664a46e3ca9d74a96b5a1ee9355ce94d47bcb888f9764736f6c63430008120033";
    static readonly abi: ({
        inputs: {
            internalType: string;
            name: string;
            type: string;
        }[];
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
        anonymous?: undefined;
    })[];
    static createInterface(): ERC1155MetadataInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): ERC1155Metadata;
}
export {};
