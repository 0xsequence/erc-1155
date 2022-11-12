import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { IERC1155Metadata, IERC1155MetadataInterface } from "../../interfaces/IERC1155Metadata";
export declare class IERC1155Metadata__factory {
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
    static createInterface(): IERC1155MetadataInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): IERC1155Metadata;
}
