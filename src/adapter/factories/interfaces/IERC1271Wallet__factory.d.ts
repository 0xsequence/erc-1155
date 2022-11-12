import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { IERC1271Wallet, IERC1271WalletInterface } from "../../interfaces/IERC1271Wallet";
export declare class IERC1271Wallet__factory {
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
    static createInterface(): IERC1271WalletInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): IERC1271Wallet;
}
