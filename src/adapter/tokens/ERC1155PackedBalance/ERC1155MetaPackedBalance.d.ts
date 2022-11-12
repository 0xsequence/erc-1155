import type { BaseContract, BigNumber, BigNumberish, BytesLike, CallOverrides, ContractTransaction, Overrides, PopulatedTransaction, Signer, utils } from "ethers";
import type { FunctionFragment, Result, EventFragment } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type { TypedEventFilter, TypedEvent, TypedListener, OnEvent, PromiseOrValue } from "../../common";
export interface ERC1155MetaPackedBalanceInterface extends utils.Interface {
    functions: {
        "balanceOf(address,uint256)": FunctionFragment;
        "balanceOfBatch(address[],uint256[])": FunctionFragment;
        "getIDBinIndex(uint256)": FunctionFragment;
        "getNonce(address)": FunctionFragment;
        "getValueInBin(uint256,uint256)": FunctionFragment;
        "isApprovedForAll(address,address)": FunctionFragment;
        "isValidSignature(address,bytes32,bytes,bytes)": FunctionFragment;
        "metaSafeBatchTransferFrom(address,address,uint256[],uint256[],bool,bytes)": FunctionFragment;
        "metaSafeTransferFrom(address,address,uint256,uint256,bool,bytes)": FunctionFragment;
        "metaSetApprovalForAll(address,address,bool,bool,bytes)": FunctionFragment;
        "safeBatchTransferFrom(address,address,uint256[],uint256[],bytes)": FunctionFragment;
        "safeTransferFrom(address,address,uint256,uint256,bytes)": FunctionFragment;
        "setApprovalForAll(address,bool)": FunctionFragment;
        "supportsInterface(bytes4)": FunctionFragment;
    };
    getFunction(nameOrSignatureOrTopic: "balanceOf" | "balanceOfBatch" | "getIDBinIndex" | "getNonce" | "getValueInBin" | "isApprovedForAll" | "isValidSignature" | "metaSafeBatchTransferFrom" | "metaSafeTransferFrom" | "metaSetApprovalForAll" | "safeBatchTransferFrom" | "safeTransferFrom" | "setApprovalForAll" | "supportsInterface"): FunctionFragment;
    encodeFunctionData(functionFragment: "balanceOf", values: [PromiseOrValue<string>, PromiseOrValue<BigNumberish>]): string;
    encodeFunctionData(functionFragment: "balanceOfBatch", values: [PromiseOrValue<string>[], PromiseOrValue<BigNumberish>[]]): string;
    encodeFunctionData(functionFragment: "getIDBinIndex", values: [PromiseOrValue<BigNumberish>]): string;
    encodeFunctionData(functionFragment: "getNonce", values: [PromiseOrValue<string>]): string;
    encodeFunctionData(functionFragment: "getValueInBin", values: [PromiseOrValue<BigNumberish>, PromiseOrValue<BigNumberish>]): string;
    encodeFunctionData(functionFragment: "isApprovedForAll", values: [PromiseOrValue<string>, PromiseOrValue<string>]): string;
    encodeFunctionData(functionFragment: "isValidSignature", values: [
        PromiseOrValue<string>,
        PromiseOrValue<BytesLike>,
        PromiseOrValue<BytesLike>,
        PromiseOrValue<BytesLike>
    ]): string;
    encodeFunctionData(functionFragment: "metaSafeBatchTransferFrom", values: [
        PromiseOrValue<string>,
        PromiseOrValue<string>,
        PromiseOrValue<BigNumberish>[],
        PromiseOrValue<BigNumberish>[],
        PromiseOrValue<boolean>,
        PromiseOrValue<BytesLike>
    ]): string;
    encodeFunctionData(functionFragment: "metaSafeTransferFrom", values: [
        PromiseOrValue<string>,
        PromiseOrValue<string>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<boolean>,
        PromiseOrValue<BytesLike>
    ]): string;
    encodeFunctionData(functionFragment: "metaSetApprovalForAll", values: [
        PromiseOrValue<string>,
        PromiseOrValue<string>,
        PromiseOrValue<boolean>,
        PromiseOrValue<boolean>,
        PromiseOrValue<BytesLike>
    ]): string;
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
    decodeFunctionResult(functionFragment: "balanceOf", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "balanceOfBatch", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getIDBinIndex", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getNonce", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getValueInBin", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "isApprovedForAll", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "isValidSignature", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "metaSafeBatchTransferFrom", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "metaSafeTransferFrom", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "metaSetApprovalForAll", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "safeBatchTransferFrom", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "safeTransferFrom", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "setApprovalForAll", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "supportsInterface", data: BytesLike): Result;
    events: {
        "ApprovalForAll(address,address,bool)": EventFragment;
        "NonceChange(address,uint256)": EventFragment;
        "TransferBatch(address,address,address,uint256[],uint256[])": EventFragment;
        "TransferSingle(address,address,address,uint256,uint256)": EventFragment;
    };
    getEvent(nameOrSignatureOrTopic: "ApprovalForAll"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "NonceChange"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "TransferBatch"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "TransferSingle"): EventFragment;
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
export interface NonceChangeEventObject {
    signer: string;
    newNonce: BigNumber;
}
export declare type NonceChangeEvent = TypedEvent<[
    string,
    BigNumber
], NonceChangeEventObject>;
export declare type NonceChangeEventFilter = TypedEventFilter<NonceChangeEvent>;
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
export interface ERC1155MetaPackedBalance extends BaseContract {
    connect(signerOrProvider: Signer | Provider | string): this;
    attach(addressOrName: string): this;
    deployed(): Promise<this>;
    interface: ERC1155MetaPackedBalanceInterface;
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
        getIDBinIndex(_id: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<[BigNumber, BigNumber] & {
            bin: BigNumber;
            index: BigNumber;
        }>;
        getNonce(_signer: PromiseOrValue<string>, overrides?: CallOverrides): Promise<[BigNumber] & {
            nonce: BigNumber;
        }>;
        getValueInBin(_binValues: PromiseOrValue<BigNumberish>, _index: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<[BigNumber]>;
        isApprovedForAll(_owner: PromiseOrValue<string>, _operator: PromiseOrValue<string>, overrides?: CallOverrides): Promise<[boolean] & {
            isOperator: boolean;
        }>;
        isValidSignature(_signerAddress: PromiseOrValue<string>, _hash: PromiseOrValue<BytesLike>, _data: PromiseOrValue<BytesLike>, _sig: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<[boolean] & {
            isValid: boolean;
        }>;
        metaSafeBatchTransferFrom(_from: PromiseOrValue<string>, _to: PromiseOrValue<string>, _ids: PromiseOrValue<BigNumberish>[], _amounts: PromiseOrValue<BigNumberish>[], _isGasFee: PromiseOrValue<boolean>, _data: PromiseOrValue<BytesLike>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        metaSafeTransferFrom(_from: PromiseOrValue<string>, _to: PromiseOrValue<string>, _id: PromiseOrValue<BigNumberish>, _amount: PromiseOrValue<BigNumberish>, _isGasFee: PromiseOrValue<boolean>, _data: PromiseOrValue<BytesLike>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        metaSetApprovalForAll(_owner: PromiseOrValue<string>, _operator: PromiseOrValue<string>, _approved: PromiseOrValue<boolean>, _isGasFee: PromiseOrValue<boolean>, _data: PromiseOrValue<BytesLike>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
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
    };
    balanceOf(_owner: PromiseOrValue<string>, _id: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<BigNumber>;
    balanceOfBatch(_owners: PromiseOrValue<string>[], _ids: PromiseOrValue<BigNumberish>[], overrides?: CallOverrides): Promise<BigNumber[]>;
    getIDBinIndex(_id: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<[BigNumber, BigNumber] & {
        bin: BigNumber;
        index: BigNumber;
    }>;
    getNonce(_signer: PromiseOrValue<string>, overrides?: CallOverrides): Promise<BigNumber>;
    getValueInBin(_binValues: PromiseOrValue<BigNumberish>, _index: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<BigNumber>;
    isApprovedForAll(_owner: PromiseOrValue<string>, _operator: PromiseOrValue<string>, overrides?: CallOverrides): Promise<boolean>;
    isValidSignature(_signerAddress: PromiseOrValue<string>, _hash: PromiseOrValue<BytesLike>, _data: PromiseOrValue<BytesLike>, _sig: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<boolean>;
    metaSafeBatchTransferFrom(_from: PromiseOrValue<string>, _to: PromiseOrValue<string>, _ids: PromiseOrValue<BigNumberish>[], _amounts: PromiseOrValue<BigNumberish>[], _isGasFee: PromiseOrValue<boolean>, _data: PromiseOrValue<BytesLike>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    metaSafeTransferFrom(_from: PromiseOrValue<string>, _to: PromiseOrValue<string>, _id: PromiseOrValue<BigNumberish>, _amount: PromiseOrValue<BigNumberish>, _isGasFee: PromiseOrValue<boolean>, _data: PromiseOrValue<BytesLike>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    metaSetApprovalForAll(_owner: PromiseOrValue<string>, _operator: PromiseOrValue<string>, _approved: PromiseOrValue<boolean>, _isGasFee: PromiseOrValue<boolean>, _data: PromiseOrValue<BytesLike>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
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
    callStatic: {
        balanceOf(_owner: PromiseOrValue<string>, _id: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<BigNumber>;
        balanceOfBatch(_owners: PromiseOrValue<string>[], _ids: PromiseOrValue<BigNumberish>[], overrides?: CallOverrides): Promise<BigNumber[]>;
        getIDBinIndex(_id: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<[BigNumber, BigNumber] & {
            bin: BigNumber;
            index: BigNumber;
        }>;
        getNonce(_signer: PromiseOrValue<string>, overrides?: CallOverrides): Promise<BigNumber>;
        getValueInBin(_binValues: PromiseOrValue<BigNumberish>, _index: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<BigNumber>;
        isApprovedForAll(_owner: PromiseOrValue<string>, _operator: PromiseOrValue<string>, overrides?: CallOverrides): Promise<boolean>;
        isValidSignature(_signerAddress: PromiseOrValue<string>, _hash: PromiseOrValue<BytesLike>, _data: PromiseOrValue<BytesLike>, _sig: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<boolean>;
        metaSafeBatchTransferFrom(_from: PromiseOrValue<string>, _to: PromiseOrValue<string>, _ids: PromiseOrValue<BigNumberish>[], _amounts: PromiseOrValue<BigNumberish>[], _isGasFee: PromiseOrValue<boolean>, _data: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<void>;
        metaSafeTransferFrom(_from: PromiseOrValue<string>, _to: PromiseOrValue<string>, _id: PromiseOrValue<BigNumberish>, _amount: PromiseOrValue<BigNumberish>, _isGasFee: PromiseOrValue<boolean>, _data: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<void>;
        metaSetApprovalForAll(_owner: PromiseOrValue<string>, _operator: PromiseOrValue<string>, _approved: PromiseOrValue<boolean>, _isGasFee: PromiseOrValue<boolean>, _data: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<void>;
        safeBatchTransferFrom(_from: PromiseOrValue<string>, _to: PromiseOrValue<string>, _ids: PromiseOrValue<BigNumberish>[], _amounts: PromiseOrValue<BigNumberish>[], _data: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<void>;
        safeTransferFrom(_from: PromiseOrValue<string>, _to: PromiseOrValue<string>, _id: PromiseOrValue<BigNumberish>, _amount: PromiseOrValue<BigNumberish>, _data: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<void>;
        setApprovalForAll(_operator: PromiseOrValue<string>, _approved: PromiseOrValue<boolean>, overrides?: CallOverrides): Promise<void>;
        supportsInterface(_interfaceID: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<boolean>;
    };
    filters: {
        "ApprovalForAll(address,address,bool)"(_owner?: PromiseOrValue<string> | null, _operator?: PromiseOrValue<string> | null, _approved?: null): ApprovalForAllEventFilter;
        ApprovalForAll(_owner?: PromiseOrValue<string> | null, _operator?: PromiseOrValue<string> | null, _approved?: null): ApprovalForAllEventFilter;
        "NonceChange(address,uint256)"(signer?: PromiseOrValue<string> | null, newNonce?: null): NonceChangeEventFilter;
        NonceChange(signer?: PromiseOrValue<string> | null, newNonce?: null): NonceChangeEventFilter;
        "TransferBatch(address,address,address,uint256[],uint256[])"(_operator?: PromiseOrValue<string> | null, _from?: PromiseOrValue<string> | null, _to?: PromiseOrValue<string> | null, _ids?: null, _amounts?: null): TransferBatchEventFilter;
        TransferBatch(_operator?: PromiseOrValue<string> | null, _from?: PromiseOrValue<string> | null, _to?: PromiseOrValue<string> | null, _ids?: null, _amounts?: null): TransferBatchEventFilter;
        "TransferSingle(address,address,address,uint256,uint256)"(_operator?: PromiseOrValue<string> | null, _from?: PromiseOrValue<string> | null, _to?: PromiseOrValue<string> | null, _id?: null, _amount?: null): TransferSingleEventFilter;
        TransferSingle(_operator?: PromiseOrValue<string> | null, _from?: PromiseOrValue<string> | null, _to?: PromiseOrValue<string> | null, _id?: null, _amount?: null): TransferSingleEventFilter;
    };
    estimateGas: {
        balanceOf(_owner: PromiseOrValue<string>, _id: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<BigNumber>;
        balanceOfBatch(_owners: PromiseOrValue<string>[], _ids: PromiseOrValue<BigNumberish>[], overrides?: CallOverrides): Promise<BigNumber>;
        getIDBinIndex(_id: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<BigNumber>;
        getNonce(_signer: PromiseOrValue<string>, overrides?: CallOverrides): Promise<BigNumber>;
        getValueInBin(_binValues: PromiseOrValue<BigNumberish>, _index: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<BigNumber>;
        isApprovedForAll(_owner: PromiseOrValue<string>, _operator: PromiseOrValue<string>, overrides?: CallOverrides): Promise<BigNumber>;
        isValidSignature(_signerAddress: PromiseOrValue<string>, _hash: PromiseOrValue<BytesLike>, _data: PromiseOrValue<BytesLike>, _sig: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<BigNumber>;
        metaSafeBatchTransferFrom(_from: PromiseOrValue<string>, _to: PromiseOrValue<string>, _ids: PromiseOrValue<BigNumberish>[], _amounts: PromiseOrValue<BigNumberish>[], _isGasFee: PromiseOrValue<boolean>, _data: PromiseOrValue<BytesLike>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        metaSafeTransferFrom(_from: PromiseOrValue<string>, _to: PromiseOrValue<string>, _id: PromiseOrValue<BigNumberish>, _amount: PromiseOrValue<BigNumberish>, _isGasFee: PromiseOrValue<boolean>, _data: PromiseOrValue<BytesLike>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        metaSetApprovalForAll(_owner: PromiseOrValue<string>, _operator: PromiseOrValue<string>, _approved: PromiseOrValue<boolean>, _isGasFee: PromiseOrValue<boolean>, _data: PromiseOrValue<BytesLike>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
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
    };
    populateTransaction: {
        balanceOf(_owner: PromiseOrValue<string>, _id: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        balanceOfBatch(_owners: PromiseOrValue<string>[], _ids: PromiseOrValue<BigNumberish>[], overrides?: CallOverrides): Promise<PopulatedTransaction>;
        getIDBinIndex(_id: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        getNonce(_signer: PromiseOrValue<string>, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        getValueInBin(_binValues: PromiseOrValue<BigNumberish>, _index: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        isApprovedForAll(_owner: PromiseOrValue<string>, _operator: PromiseOrValue<string>, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        isValidSignature(_signerAddress: PromiseOrValue<string>, _hash: PromiseOrValue<BytesLike>, _data: PromiseOrValue<BytesLike>, _sig: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        metaSafeBatchTransferFrom(_from: PromiseOrValue<string>, _to: PromiseOrValue<string>, _ids: PromiseOrValue<BigNumberish>[], _amounts: PromiseOrValue<BigNumberish>[], _isGasFee: PromiseOrValue<boolean>, _data: PromiseOrValue<BytesLike>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        metaSafeTransferFrom(_from: PromiseOrValue<string>, _to: PromiseOrValue<string>, _id: PromiseOrValue<BigNumberish>, _amount: PromiseOrValue<BigNumberish>, _isGasFee: PromiseOrValue<boolean>, _data: PromiseOrValue<BytesLike>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        metaSetApprovalForAll(_owner: PromiseOrValue<string>, _operator: PromiseOrValue<string>, _approved: PromiseOrValue<boolean>, _isGasFee: PromiseOrValue<boolean>, _data: PromiseOrValue<BytesLike>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
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
    };
}
