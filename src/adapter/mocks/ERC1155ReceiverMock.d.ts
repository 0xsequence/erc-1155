import type { BaseContract, BigNumber, BigNumberish, BytesLike, CallOverrides, ContractTransaction, Overrides, PopulatedTransaction, Signer, utils } from "ethers";
import type { FunctionFragment, Result, EventFragment } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type { TypedEventFilter, TypedEvent, TypedListener, OnEvent, PromiseOrValue } from "../common";
export interface ERC1155ReceiverMockInterface extends utils.Interface {
    functions: {
        "lastData()": FunctionFragment;
        "lastId()": FunctionFragment;
        "lastOperator()": FunctionFragment;
        "lastValue()": FunctionFragment;
        "onERC1155BatchReceived(address,address,uint256[],uint256[],bytes)": FunctionFragment;
        "onERC1155Received(address,address,uint256,uint256,bytes)": FunctionFragment;
        "setShouldReject(bool)": FunctionFragment;
        "shouldReject()": FunctionFragment;
        "supportsInterface(bytes4)": FunctionFragment;
    };
    getFunction(nameOrSignatureOrTopic: "lastData" | "lastId" | "lastOperator" | "lastValue" | "onERC1155BatchReceived" | "onERC1155Received" | "setShouldReject" | "shouldReject" | "supportsInterface"): FunctionFragment;
    encodeFunctionData(functionFragment: "lastData", values?: undefined): string;
    encodeFunctionData(functionFragment: "lastId", values?: undefined): string;
    encodeFunctionData(functionFragment: "lastOperator", values?: undefined): string;
    encodeFunctionData(functionFragment: "lastValue", values?: undefined): string;
    encodeFunctionData(functionFragment: "onERC1155BatchReceived", values: [
        PromiseOrValue<string>,
        PromiseOrValue<string>,
        PromiseOrValue<BigNumberish>[],
        PromiseOrValue<BigNumberish>[],
        PromiseOrValue<BytesLike>
    ]): string;
    encodeFunctionData(functionFragment: "onERC1155Received", values: [
        PromiseOrValue<string>,
        PromiseOrValue<string>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BytesLike>
    ]): string;
    encodeFunctionData(functionFragment: "setShouldReject", values: [PromiseOrValue<boolean>]): string;
    encodeFunctionData(functionFragment: "shouldReject", values?: undefined): string;
    encodeFunctionData(functionFragment: "supportsInterface", values: [PromiseOrValue<BytesLike>]): string;
    decodeFunctionResult(functionFragment: "lastData", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "lastId", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "lastOperator", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "lastValue", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "onERC1155BatchReceived", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "onERC1155Received", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "setShouldReject", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "shouldReject", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "supportsInterface", data: BytesLike): Result;
    events: {
        "TransferBatchReceiver(address,address,uint256[],uint256[])": EventFragment;
        "TransferSingleReceiver(address,address,uint256,uint256)": EventFragment;
    };
    getEvent(nameOrSignatureOrTopic: "TransferBatchReceiver"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "TransferSingleReceiver"): EventFragment;
}
export interface TransferBatchReceiverEventObject {
    _from: string;
    _to: string;
    _fromBalances: BigNumber[];
    _toBalances: BigNumber[];
}
export declare type TransferBatchReceiverEvent = TypedEvent<[
    string,
    string,
    BigNumber[],
    BigNumber[]
], TransferBatchReceiverEventObject>;
export declare type TransferBatchReceiverEventFilter = TypedEventFilter<TransferBatchReceiverEvent>;
export interface TransferSingleReceiverEventObject {
    _from: string;
    _to: string;
    _fromBalance: BigNumber;
    _toBalance: BigNumber;
}
export declare type TransferSingleReceiverEvent = TypedEvent<[
    string,
    string,
    BigNumber,
    BigNumber
], TransferSingleReceiverEventObject>;
export declare type TransferSingleReceiverEventFilter = TypedEventFilter<TransferSingleReceiverEvent>;
export interface ERC1155ReceiverMock extends BaseContract {
    connect(signerOrProvider: Signer | Provider | string): this;
    attach(addressOrName: string): this;
    deployed(): Promise<this>;
    interface: ERC1155ReceiverMockInterface;
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
        lastData(overrides?: CallOverrides): Promise<[string]>;
        lastId(overrides?: CallOverrides): Promise<[BigNumber]>;
        lastOperator(overrides?: CallOverrides): Promise<[string]>;
        lastValue(overrides?: CallOverrides): Promise<[BigNumber]>;
        onERC1155BatchReceived(arg0: PromiseOrValue<string>, _from: PromiseOrValue<string>, _ids: PromiseOrValue<BigNumberish>[], arg3: PromiseOrValue<BigNumberish>[], _data: PromiseOrValue<BytesLike>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        onERC1155Received(arg0: PromiseOrValue<string>, _from: PromiseOrValue<string>, _id: PromiseOrValue<BigNumberish>, arg3: PromiseOrValue<BigNumberish>, _data: PromiseOrValue<BytesLike>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        setShouldReject(_value: PromiseOrValue<boolean>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        shouldReject(overrides?: CallOverrides): Promise<[boolean]>;
        supportsInterface(interfaceID: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<[boolean]>;
    };
    lastData(overrides?: CallOverrides): Promise<string>;
    lastId(overrides?: CallOverrides): Promise<BigNumber>;
    lastOperator(overrides?: CallOverrides): Promise<string>;
    lastValue(overrides?: CallOverrides): Promise<BigNumber>;
    onERC1155BatchReceived(arg0: PromiseOrValue<string>, _from: PromiseOrValue<string>, _ids: PromiseOrValue<BigNumberish>[], arg3: PromiseOrValue<BigNumberish>[], _data: PromiseOrValue<BytesLike>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    onERC1155Received(arg0: PromiseOrValue<string>, _from: PromiseOrValue<string>, _id: PromiseOrValue<BigNumberish>, arg3: PromiseOrValue<BigNumberish>, _data: PromiseOrValue<BytesLike>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    setShouldReject(_value: PromiseOrValue<boolean>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    shouldReject(overrides?: CallOverrides): Promise<boolean>;
    supportsInterface(interfaceID: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<boolean>;
    callStatic: {
        lastData(overrides?: CallOverrides): Promise<string>;
        lastId(overrides?: CallOverrides): Promise<BigNumber>;
        lastOperator(overrides?: CallOverrides): Promise<string>;
        lastValue(overrides?: CallOverrides): Promise<BigNumber>;
        onERC1155BatchReceived(arg0: PromiseOrValue<string>, _from: PromiseOrValue<string>, _ids: PromiseOrValue<BigNumberish>[], arg3: PromiseOrValue<BigNumberish>[], _data: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<string>;
        onERC1155Received(arg0: PromiseOrValue<string>, _from: PromiseOrValue<string>, _id: PromiseOrValue<BigNumberish>, arg3: PromiseOrValue<BigNumberish>, _data: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<string>;
        setShouldReject(_value: PromiseOrValue<boolean>, overrides?: CallOverrides): Promise<void>;
        shouldReject(overrides?: CallOverrides): Promise<boolean>;
        supportsInterface(interfaceID: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<boolean>;
    };
    filters: {
        "TransferBatchReceiver(address,address,uint256[],uint256[])"(_from?: null, _to?: null, _fromBalances?: null, _toBalances?: null): TransferBatchReceiverEventFilter;
        TransferBatchReceiver(_from?: null, _to?: null, _fromBalances?: null, _toBalances?: null): TransferBatchReceiverEventFilter;
        "TransferSingleReceiver(address,address,uint256,uint256)"(_from?: null, _to?: null, _fromBalance?: null, _toBalance?: null): TransferSingleReceiverEventFilter;
        TransferSingleReceiver(_from?: null, _to?: null, _fromBalance?: null, _toBalance?: null): TransferSingleReceiverEventFilter;
    };
    estimateGas: {
        lastData(overrides?: CallOverrides): Promise<BigNumber>;
        lastId(overrides?: CallOverrides): Promise<BigNumber>;
        lastOperator(overrides?: CallOverrides): Promise<BigNumber>;
        lastValue(overrides?: CallOverrides): Promise<BigNumber>;
        onERC1155BatchReceived(arg0: PromiseOrValue<string>, _from: PromiseOrValue<string>, _ids: PromiseOrValue<BigNumberish>[], arg3: PromiseOrValue<BigNumberish>[], _data: PromiseOrValue<BytesLike>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        onERC1155Received(arg0: PromiseOrValue<string>, _from: PromiseOrValue<string>, _id: PromiseOrValue<BigNumberish>, arg3: PromiseOrValue<BigNumberish>, _data: PromiseOrValue<BytesLike>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        setShouldReject(_value: PromiseOrValue<boolean>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        shouldReject(overrides?: CallOverrides): Promise<BigNumber>;
        supportsInterface(interfaceID: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<BigNumber>;
    };
    populateTransaction: {
        lastData(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        lastId(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        lastOperator(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        lastValue(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        onERC1155BatchReceived(arg0: PromiseOrValue<string>, _from: PromiseOrValue<string>, _ids: PromiseOrValue<BigNumberish>[], arg3: PromiseOrValue<BigNumberish>[], _data: PromiseOrValue<BytesLike>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        onERC1155Received(arg0: PromiseOrValue<string>, _from: PromiseOrValue<string>, _id: PromiseOrValue<BigNumberish>, arg3: PromiseOrValue<BigNumberish>, _data: PromiseOrValue<BytesLike>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        setShouldReject(_value: PromiseOrValue<boolean>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        shouldReject(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        supportsInterface(interfaceID: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<PopulatedTransaction>;
    };
}
