import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { IERC1155Meta, IERC1155MetaInterface } from "../../interfaces/IERC1155Meta";
export declare class IERC1155Meta__factory {
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
        outputs: never[];
        stateMutability: string;
        type: string;
        anonymous?: undefined;
    })[];
    static createInterface(): IERC1155MetaInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): IERC1155Meta;
}
