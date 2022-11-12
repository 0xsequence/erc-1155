import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { IERC165, IERC165Interface } from "../../interfaces/IERC165";
export declare class IERC165__factory {
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
    static createInterface(): IERC165Interface;
    static connect(address: string, signerOrProvider: Signer | Provider): IERC165;
}
