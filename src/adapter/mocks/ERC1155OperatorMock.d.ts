import type { BaseContract, BigNumber, BigNumberish, BytesLike, CallOverrides, ContractTransaction, Overrides, PopulatedTransaction, Signer, utils } from "ethers";
import type { FunctionFragment, Result } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type { TypedEventFilter, TypedEvent, TypedListener, OnEvent, PromiseOrValue } from "../common";
export interface ERC1155OperatorMockInterface extends utils.Interface {
    functions: {
        "metaSafeBatchTransferFrom(address,address,address,uint256[],uint256[],bool,bytes)": FunctionFragment;
        "metaSafeTransferFrom(address,address,address,uint256,uint256,bool,bytes)": FunctionFragment;
        "metaSetApprovalForAll(address,address,address,bool,bool,bytes)": FunctionFragment;
        "safeBatchTransferFrom(address,address,address,uint256[],uint256[],bytes)": FunctionFragment;
        "safeTransferFrom(address,address,address,uint256,uint256,bytes)": FunctionFragment;
    };
    getFunction(nameOrSignatureOrTopic: "metaSafeBatchTransferFrom" | "metaSafeTransferFrom" | "metaSetApprovalForAll" | "safeBatchTransferFrom" | "safeTransferFrom"): FunctionFragment;
    encodeFunctionData(functionFragment: "metaSafeBatchTransferFrom", values: [
        PromiseOrValue<string>,
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
        PromiseOrValue<string>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<boolean>,
        PromiseOrValue<BytesLike>
    ]): string;
    encodeFunctionData(functionFragment: "metaSetApprovalForAll", values: [
        PromiseOrValue<string>,
        PromiseOrValue<string>,
        PromiseOrValue<string>,
        PromiseOrValue<boolean>,
        PromiseOrValue<boolean>,
        PromiseOrValue<BytesLike>
    ]): string;
    encodeFunctionData(functionFragment: "safeBatchTransferFrom", values: [
        PromiseOrValue<string>,
        PromiseOrValue<string>,
        PromiseOrValue<string>,
        PromiseOrValue<BigNumberish>[],
        PromiseOrValue<BigNumberish>[],
        PromiseOrValue<BytesLike>
    ]): string;
    encodeFunctionData(functionFragment: "safeTransferFrom", values: [
        PromiseOrValue<string>,
        PromiseOrValue<string>,
        PromiseOrValue<string>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BytesLike>
    ]): string;
    decodeFunctionResult(functionFragment: "metaSafeBatchTransferFrom", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "metaSafeTransferFrom", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "metaSetApprovalForAll", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "safeBatchTransferFrom", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "safeTransferFrom", data: BytesLike): Result;
    events: {};
}
export interface ERC1155OperatorMock extends BaseContract {
    connect(signerOrProvider: Signer | Provider | string): this;
    attach(addressOrName: string): this;
    deployed(): Promise<this>;
    interface: ERC1155OperatorMockInterface;
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
        metaSafeBatchTransferFrom(_tokenAddress: PromiseOrValue<string>, _from: PromiseOrValue<string>, _to: PromiseOrValue<string>, _ids: PromiseOrValue<BigNumberish>[], _amounts: PromiseOrValue<BigNumberish>[], _isGasFee: PromiseOrValue<boolean>, _data: PromiseOrValue<BytesLike>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        metaSafeTransferFrom(_tokenAddress: PromiseOrValue<string>, _from: PromiseOrValue<string>, _to: PromiseOrValue<string>, _id: PromiseOrValue<BigNumberish>, _amount: PromiseOrValue<BigNumberish>, _isGasFee: PromiseOrValue<boolean>, _data: PromiseOrValue<BytesLike>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        metaSetApprovalForAll(_tokenAddress: PromiseOrValue<string>, _owner: PromiseOrValue<string>, _operator: PromiseOrValue<string>, _approved: PromiseOrValue<boolean>, _isGasFee: PromiseOrValue<boolean>, _data: PromiseOrValue<BytesLike>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        safeBatchTransferFrom(_tokenAddress: PromiseOrValue<string>, _from: PromiseOrValue<string>, _to: PromiseOrValue<string>, _ids: PromiseOrValue<BigNumberish>[], _amounts: PromiseOrValue<BigNumberish>[], _data: PromiseOrValue<BytesLike>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        safeTransferFrom(_tokenAddress: PromiseOrValue<string>, _from: PromiseOrValue<string>, _to: PromiseOrValue<string>, _id: PromiseOrValue<BigNumberish>, _amount: PromiseOrValue<BigNumberish>, _data: PromiseOrValue<BytesLike>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
    };
    metaSafeBatchTransferFrom(_tokenAddress: PromiseOrValue<string>, _from: PromiseOrValue<string>, _to: PromiseOrValue<string>, _ids: PromiseOrValue<BigNumberish>[], _amounts: PromiseOrValue<BigNumberish>[], _isGasFee: PromiseOrValue<boolean>, _data: PromiseOrValue<BytesLike>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    metaSafeTransferFrom(_tokenAddress: PromiseOrValue<string>, _from: PromiseOrValue<string>, _to: PromiseOrValue<string>, _id: PromiseOrValue<BigNumberish>, _amount: PromiseOrValue<BigNumberish>, _isGasFee: PromiseOrValue<boolean>, _data: PromiseOrValue<BytesLike>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    metaSetApprovalForAll(_tokenAddress: PromiseOrValue<string>, _owner: PromiseOrValue<string>, _operator: PromiseOrValue<string>, _approved: PromiseOrValue<boolean>, _isGasFee: PromiseOrValue<boolean>, _data: PromiseOrValue<BytesLike>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    safeBatchTransferFrom(_tokenAddress: PromiseOrValue<string>, _from: PromiseOrValue<string>, _to: PromiseOrValue<string>, _ids: PromiseOrValue<BigNumberish>[], _amounts: PromiseOrValue<BigNumberish>[], _data: PromiseOrValue<BytesLike>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    safeTransferFrom(_tokenAddress: PromiseOrValue<string>, _from: PromiseOrValue<string>, _to: PromiseOrValue<string>, _id: PromiseOrValue<BigNumberish>, _amount: PromiseOrValue<BigNumberish>, _data: PromiseOrValue<BytesLike>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    callStatic: {
        metaSafeBatchTransferFrom(_tokenAddress: PromiseOrValue<string>, _from: PromiseOrValue<string>, _to: PromiseOrValue<string>, _ids: PromiseOrValue<BigNumberish>[], _amounts: PromiseOrValue<BigNumberish>[], _isGasFee: PromiseOrValue<boolean>, _data: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<void>;
        metaSafeTransferFrom(_tokenAddress: PromiseOrValue<string>, _from: PromiseOrValue<string>, _to: PromiseOrValue<string>, _id: PromiseOrValue<BigNumberish>, _amount: PromiseOrValue<BigNumberish>, _isGasFee: PromiseOrValue<boolean>, _data: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<void>;
        metaSetApprovalForAll(_tokenAddress: PromiseOrValue<string>, _owner: PromiseOrValue<string>, _operator: PromiseOrValue<string>, _approved: PromiseOrValue<boolean>, _isGasFee: PromiseOrValue<boolean>, _data: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<void>;
        safeBatchTransferFrom(_tokenAddress: PromiseOrValue<string>, _from: PromiseOrValue<string>, _to: PromiseOrValue<string>, _ids: PromiseOrValue<BigNumberish>[], _amounts: PromiseOrValue<BigNumberish>[], _data: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<void>;
        safeTransferFrom(_tokenAddress: PromiseOrValue<string>, _from: PromiseOrValue<string>, _to: PromiseOrValue<string>, _id: PromiseOrValue<BigNumberish>, _amount: PromiseOrValue<BigNumberish>, _data: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<void>;
    };
    filters: {};
    estimateGas: {
        metaSafeBatchTransferFrom(_tokenAddress: PromiseOrValue<string>, _from: PromiseOrValue<string>, _to: PromiseOrValue<string>, _ids: PromiseOrValue<BigNumberish>[], _amounts: PromiseOrValue<BigNumberish>[], _isGasFee: PromiseOrValue<boolean>, _data: PromiseOrValue<BytesLike>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        metaSafeTransferFrom(_tokenAddress: PromiseOrValue<string>, _from: PromiseOrValue<string>, _to: PromiseOrValue<string>, _id: PromiseOrValue<BigNumberish>, _amount: PromiseOrValue<BigNumberish>, _isGasFee: PromiseOrValue<boolean>, _data: PromiseOrValue<BytesLike>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        metaSetApprovalForAll(_tokenAddress: PromiseOrValue<string>, _owner: PromiseOrValue<string>, _operator: PromiseOrValue<string>, _approved: PromiseOrValue<boolean>, _isGasFee: PromiseOrValue<boolean>, _data: PromiseOrValue<BytesLike>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        safeBatchTransferFrom(_tokenAddress: PromiseOrValue<string>, _from: PromiseOrValue<string>, _to: PromiseOrValue<string>, _ids: PromiseOrValue<BigNumberish>[], _amounts: PromiseOrValue<BigNumberish>[], _data: PromiseOrValue<BytesLike>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        safeTransferFrom(_tokenAddress: PromiseOrValue<string>, _from: PromiseOrValue<string>, _to: PromiseOrValue<string>, _id: PromiseOrValue<BigNumberish>, _amount: PromiseOrValue<BigNumberish>, _data: PromiseOrValue<BytesLike>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
    };
    populateTransaction: {
        metaSafeBatchTransferFrom(_tokenAddress: PromiseOrValue<string>, _from: PromiseOrValue<string>, _to: PromiseOrValue<string>, _ids: PromiseOrValue<BigNumberish>[], _amounts: PromiseOrValue<BigNumberish>[], _isGasFee: PromiseOrValue<boolean>, _data: PromiseOrValue<BytesLike>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        metaSafeTransferFrom(_tokenAddress: PromiseOrValue<string>, _from: PromiseOrValue<string>, _to: PromiseOrValue<string>, _id: PromiseOrValue<BigNumberish>, _amount: PromiseOrValue<BigNumberish>, _isGasFee: PromiseOrValue<boolean>, _data: PromiseOrValue<BytesLike>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        metaSetApprovalForAll(_tokenAddress: PromiseOrValue<string>, _owner: PromiseOrValue<string>, _operator: PromiseOrValue<string>, _approved: PromiseOrValue<boolean>, _isGasFee: PromiseOrValue<boolean>, _data: PromiseOrValue<BytesLike>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        safeBatchTransferFrom(_tokenAddress: PromiseOrValue<string>, _from: PromiseOrValue<string>, _to: PromiseOrValue<string>, _ids: PromiseOrValue<BigNumberish>[], _amounts: PromiseOrValue<BigNumberish>[], _data: PromiseOrValue<BytesLike>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        safeTransferFrom(_tokenAddress: PromiseOrValue<string>, _from: PromiseOrValue<string>, _to: PromiseOrValue<string>, _id: PromiseOrValue<BigNumberish>, _amount: PromiseOrValue<BigNumberish>, _data: PromiseOrValue<BytesLike>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
    };
}
