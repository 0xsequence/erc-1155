import type { BaseContract, BigNumber, BytesLike, CallOverrides, PopulatedTransaction, Signer, utils } from "ethers";
import type { FunctionFragment, Result } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type { TypedEventFilter, TypedEvent, TypedListener, OnEvent, PromiseOrValue } from "../common";
export interface SignatureValidatorInterface extends utils.Interface {
    functions: {
        "isValidSignature(address,bytes32,bytes,bytes)": FunctionFragment;
    };
    getFunction(nameOrSignatureOrTopic: "isValidSignature"): FunctionFragment;
    encodeFunctionData(functionFragment: "isValidSignature", values: [
        PromiseOrValue<string>,
        PromiseOrValue<BytesLike>,
        PromiseOrValue<BytesLike>,
        PromiseOrValue<BytesLike>
    ]): string;
    decodeFunctionResult(functionFragment: "isValidSignature", data: BytesLike): Result;
    events: {};
}
export interface SignatureValidator extends BaseContract {
    connect(signerOrProvider: Signer | Provider | string): this;
    attach(addressOrName: string): this;
    deployed(): Promise<this>;
    interface: SignatureValidatorInterface;
    queryFilter<TEvent extends TypedEvent>(event: TypedEventFilter<TEvent>, fromBlockOrBlockhash?: string | number | undefined, toBlock?: string | number | undefined): Promise<Array<TEvent>>;
    listeners<TEvent extends TypedEvent>(eventFilter?: TypedEventFilter<TEvent>): Array<TypedListener<TEvent>>;
    listeners(eventName?: string): Array<Listener>;
    removeAllListeners<TEvent extends TypedEvent>(eventFilter: TypedEventFilter<TEvent>): this;
    removeAllListeners(eventName?: string): this;
    off: OnEvent<this>;
    on: OnEvent<this>;
    once: OnEvent<this>;
    removeListener: OnEvent<this>;
    functions: {
        isValidSignature(_signerAddress: PromiseOrValue<string>, _hash: PromiseOrValue<BytesLike>, _data: PromiseOrValue<BytesLike>, _sig: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<[boolean] & {
            isValid: boolean;
        }>;
    };
    isValidSignature(_signerAddress: PromiseOrValue<string>, _hash: PromiseOrValue<BytesLike>, _data: PromiseOrValue<BytesLike>, _sig: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<boolean>;
    callStatic: {
        isValidSignature(_signerAddress: PromiseOrValue<string>, _hash: PromiseOrValue<BytesLike>, _data: PromiseOrValue<BytesLike>, _sig: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<boolean>;
    };
    filters: {};
    estimateGas: {
        isValidSignature(_signerAddress: PromiseOrValue<string>, _hash: PromiseOrValue<BytesLike>, _data: PromiseOrValue<BytesLike>, _sig: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<BigNumber>;
    };
    populateTransaction: {
        isValidSignature(_signerAddress: PromiseOrValue<string>, _hash: PromiseOrValue<BytesLike>, _data: PromiseOrValue<BytesLike>, _sig: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<PopulatedTransaction>;
    };
}
