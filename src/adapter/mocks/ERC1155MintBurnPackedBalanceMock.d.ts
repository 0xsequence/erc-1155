import type { BaseContract, BigNumber, BigNumberish, BytesLike, CallOverrides, ContractTransaction, Overrides, PopulatedTransaction, Signer, utils } from "ethers";
import type { FunctionFragment, Result, EventFragment } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type { TypedEventFilter, TypedEvent, TypedListener, OnEvent, PromiseOrValue } from "../common";
export interface ERC1155MintBurnPackedBalanceMockInterface extends utils.Interface {
    functions: {
        "balanceOf(address,uint256)": FunctionFragment;
        "balanceOfBatch(address[],uint256[])": FunctionFragment;
        "baseURI()": FunctionFragment;
        "batchBurnMock(address,uint256[],uint256[])": FunctionFragment;
        "batchMintMock(address,uint256[],uint256[],bytes)": FunctionFragment;
        "burnMock(address,uint256,uint256)": FunctionFragment;
        "getIDBinIndex(uint256)": FunctionFragment;
        "getValueInBin(uint256,uint256)": FunctionFragment;
        "isApprovedForAll(address,address)": FunctionFragment;
        "mintMock(address,uint256,uint256,bytes)": FunctionFragment;
        "name()": FunctionFragment;
        "safeBatchTransferFrom(address,address,uint256[],uint256[],bytes)": FunctionFragment;
        "safeTransferFrom(address,address,uint256,uint256,bytes)": FunctionFragment;
        "setApprovalForAll(address,bool)": FunctionFragment;
        "supportsInterface(bytes4)": FunctionFragment;
        "uri(uint256)": FunctionFragment;
    };
    getFunction(nameOrSignatureOrTopic: "balanceOf" | "balanceOfBatch" | "baseURI" | "batchBurnMock" | "batchMintMock" | "burnMock" | "getIDBinIndex" | "getValueInBin" | "isApprovedForAll" | "mintMock" | "name" | "safeBatchTransferFrom" | "safeTransferFrom" | "setApprovalForAll" | "supportsInterface" | "uri"): FunctionFragment;
    encodeFunctionData(functionFragment: "balanceOf", values: [PromiseOrValue<string>, PromiseOrValue<BigNumberish>]): string;
    encodeFunctionData(functionFragment: "balanceOfBatch", values: [PromiseOrValue<string>[], PromiseOrValue<BigNumberish>[]]): string;
    encodeFunctionData(functionFragment: "baseURI", values?: undefined): string;
    encodeFunctionData(functionFragment: "batchBurnMock", values: [
        PromiseOrValue<string>,
        PromiseOrValue<BigNumberish>[],
        PromiseOrValue<BigNumberish>[]
    ]): string;
    encodeFunctionData(functionFragment: "batchMintMock", values: [
        PromiseOrValue<string>,
        PromiseOrValue<BigNumberish>[],
        PromiseOrValue<BigNumberish>[],
        PromiseOrValue<BytesLike>
    ]): string;
    encodeFunctionData(functionFragment: "burnMock", values: [
        PromiseOrValue<string>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>
    ]): string;
    encodeFunctionData(functionFragment: "getIDBinIndex", values: [PromiseOrValue<BigNumberish>]): string;
    encodeFunctionData(functionFragment: "getValueInBin", values: [PromiseOrValue<BigNumberish>, PromiseOrValue<BigNumberish>]): string;
    encodeFunctionData(functionFragment: "isApprovedForAll", values: [PromiseOrValue<string>, PromiseOrValue<string>]): string;
    encodeFunctionData(functionFragment: "mintMock", values: [
        PromiseOrValue<string>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BytesLike>
    ]): string;
    encodeFunctionData(functionFragment: "name", values?: undefined): string;
    encodeFunctionData(functionFragment: "safeBatchTransferFrom", values: [
        PromiseOrValue<string>,
        PromiseOrValue<string>,
        PromiseOrValue<BigNumberish>[],
        PromiseOrValue<BigNumberish>[],
        PromiseOrValue<BytesLike>
    ]): string;
    encodeFunctionData(functionFragment: "safeTransferFrom", values: [
        PromiseOrValue<string>,
        PromiseOrValue<string>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BytesLike>
    ]): string;
    encodeFunctionData(functionFragment: "setApprovalForAll", values: [PromiseOrValue<string>, PromiseOrValue<boolean>]): string;
    encodeFunctionData(functionFragment: "supportsInterface", values: [PromiseOrValue<BytesLike>]): string;
    encodeFunctionData(functionFragment: "uri", values: [PromiseOrValue<BigNumberish>]): string;
    decodeFunctionResult(functionFragment: "balanceOf", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "balanceOfBatch", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "baseURI", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "batchBurnMock", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "batchMintMock", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "burnMock", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getIDBinIndex", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getValueInBin", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "isApprovedForAll", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "mintMock", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "name", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "safeBatchTransferFrom", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "safeTransferFrom", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "setApprovalForAll", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "supportsInterface", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "uri", data: BytesLike): Result;
    events: {
        "ApprovalForAll(address,address,bool)": EventFragment;
        "TransferBatch(address,address,address,uint256[],uint256[])": EventFragment;
        "TransferSingle(address,address,address,uint256,uint256)": EventFragment;
        "URI(string,uint256)": EventFragment;
    };
    getEvent(nameOrSignatureOrTopic: "ApprovalForAll"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "TransferBatch"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "TransferSingle"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "URI"): EventFragment;
}
export interface ApprovalForAllEventObject {
    _owner: string;
    _operator: string;
    _approved: boolean;
}
export declare type ApprovalForAllEvent = TypedEvent<[
    string,
    string,
    boolean
], ApprovalForAllEventObject>;
export declare type ApprovalForAllEventFilter = TypedEventFilter<ApprovalForAllEvent>;
export interface TransferBatchEventObject {
    _operator: string;
    _from: string;
    _to: string;
    _ids: BigNumber[];
    _amounts: BigNumber[];
}
export declare type TransferBatchEvent = TypedEvent<[
    string,
    string,
    string,
    BigNumber[],
    BigNumber[]
], TransferBatchEventObject>;
export declare type TransferBatchEventFilter = TypedEventFilter<TransferBatchEvent>;
export interface TransferSingleEventObject {
    _operator: string;
    _from: string;
    _to: string;
    _id: BigNumber;
    _amount: BigNumber;
}
export declare type TransferSingleEvent = TypedEvent<[
    string,
    string,
    string,
    BigNumber,
    BigNumber
], TransferSingleEventObject>;
export declare type TransferSingleEventFilter = TypedEventFilter<TransferSingleEvent>;
export interface URIEventObject {
    _uri: string;
    _id: BigNumber;
}
export declare type URIEvent = TypedEvent<[string, BigNumber], URIEventObject>;
export declare type URIEventFilter = TypedEventFilter<URIEvent>;
export interface ERC1155MintBurnPackedBalanceMock extends BaseContract {
    connect(signerOrProvider: Signer | Provider | string): this;
    attach(addressOrName: string): this;
    deployed(): Promise<this>;
    interface: ERC1155MintBurnPackedBalanceMockInterface;
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
        balanceOf(_owner: PromiseOrValue<string>, _id: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<[BigNumber]>;
        balanceOfBatch(_owners: PromiseOrValue<string>[], _ids: PromiseOrValue<BigNumberish>[], overrides?: CallOverrides): Promise<[BigNumber[]]>;
        baseURI(overrides?: CallOverrides): Promise<[string]>;
        batchBurnMock(_from: PromiseOrValue<string>, _ids: PromiseOrValue<BigNumberish>[], _values: PromiseOrValue<BigNumberish>[], overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        batchMintMock(_to: PromiseOrValue<string>, _ids: PromiseOrValue<BigNumberish>[], _values: PromiseOrValue<BigNumberish>[], _data: PromiseOrValue<BytesLike>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        burnMock(_from: PromiseOrValue<string>, _id: PromiseOrValue<BigNumberish>, _value: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        getIDBinIndex(_id: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<[BigNumber, BigNumber] & {
            bin: BigNumber;
            index: BigNumber;
        }>;
        getValueInBin(_binValues: PromiseOrValue<BigNumberish>, _index: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<[BigNumber]>;
        isApprovedForAll(_owner: PromiseOrValue<string>, _operator: PromiseOrValue<string>, overrides?: CallOverrides): Promise<[boolean] & {
            isOperator: boolean;
        }>;
        mintMock(_to: PromiseOrValue<string>, _id: PromiseOrValue<BigNumberish>, _value: PromiseOrValue<BigNumberish>, _data: PromiseOrValue<BytesLike>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        name(overrides?: CallOverrides): Promise<[string]>;
        safeBatchTransferFrom(_from: PromiseOrValue<string>, _to: PromiseOrValue<string>, _ids: PromiseOrValue<BigNumberish>[], _amounts: PromiseOrValue<BigNumberish>[], _data: PromiseOrValue<BytesLike>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        safeTransferFrom(_from: PromiseOrValue<string>, _to: PromiseOrValue<string>, _id: PromiseOrValue<BigNumberish>, _amount: PromiseOrValue<BigNumberish>, _data: PromiseOrValue<BytesLike>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        setApprovalForAll(_operator: PromiseOrValue<string>, _approved: PromiseOrValue<boolean>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        supportsInterface(_interfaceID: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<[boolean]>;
        uri(_id: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<[string]>;
    };
    balanceOf(_owner: PromiseOrValue<string>, _id: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<BigNumber>;
    balanceOfBatch(_owners: PromiseOrValue<string>[], _ids: PromiseOrValue<BigNumberish>[], overrides?: CallOverrides): Promise<BigNumber[]>;
    baseURI(overrides?: CallOverrides): Promise<string>;
    batchBurnMock(_from: PromiseOrValue<string>, _ids: PromiseOrValue<BigNumberish>[], _values: PromiseOrValue<BigNumberish>[], overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    batchMintMock(_to: PromiseOrValue<string>, _ids: PromiseOrValue<BigNumberish>[], _values: PromiseOrValue<BigNumberish>[], _data: PromiseOrValue<BytesLike>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    burnMock(_from: PromiseOrValue<string>, _id: PromiseOrValue<BigNumberish>, _value: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    getIDBinIndex(_id: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<[BigNumber, BigNumber] & {
        bin: BigNumber;
        index: BigNumber;
    }>;
    getValueInBin(_binValues: PromiseOrValue<BigNumberish>, _index: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<BigNumber>;
    isApprovedForAll(_owner: PromiseOrValue<string>, _operator: PromiseOrValue<string>, overrides?: CallOverrides): Promise<boolean>;
    mintMock(_to: PromiseOrValue<string>, _id: PromiseOrValue<BigNumberish>, _value: PromiseOrValue<BigNumberish>, _data: PromiseOrValue<BytesLike>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    name(overrides?: CallOverrides): Promise<string>;
    safeBatchTransferFrom(_from: PromiseOrValue<string>, _to: PromiseOrValue<string>, _ids: PromiseOrValue<BigNumberish>[], _amounts: PromiseOrValue<BigNumberish>[], _data: PromiseOrValue<BytesLike>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    safeTransferFrom(_from: PromiseOrValue<string>, _to: PromiseOrValue<string>, _id: PromiseOrValue<BigNumberish>, _amount: PromiseOrValue<BigNumberish>, _data: PromiseOrValue<BytesLike>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    setApprovalForAll(_operator: PromiseOrValue<string>, _approved: PromiseOrValue<boolean>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    supportsInterface(_interfaceID: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<boolean>;
    uri(_id: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<string>;
    callStatic: {
        balanceOf(_owner: PromiseOrValue<string>, _id: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<BigNumber>;
        balanceOfBatch(_owners: PromiseOrValue<string>[], _ids: PromiseOrValue<BigNumberish>[], overrides?: CallOverrides): Promise<BigNumber[]>;
        baseURI(overrides?: CallOverrides): Promise<string>;
        batchBurnMock(_from: PromiseOrValue<string>, _ids: PromiseOrValue<BigNumberish>[], _values: PromiseOrValue<BigNumberish>[], overrides?: CallOverrides): Promise<void>;
        batchMintMock(_to: PromiseOrValue<string>, _ids: PromiseOrValue<BigNumberish>[], _values: PromiseOrValue<BigNumberish>[], _data: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<void>;
        burnMock(_from: PromiseOrValue<string>, _id: PromiseOrValue<BigNumberish>, _value: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<void>;
        getIDBinIndex(_id: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<[BigNumber, BigNumber] & {
            bin: BigNumber;
            index: BigNumber;
        }>;
        getValueInBin(_binValues: PromiseOrValue<BigNumberish>, _index: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<BigNumber>;
        isApprovedForAll(_owner: PromiseOrValue<string>, _operator: PromiseOrValue<string>, overrides?: CallOverrides): Promise<boolean>;
        mintMock(_to: PromiseOrValue<string>, _id: PromiseOrValue<BigNumberish>, _value: PromiseOrValue<BigNumberish>, _data: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<void>;
        name(overrides?: CallOverrides): Promise<string>;
        safeBatchTransferFrom(_from: PromiseOrValue<string>, _to: PromiseOrValue<string>, _ids: PromiseOrValue<BigNumberish>[], _amounts: PromiseOrValue<BigNumberish>[], _data: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<void>;
        safeTransferFrom(_from: PromiseOrValue<string>, _to: PromiseOrValue<string>, _id: PromiseOrValue<BigNumberish>, _amount: PromiseOrValue<BigNumberish>, _data: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<void>;
        setApprovalForAll(_operator: PromiseOrValue<string>, _approved: PromiseOrValue<boolean>, overrides?: CallOverrides): Promise<void>;
        supportsInterface(_interfaceID: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<boolean>;
        uri(_id: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<string>;
    };
    filters: {
        "ApprovalForAll(address,address,bool)"(_owner?: PromiseOrValue<string> | null, _operator?: PromiseOrValue<string> | null, _approved?: null): ApprovalForAllEventFilter;
        ApprovalForAll(_owner?: PromiseOrValue<string> | null, _operator?: PromiseOrValue<string> | null, _approved?: null): ApprovalForAllEventFilter;
        "TransferBatch(address,address,address,uint256[],uint256[])"(_operator?: PromiseOrValue<string> | null, _from?: PromiseOrValue<string> | null, _to?: PromiseOrValue<string> | null, _ids?: null, _amounts?: null): TransferBatchEventFilter;
        TransferBatch(_operator?: PromiseOrValue<string> | null, _from?: PromiseOrValue<string> | null, _to?: PromiseOrValue<string> | null, _ids?: null, _amounts?: null): TransferBatchEventFilter;
        "TransferSingle(address,address,address,uint256,uint256)"(_operator?: PromiseOrValue<string> | null, _from?: PromiseOrValue<string> | null, _to?: PromiseOrValue<string> | null, _id?: null, _amount?: null): TransferSingleEventFilter;
        TransferSingle(_operator?: PromiseOrValue<string> | null, _from?: PromiseOrValue<string> | null, _to?: PromiseOrValue<string> | null, _id?: null, _amount?: null): TransferSingleEventFilter;
        "URI(string,uint256)"(_uri?: null, _id?: PromiseOrValue<BigNumberish> | null): URIEventFilter;
        URI(_uri?: null, _id?: PromiseOrValue<BigNumberish> | null): URIEventFilter;
    };
    estimateGas: {
        balanceOf(_owner: PromiseOrValue<string>, _id: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<BigNumber>;
        balanceOfBatch(_owners: PromiseOrValue<string>[], _ids: PromiseOrValue<BigNumberish>[], overrides?: CallOverrides): Promise<BigNumber>;
        baseURI(overrides?: CallOverrides): Promise<BigNumber>;
        batchBurnMock(_from: PromiseOrValue<string>, _ids: PromiseOrValue<BigNumberish>[], _values: PromiseOrValue<BigNumberish>[], overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        batchMintMock(_to: PromiseOrValue<string>, _ids: PromiseOrValue<BigNumberish>[], _values: PromiseOrValue<BigNumberish>[], _data: PromiseOrValue<BytesLike>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        burnMock(_from: PromiseOrValue<string>, _id: PromiseOrValue<BigNumberish>, _value: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        getIDBinIndex(_id: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<BigNumber>;
        getValueInBin(_binValues: PromiseOrValue<BigNumberish>, _index: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<BigNumber>;
        isApprovedForAll(_owner: PromiseOrValue<string>, _operator: PromiseOrValue<string>, overrides?: CallOverrides): Promise<BigNumber>;
        mintMock(_to: PromiseOrValue<string>, _id: PromiseOrValue<BigNumberish>, _value: PromiseOrValue<BigNumberish>, _data: PromiseOrValue<BytesLike>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        name(overrides?: CallOverrides): Promise<BigNumber>;
        safeBatchTransferFrom(_from: PromiseOrValue<string>, _to: PromiseOrValue<string>, _ids: PromiseOrValue<BigNumberish>[], _amounts: PromiseOrValue<BigNumberish>[], _data: PromiseOrValue<BytesLike>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        safeTransferFrom(_from: PromiseOrValue<string>, _to: PromiseOrValue<string>, _id: PromiseOrValue<BigNumberish>, _amount: PromiseOrValue<BigNumberish>, _data: PromiseOrValue<BytesLike>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        setApprovalForAll(_operator: PromiseOrValue<string>, _approved: PromiseOrValue<boolean>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        supportsInterface(_interfaceID: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<BigNumber>;
        uri(_id: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<BigNumber>;
    };
    populateTransaction: {
        balanceOf(_owner: PromiseOrValue<string>, _id: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        balanceOfBatch(_owners: PromiseOrValue<string>[], _ids: PromiseOrValue<BigNumberish>[], overrides?: CallOverrides): Promise<PopulatedTransaction>;
        baseURI(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        batchBurnMock(_from: PromiseOrValue<string>, _ids: PromiseOrValue<BigNumberish>[], _values: PromiseOrValue<BigNumberish>[], overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        batchMintMock(_to: PromiseOrValue<string>, _ids: PromiseOrValue<BigNumberish>[], _values: PromiseOrValue<BigNumberish>[], _data: PromiseOrValue<BytesLike>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        burnMock(_from: PromiseOrValue<string>, _id: PromiseOrValue<BigNumberish>, _value: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        getIDBinIndex(_id: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        getValueInBin(_binValues: PromiseOrValue<BigNumberish>, _index: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        isApprovedForAll(_owner: PromiseOrValue<string>, _operator: PromiseOrValue<string>, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        mintMock(_to: PromiseOrValue<string>, _id: PromiseOrValue<BigNumberish>, _value: PromiseOrValue<BigNumberish>, _data: PromiseOrValue<BytesLike>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        name(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        safeBatchTransferFrom(_from: PromiseOrValue<string>, _to: PromiseOrValue<string>, _ids: PromiseOrValue<BigNumberish>[], _amounts: PromiseOrValue<BigNumberish>[], _data: PromiseOrValue<BytesLike>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        safeTransferFrom(_from: PromiseOrValue<string>, _to: PromiseOrValue<string>, _id: PromiseOrValue<BigNumberish>, _amount: PromiseOrValue<BigNumberish>, _data: PromiseOrValue<BytesLike>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        setApprovalForAll(_operator: PromiseOrValue<string>, _approved: PromiseOrValue<boolean>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        supportsInterface(_interfaceID: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        uri(_id: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<PopulatedTransaction>;
    };
}
