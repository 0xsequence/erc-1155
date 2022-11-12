import type { BaseContract, BigNumber, BigNumberish, BytesLike, CallOverrides, PopulatedTransaction, Signer, utils } from "ethers";
import type { FunctionFragment, Result, EventFragment } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type { TypedEventFilter, TypedEvent, TypedListener, OnEvent, PromiseOrValue } from "../../common";
export interface ERC1155MetadataInterface extends utils.Interface {
    functions: {
        "baseURI()": FunctionFragment;
        "name()": FunctionFragment;
        "supportsInterface(bytes4)": FunctionFragment;
        "uri(uint256)": FunctionFragment;
    };
    getFunction(nameOrSignatureOrTopic: "baseURI" | "name" | "supportsInterface" | "uri"): FunctionFragment;
    encodeFunctionData(functionFragment: "baseURI", values?: undefined): string;
    encodeFunctionData(functionFragment: "name", values?: undefined): string;
    encodeFunctionData(functionFragment: "supportsInterface", values: [PromiseOrValue<BytesLike>]): string;
    encodeFunctionData(functionFragment: "uri", values: [PromiseOrValue<BigNumberish>]): string;
    decodeFunctionResult(functionFragment: "baseURI", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "name", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "supportsInterface", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "uri", data: BytesLike): Result;
    events: {
        "URI(string,uint256)": EventFragment;
    };
    getEvent(nameOrSignatureOrTopic: "URI"): EventFragment;
}
export interface URIEventObject {
    _uri: string;
    _id: BigNumber;
}
export declare type URIEvent = TypedEvent<[string, BigNumber], URIEventObject>;
export declare type URIEventFilter = TypedEventFilter<URIEvent>;
export interface ERC1155Metadata extends BaseContract {
    connect(signerOrProvider: Signer | Provider | string): this;
    attach(addressOrName: string): this;
    deployed(): Promise<this>;
    interface: ERC1155MetadataInterface;
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
        baseURI(overrides?: CallOverrides): Promise<[string]>;
        name(overrides?: CallOverrides): Promise<[string]>;
        supportsInterface(_interfaceID: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<[boolean]>;
        uri(_id: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<[string]>;
    };
    baseURI(overrides?: CallOverrides): Promise<string>;
    name(overrides?: CallOverrides): Promise<string>;
    supportsInterface(_interfaceID: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<boolean>;
    uri(_id: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<string>;
    callStatic: {
        baseURI(overrides?: CallOverrides): Promise<string>;
        name(overrides?: CallOverrides): Promise<string>;
        supportsInterface(_interfaceID: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<boolean>;
        uri(_id: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<string>;
    };
    filters: {
        "URI(string,uint256)"(_uri?: null, _id?: PromiseOrValue<BigNumberish> | null): URIEventFilter;
        URI(_uri?: null, _id?: PromiseOrValue<BigNumberish> | null): URIEventFilter;
    };
    estimateGas: {
        baseURI(overrides?: CallOverrides): Promise<BigNumber>;
        name(overrides?: CallOverrides): Promise<BigNumber>;
        supportsInterface(_interfaceID: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<BigNumber>;
        uri(_id: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<BigNumber>;
    };
    populateTransaction: {
        baseURI(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        name(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        supportsInterface(_interfaceID: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        uri(_id: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<PopulatedTransaction>;
    };
}
