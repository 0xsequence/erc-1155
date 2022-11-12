import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { IERC1155, IERC1155Interface } from "../../interfaces/IERC1155";
export declare class IERC1155__factory {
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
    static createInterface(): IERC1155Interface;
    static connect(address: string, signerOrProvider: Signer | Provider): IERC1155;
}
