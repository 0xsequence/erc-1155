import type { BaseContract, BigNumber, BigNumberish, BytesLike, CallOverrides, ContractTransaction, Overrides, PopulatedTransaction, Signer, utils } from "ethers";
import type { FunctionFragment, Result } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type { TypedEventFilter, TypedEvent, TypedListener, OnEvent, PromiseOrValue } from "../../common";
export interface ERC1271WalletValidationMockInterface extends utils.Interface {
    functions: {
        "ERC1271_INVALID()": FunctionFragment;
        "ERC1271_MAGICVALUE_BYTES32()": FunctionFragment;
        "ERC1271_MAGIC_VAL()": FunctionFragment;
        "isValidSignature(bytes32,bytes)": FunctionFragment;
        "isValidSignature(bytes,bytes)": FunctionFragment;
        "onERC1155BatchReceived(address,address,uint256[],uint256[],bytes)": FunctionFragment;
        "onERC1155Received(address,address,uint256,uint256,bytes)": FunctionFragment;
        "owner()": FunctionFragment;
    };
    getFunction(nameOrSignatureOrTopic: "ERC1271_INVALID" | "ERC1271_MAGICVALUE_BYTES32" | "ERC1271_MAGIC_VAL" | "isValidSignature(bytes32,bytes)" | "isValidSignature(bytes,bytes)" | "onERC1155BatchReceived" | "onERC1155Received" | "owner"): FunctionFragment;
    encodeFunctionData(functionFragment: "ERC1271_INVALID", values?: undefined): string;
    encodeFunctionData(functionFragment: "ERC1271_MAGICVALUE_BYTES32", values?: undefined): string;
    encodeFunctionData(functionFragment: "ERC1271_MAGIC_VAL", values?: undefined): string;
    encodeFunctionData(functionFragment: "isValidSignature(bytes32,bytes)", values: [PromiseOrValue<BytesLike>, PromiseOrValue<BytesLike>]): string;
    encodeFunctionData(functionFragment: "isValidSignature(bytes,bytes)", values: [PromiseOrValue<BytesLike>, PromiseOrValue<BytesLike>]): string;
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
    encodeFunctionData(functionFragment: "owner", values?: undefined): string;
    decodeFunctionResult(functionFragment: "ERC1271_INVALID", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "ERC1271_MAGICVALUE_BYTES32", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "ERC1271_MAGIC_VAL", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "isValidSignature(bytes32,bytes)", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "isValidSignature(bytes,bytes)", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "onERC1155BatchReceived", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "onERC1155Received", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "owner", data: BytesLike): Result;
    events: {};
}
export interface ERC1271WalletValidationMock extends BaseContract {
    connect(signerOrProvider: Signer | Provider | string): this;
    attach(addressOrName: string): this;
    deployed(): Promise<this>;
    interface: ERC1271WalletValidationMockInterface;
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
        ERC1271_INVALID(overrides?: CallOverrides): Promise<[string]>;
        ERC1271_MAGICVALUE_BYTES32(overrides?: CallOverrides): Promise<[string]>;
        ERC1271_MAGIC_VAL(overrides?: CallOverrides): Promise<[string]>;
        "isValidSignature(bytes32,bytes)"(_hash: PromiseOrValue<BytesLike>, _signature: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<[string] & {
            magicValue: string;
        }>;
        "isValidSignature(bytes,bytes)"(_data: PromiseOrValue<BytesLike>, _signature: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<[string] & {
            magicValue: string;
        }>;
        onERC1155BatchReceived(_operator: PromiseOrValue<string>, _from: PromiseOrValue<string>, _ids: PromiseOrValue<BigNumberish>[], _values: PromiseOrValue<BigNumberish>[], _data: PromiseOrValue<BytesLike>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        onERC1155Received(_operator: PromiseOrValue<string>, _from: PromiseOrValue<string>, _id: PromiseOrValue<BigNumberish>, _value: PromiseOrValue<BigNumberish>, _data: PromiseOrValue<BytesLike>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        owner(overrides?: CallOverrides): Promise<[string]>;
    };
    ERC1271_INVALID(overrides?: CallOverrides): Promise<string>;
    ERC1271_MAGICVALUE_BYTES32(overrides?: CallOverrides): Promise<string>;
    ERC1271_MAGIC_VAL(overrides?: CallOverrides): Promise<string>;
    "isValidSignature(bytes32,bytes)"(_hash: PromiseOrValue<BytesLike>, _signature: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<string>;
    "isValidSignature(bytes,bytes)"(_data: PromiseOrValue<BytesLike>, _signature: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<string>;
    onERC1155BatchReceived(_operator: PromiseOrValue<string>, _from: PromiseOrValue<string>, _ids: PromiseOrValue<BigNumberish>[], _values: PromiseOrValue<BigNumberish>[], _data: PromiseOrValue<BytesLike>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    onERC1155Received(_operator: PromiseOrValue<string>, _from: PromiseOrValue<string>, _id: PromiseOrValue<BigNumberish>, _value: PromiseOrValue<BigNumberish>, _data: PromiseOrValue<BytesLike>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    owner(overrides?: CallOverrides): Promise<string>;
    callStatic: {
        ERC1271_INVALID(overrides?: CallOverrides): Promise<string>;
        ERC1271_MAGICVALUE_BYTES32(overrides?: CallOverrides): Promise<string>;
        ERC1271_MAGIC_VAL(overrides?: CallOverrides): Promise<string>;
        "isValidSignature(bytes32,bytes)"(_hash: PromiseOrValue<BytesLike>, _signature: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<string>;
        "isValidSignature(bytes,bytes)"(_data: PromiseOrValue<BytesLike>, _signature: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<string>;
        onERC1155BatchReceived(_operator: PromiseOrValue<string>, _from: PromiseOrValue<string>, _ids: PromiseOrValue<BigNumberish>[], _values: PromiseOrValue<BigNumberish>[], _data: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<string>;
        onERC1155Received(_operator: PromiseOrValue<string>, _from: PromiseOrValue<string>, _id: PromiseOrValue<BigNumberish>, _value: PromiseOrValue<BigNumberish>, _data: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<string>;
        owner(overrides?: CallOverrides): Promise<string>;
    };
    filters: {};
    estimateGas: {
        ERC1271_INVALID(overrides?: CallOverrides): Promise<BigNumber>;
        ERC1271_MAGICVALUE_BYTES32(overrides?: CallOverrides): Promise<BigNumber>;
        ERC1271_MAGIC_VAL(overrides?: CallOverrides): Promise<BigNumber>;
        "isValidSignature(bytes32,bytes)"(_hash: PromiseOrValue<BytesLike>, _signature: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<BigNumber>;
        "isValidSignature(bytes,bytes)"(_data: PromiseOrValue<BytesLike>, _signature: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<BigNumber>;
        onERC1155BatchReceived(_operator: PromiseOrValue<string>, _from: PromiseOrValue<string>, _ids: PromiseOrValue<BigNumberish>[], _values: PromiseOrValue<BigNumberish>[], _data: PromiseOrValue<BytesLike>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        onERC1155Received(_operator: PromiseOrValue<string>, _from: PromiseOrValue<string>, _id: PromiseOrValue<BigNumberish>, _value: PromiseOrValue<BigNumberish>, _data: PromiseOrValue<BytesLike>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        owner(overrides?: CallOverrides): Promise<BigNumber>;
    };
    populateTransaction: {
        ERC1271_INVALID(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        ERC1271_MAGICVALUE_BYTES32(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        ERC1271_MAGIC_VAL(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        "isValidSignature(bytes32,bytes)"(_hash: PromiseOrValue<BytesLike>, _signature: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        "isValidSignature(bytes,bytes)"(_data: PromiseOrValue<BytesLike>, _signature: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        onERC1155BatchReceived(_operator: PromiseOrValue<string>, _from: PromiseOrValue<string>, _ids: PromiseOrValue<BigNumberish>[], _values: PromiseOrValue<BigNumberish>[], _data: PromiseOrValue<BytesLike>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        onERC1155Received(_operator: PromiseOrValue<string>, _from: PromiseOrValue<string>, _id: PromiseOrValue<BigNumberish>, _value: PromiseOrValue<BigNumberish>, _data: PromiseOrValue<BytesLike>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        owner(overrides?: CallOverrides): Promise<PopulatedTransaction>;
    };
}
