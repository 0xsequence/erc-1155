import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { IERC1155MintBurn, IERC1155MintBurnInterface } from "../../interfaces/IERC1155MintBurn";
export declare class IERC1155MintBurn__factory {
    static readonly abi: {
        inputs: {
            internalType: string;
            name: string;
            type: string;
        }[];
        name: string;
        outputs: never[];
        stateMutability: string;
        type: string;
    }[];
    static createInterface(): IERC1155MintBurnInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): IERC1155MintBurn;
}
