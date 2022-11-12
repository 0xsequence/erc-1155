import type { BaseContract, BigNumber, BigNumberish, BytesLike, CallOverrides, ContractTransaction, Overrides, PopulatedTransaction, Signer, utils } from "ethers";
import type { FunctionFragment, Result, EventFragment } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type { TypedEventFilter, TypedEvent, TypedListener, OnEvent, PromiseOrValue } from "../common";
export interface IERC1155MetaInterface extends utils.Interface {
    functions: {
        "metaSafeBatchTransferFrom(address,address,uint256[],uint256[],bool,bytes)": FunctionFragment;
        "metaSafeTransferFrom(address,address,uint256,uint256,bool,bytes)": FunctionFragment;
        "metaSetApprovalForAll(address,address,bool,bool,bytes)": FunctionFragment;
    };
    getFunction(nameOrSignatureOrTopic: "metaSafeBatchTransferFrom" | "metaSafeTransferFrom" | "metaSetApprovalForAll"): FunctionFragment;
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
    decodeFunctionResult(functionFragment: "metaSafeBatchTransferFrom", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "metaSafeTransferFrom", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "metaSetApprovalForAll", data: BytesLike): Result;
    events: {
        "NonceChange(address,uint256)": EventFragment;
    };
    getEvent(nameOrSignatureOrTopic: "NonceChange"): EventFragment;
}
export interface NonceChangeEventObject {
    signer: string;
    newNonce: BigNumber;
}
export declare type NonceChangeEvent = TypedEvent<[
    string,
    BigNumber
], NonceChangeEventObject>;
export declare type NonceChangeEventFilter = TypedEventFilter<NonceChangeEvent>;
export interface IERC1155Meta extends BaseContract {
    connect(signerOrProvider: Signer | Provider | string): this;
    attach(addressOrName: string): this;
    deployed(): Promise<this>;
    interface: IERC1155MetaInterface;
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
        metaSafeBatchTransferFrom(_from: PromiseOrValue<string>, _to: PromiseOrValue<string>, _ids: PromiseOrValue<BigNumberish>[], _amounts: PromiseOrValue<BigNumberish>[], _isGasFee: PromiseOrValue<boolean>, _data: PromiseOrValue<BytesLike>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        metaSafeTransferFrom(_from: PromiseOrValue<string>, _to: PromiseOrValue<string>, _id: PromiseOrValue<BigNumberish>, _amount: PromiseOrValue<BigNumberish>, _isGasFee: PromiseOrValue<boolean>, _data: PromiseOrValue<BytesLike>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        metaSetApprovalForAll(_owner: PromiseOrValue<string>, _operator: PromiseOrValue<string>, _approved: PromiseOrValue<boolean>, _isGasFee: PromiseOrValue<boolean>, _data: PromiseOrValue<BytesLike>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
    };
    metaSafeBatchTransferFrom(_from: PromiseOrValue<string>, _to: PromiseOrValue<string>, _ids: PromiseOrValue<BigNumberish>[], _amounts: PromiseOrValue<BigNumberish>[], _isGasFee: PromiseOrValue<boolean>, _data: PromiseOrValue<BytesLike>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    metaSafeTransferFrom(_from: PromiseOrValue<string>, _to: PromiseOrValue<string>, _id: PromiseOrValue<BigNumberish>, _amount: PromiseOrValue<BigNumberish>, _isGasFee: PromiseOrValue<boolean>, _data: PromiseOrValue<BytesLike>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    metaSetApprovalForAll(_owner: PromiseOrValue<string>, _operator: PromiseOrValue<string>, _approved: PromiseOrValue<boolean>, _isGasFee: PromiseOrValue<boolean>, _data: PromiseOrValue<BytesLike>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    callStatic: {
        metaSafeBatchTransferFrom(_from: PromiseOrValue<string>, _to: PromiseOrValue<string>, _ids: PromiseOrValue<BigNumberish>[], _amounts: PromiseOrValue<BigNumberish>[], _isGasFee: PromiseOrValue<boolean>, _data: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<void>;
        metaSafeTransferFrom(_from: PromiseOrValue<string>, _to: PromiseOrValue<string>, _id: PromiseOrValue<BigNumberish>, _amount: PromiseOrValue<BigNumberish>, _isGasFee: PromiseOrValue<boolean>, _data: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<void>;
        metaSetApprovalForAll(_owner: PromiseOrValue<string>, _operator: PromiseOrValue<string>, _approved: PromiseOrValue<boolean>, _isGasFee: PromiseOrValue<boolean>, _data: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<void>;
    };
    filters: {
        "NonceChange(address,uint256)"(signer?: PromiseOrValue<string> | null, newNonce?: null): NonceChangeEventFilter;
        NonceChange(signer?: PromiseOrValue<string> | null, newNonce?: null): NonceChangeEventFilter;
    };
    estimateGas: {
        metaSafeBatchTransferFrom(_from: PromiseOrValue<string>, _to: PromiseOrValue<string>, _ids: PromiseOrValue<BigNumberish>[], _amounts: PromiseOrValue<BigNumberish>[], _isGasFee: PromiseOrValue<boolean>, _data: PromiseOrValue<BytesLike>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        metaSafeTransferFrom(_from: PromiseOrValue<string>, _to: PromiseOrValue<string>, _id: PromiseOrValue<BigNumberish>, _amount: PromiseOrValue<BigNumberish>, _isGasFee: PromiseOrValue<boolean>, _data: PromiseOrValue<BytesLike>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        metaSetApprovalForAll(_owner: PromiseOrValue<string>, _operator: PromiseOrValue<string>, _approved: PromiseOrValue<boolean>, _isGasFee: PromiseOrValue<boolean>, _data: PromiseOrValue<BytesLike>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
    };
    populateTransaction: {
        metaSafeBatchTransferFrom(_from: PromiseOrValue<string>, _to: PromiseOrValue<string>, _ids: PromiseOrValue<BigNumberish>[], _amounts: PromiseOrValue<BigNumberish>[], _isGasFee: PromiseOrValue<boolean>, _data: PromiseOrValue<BytesLike>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        metaSafeTransferFrom(_from: PromiseOrValue<string>, _to: PromiseOrValue<string>, _id: PromiseOrValue<BigNumberish>, _amount: PromiseOrValue<BigNumberish>, _isGasFee: PromiseOrValue<boolean>, _data: PromiseOrValue<BytesLike>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        metaSetApprovalForAll(_owner: PromiseOrValue<string>, _operator: PromiseOrValue<string>, _approved: PromiseOrValue<boolean>, _isGasFee: PromiseOrValue<boolean>, _data: PromiseOrValue<BytesLike>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
    };
}
