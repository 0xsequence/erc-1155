import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { IERC1155TokenReceiver, IERC1155TokenReceiverInterface } from "../../interfaces/IERC1155TokenReceiver";
export declare class IERC1155TokenReceiver__factory {
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
    static createInterface(): IERC1155TokenReceiverInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): IERC1155TokenReceiver;
}
