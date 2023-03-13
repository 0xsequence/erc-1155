import { Signer, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { PromiseOrValue } from "../../../common";
import type { ERC1155MintBurnPackedBalance, ERC1155MintBurnPackedBalanceInterface } from "../../../tokens/ERC1155PackedBalance/ERC1155MintBurnPackedBalance";
declare type ERC1155MintBurnPackedBalanceConstructorParams = [signer?: Signer] | ConstructorParameters<typeof ContractFactory>;
export declare class ERC1155MintBurnPackedBalance__factory extends ContractFactory {
    constructor(...args: ERC1155MintBurnPackedBalanceConstructorParams);
    deploy(overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ERC1155MintBurnPackedBalance>;
    getDeployTransaction(overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): TransactionRequest;
    attach(address: string): ERC1155MintBurnPackedBalance;
    connect(signer: Signer): ERC1155MintBurnPackedBalance__factory;
    static readonly bytecode = "0x608060405234801561001057600080fd5b50611e85806100206000396000f3fe608060405234801561001057600080fd5b50600436106100a25760003560e01c8063a22cb46511610076578063e985e9c51161005b578063e985e9c514610160578063eaec5f81146101a9578063f242432a146101bc57600080fd5b8063a22cb46514610125578063db90e83c1461013857600080fd5b8062fdd58e146100a757806301ffc9a7146100cd5780632eb2c2d6146100f05780634e1273f414610105575b600080fd5b6100ba6100b5366004611586565b6101cf565b6040519081526020015b60405180910390f35b6100e06100db3660046115e1565b610226565b60405190151581526020016100c4565b6101036100fe366004611799565b6102c3565b005b610118610113366004611843565b61046c565b6040516100c4919061193e565b610103610133366004611951565b610766565b61014b61014636600461198d565b6107fd565b604080519283526020830191909152016100c4565b6100e061016e3660046119a6565b73ffffffffffffffffffffffffffffffffffffffff918216600090815260016020908152604080832093909416825291909152205460ff1690565b6100ba6101b73660046119d9565b610837565b6101036101ca3660046119fb565b610865565b60008060006101dd846107fd565b73ffffffffffffffffffffffffffffffffffffffff8716600090815260208181526040808320858452909152902054919350915061021b9082610837565b925050505b92915050565b60007f264985da000000000000000000000000000000000000000000000000000000007fffffffff0000000000000000000000000000000000000000000000000000000083160161027957506001919050565b7f01ffc9a7000000000000000000000000000000000000000000000000000000007fffffffff00000000000000000000000000000000000000000000000000000000831614610220565b3373ffffffffffffffffffffffffffffffffffffffff86161480610317575073ffffffffffffffffffffffffffffffffffffffff8516600090815260016020908152604080832033845290915290205460ff165b6103a8576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152603c60248201527f455243313135355061636b656442616c616e636523736166654261746368547260448201527f616e7366657246726f6d3a20494e56414c49445f4f50455241544f520000000060648201526084015b60405180910390fd5b73ffffffffffffffffffffffffffffffffffffffff841661044b576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152603d60248201527f455243313135355061636b656442616c616e636523736166654261746368547260448201527f616e7366657246726f6d3a20494e56414c49445f524543495049454e54000000606482015260840161039f565b61045785858585610a02565b610465858585855a86610e65565b5050505050565b81518151606091908114610502576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152603960248201527f455243313135355061636b656442616c616e63652362616c616e63654f66426160448201527f7463683a20494e56414c49445f41525241595f4c454e47544800000000000000606482015260840161039f565b6000806105288560008151811061051b5761051b611a60565b60200260200101516107fd565b9150915060008060008860008151811061054457610544611a60565b602002602001015173ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000206000848152602001908152602001600020549050600083905060008567ffffffffffffffff8111156105ba576105ba6115fe565b6040519080825280602002602001820160405280156105e3578160200160208202803683370190505b5090506105f08385610837565b8160008151811061060357610603611a60565b602090810291909101015260015b868110156107595761062e89828151811061051b5761051b611a60565b909650945082861415806106ac575089818151811061064f5761064f611a60565b602002602001015173ffffffffffffffffffffffffffffffffffffffff168a60018361067b9190611abe565b8151811061068b5761068b611a60565b602002602001015173ffffffffffffffffffffffffffffffffffffffff1614155b15610720576000808b83815181106106c6576106c6611a60565b602002602001015173ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008781526020019081526020016000205493508592505b61072a8486610837565b82828151811061073c5761073c611a60565b60209081029190910101528061075181611ad1565b915050610611565b5098975050505050505050565b33600081815260016020908152604080832073ffffffffffffffffffffffffffffffffffffffff87168085529083529281902080547fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff001686151590811790915590519081529192917f17307eab39ab6107e8899845ad3d59bd9653f200f220920489ca2b5937696c31910160405180910390a35050565b60008061080d6020610100611b38565b6108179084611b38565b91506108266020610100611b38565b6108309084611b4c565b9050915091565b60008061084a6001640100000000611abe565b90506000610859846020611b60565b9490941c169392505050565b3373ffffffffffffffffffffffffffffffffffffffff861614806108b9575073ffffffffffffffffffffffffffffffffffffffff8516600090815260016020908152604080832033845290915290205460ff165b610945576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152603760248201527f455243313135355061636b656442616c616e636523736166655472616e73666560448201527f7246726f6d3a20494e56414c49445f4f50455241544f52000000000000000000606482015260840161039f565b73ffffffffffffffffffffffffffffffffffffffff84166109e8576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152603860248201527f455243313135355061636b656442616c616e636523736166655472616e73666560448201527f7246726f6d3a20494e56414c49445f524543495049454e540000000000000000606482015260840161039f565b6109f485858585611014565b610465858585855a8661108c565b815181518114610aba576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152604260248201527f455243313135355061636b656442616c616e6365235f7361666542617463685460448201527f72616e7366657246726f6d3a20494e56414c49445f4152524159535f4c454e4760648201527f5448000000000000000000000000000000000000000000000000000000000000608482015260a40161039f565b8373ffffffffffffffffffffffffffffffffffffffff168573ffffffffffffffffffffffffffffffffffffffff1614158015610af65750600081115b15610cf657600080610b148560008151811061051b5761051b611a60565b73ffffffffffffffffffffffffffffffffffffffff8916600090815260208181526040808320858452909152812054875193955091935091610b729190849088908590610b6357610b63611a60565b60200260200101516001611231565b73ffffffffffffffffffffffffffffffffffffffff881660009081526020818152604080832087845290915281205487519293509091610bce9190859089908590610bbf57610bbf611a60565b60200260200101516000611231565b90508360015b86811015610ca457610bf189828151811061051b5761051b611a60565b9096509450818614610c605773ffffffffffffffffffffffffffffffffffffffff8b811660009081526020818152604080832086845280835281842098909855928d16825281815282822094825284815282822095909555878152948452808520549290935291909220549084905b610c7784868a8481518110610b6357610b63611a60565b9350610c9083868a8481518110610bbf57610bbf611a60565b925080610c9c81611ad1565b915050610bd4565b505073ffffffffffffffffffffffffffffffffffffffff808a16600090815260208181526040808320888452825280832095909555918a16815280825283812095815294905292209190915550610de0565b60005b81811015610dde57828181518110610d1357610d13611a60565b6020026020010151610d3e87868481518110610d3157610d31611a60565b60200260200101516101cf565b1015610dcc576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152603660248201527f455243313135355061636b656442616c616e6365235f7361666542617463685460448201527f72616e7366657246726f6d3a20554e444552464c4f5700000000000000000000606482015260840161039f565b80610dd681611ad1565b915050610cf9565b505b8373ffffffffffffffffffffffffffffffffffffffff168573ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff167f4a39dc06d4c0dbc64b70af90fd698a233a518aa5d07e595d983b8c0526c8f7fb8686604051610e56929190611b77565b60405180910390a45050505050565b610e848573ffffffffffffffffffffffffffffffffffffffff1661149c565b1561100c5760008573ffffffffffffffffffffffffffffffffffffffff1663bc197c8184338a8989886040518763ffffffff1660e01b8152600401610ecd959493929190611c09565b60206040518083038160008887f1158015610eec573d6000803e3d6000fd5b50505050506040513d601f19601f82011682018060405250810190610f119190611c74565b90507fffffffff0000000000000000000000000000000000000000000000000000000081167fbc197c81000000000000000000000000000000000000000000000000000000001461100a576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152604c60248201527f455243313135355061636b656442616c616e6365235f63616c6c6f6e4552433160448201527f313535426174636852656365697665643a20494e56414c49445f4f4e5f52454360648201527f454956455f4d4553534147450000000000000000000000000000000000000000608482015260a40161039f565b505b505050505050565b61102184838360016114d6565b61102e83838360006114d6565b604080518381526020810183905273ffffffffffffffffffffffffffffffffffffffff808616929087169133917fc3d58168c5ae7397731d063d5bbf3d657854427343f4c083240f7aacaa2d0f62910160405180910390a450505050565b6110ab8573ffffffffffffffffffffffffffffffffffffffff1661149c565b1561100c5760008573ffffffffffffffffffffffffffffffffffffffff1663f23a6e6184338a8989886040518763ffffffff1660e01b81526004016110f4959493929190611c91565b60206040518083038160008887f1158015611113573d6000803e3d6000fd5b50505050506040513d601f19601f820116820180604052508101906111389190611c74565b90507fffffffff0000000000000000000000000000000000000000000000000000000081167ff23a6e61000000000000000000000000000000000000000000000000000000001461100a576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152604760248201527f455243313135355061636b656442616c616e6365235f63616c6c6f6e4552433160448201527f31353552656365697665643a20494e56414c49445f4f4e5f524543454956455f60648201527f4d45535341474500000000000000000000000000000000000000000000000000608482015260a40161039f565b60008061123f856020611b60565b905060006112536001640100000000611abe565b9050600084600181111561126957611269611ce1565b036113285761127a85831b88611d10565b925061128860206002611e43565b6112968689851c8416611d10565b10611323576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152603260248201527f455243313135355061636b656442616c616e6365235f7669657755706461746560448201527f42696e56616c75653a204f564552464c4f570000000000000000000000000000606482015260840161039f565b611492565b600184600181111561133c5761133c611ce1565b036113e45761134d85831b88611abe565b925084818389901c161015611323576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152603360248201527f455243313135355061636b656442616c616e6365235f7669657755706461746560448201527f42696e56616c75653a20554e444552464c4f5700000000000000000000000000606482015260840161039f565b6040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152604560248201527f455243313135355061636b656442616c616e6365235f7669657755706461746560448201527f42696e56616c75653a20494e56414c49445f42494e5f57524954455f4f50455260648201527f4154494f4e000000000000000000000000000000000000000000000000000000608482015260a40161039f565b5050949350505050565b6000813f80158015906114cf57507fc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a4708114155b9392505050565b6000806114e2856107fd565b73ffffffffffffffffffffffffffffffffffffffff8816600090815260208181526040808320858452909152902054919350915061152290828686611231565b73ffffffffffffffffffffffffffffffffffffffff909616600090815260208181526040808320948352939052919091209490945550505050565b803573ffffffffffffffffffffffffffffffffffffffff8116811461158157600080fd5b919050565b6000806040838503121561159957600080fd5b6115a28361155d565b946020939093013593505050565b7fffffffff00000000000000000000000000000000000000000000000000000000811681146115de57600080fd5b50565b6000602082840312156115f357600080fd5b81356114cf816115b0565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b604051601f82017fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe016810167ffffffffffffffff81118282101715611674576116746115fe565b604052919050565b600067ffffffffffffffff821115611696576116966115fe565b5060051b60200190565b600082601f8301126116b157600080fd5b813560206116c66116c18361167c565b61162d565b82815260059290921b840181019181810190868411156116e557600080fd5b8286015b8481101561170057803583529183019183016116e9565b509695505050505050565b600082601f83011261171c57600080fd5b813567ffffffffffffffff811115611736576117366115fe565b61176760207fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe0601f8401160161162d565b81815284602083860101111561177c57600080fd5b816020850160208301376000918101602001919091529392505050565b600080600080600060a086880312156117b157600080fd5b6117ba8661155d565b94506117c86020870161155d565b9350604086013567ffffffffffffffff808211156117e557600080fd5b6117f189838a016116a0565b9450606088013591508082111561180757600080fd5b61181389838a016116a0565b9350608088013591508082111561182957600080fd5b506118368882890161170b565b9150509295509295909350565b6000806040838503121561185657600080fd5b823567ffffffffffffffff8082111561186e57600080fd5b818501915085601f83011261188257600080fd5b813560206118926116c18361167c565b82815260059290921b840181019181810190898411156118b157600080fd5b948201945b838610156118d6576118c78661155d565b825294820194908201906118b6565b965050860135925050808211156118ec57600080fd5b506118f9858286016116a0565b9150509250929050565b600081518084526020808501945080840160005b8381101561193357815187529582019590820190600101611917565b509495945050505050565b6020815260006114cf6020830184611903565b6000806040838503121561196457600080fd5b61196d8361155d565b91506020830135801515811461198257600080fd5b809150509250929050565b60006020828403121561199f57600080fd5b5035919050565b600080604083850312156119b957600080fd5b6119c28361155d565b91506119d06020840161155d565b90509250929050565b600080604083850312156119ec57600080fd5b50508035926020909101359150565b600080600080600060a08688031215611a1357600080fd5b611a1c8661155d565b9450611a2a6020870161155d565b93506040860135925060608601359150608086013567ffffffffffffffff811115611a5457600080fd5b6118368882890161170b565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b8181038181111561022057610220611a8f565b60007fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff8203611b0257611b02611a8f565b5060010190565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601260045260246000fd5b600082611b4757611b47611b09565b500490565b600082611b5b57611b5b611b09565b500690565b808202811582820484141761022057610220611a8f565b604081526000611b8a6040830185611903565b8281036020840152611b9c8185611903565b95945050505050565b6000815180845260005b81811015611bcb57602081850181015186830182015201611baf565b5060006020828601015260207fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe0601f83011685010191505092915050565b600073ffffffffffffffffffffffffffffffffffffffff808816835280871660208401525060a06040830152611c4260a0830186611903565b8281036060840152611c548186611903565b90508281036080840152611c688185611ba5565b98975050505050505050565b600060208284031215611c8657600080fd5b81516114cf816115b0565b600073ffffffffffffffffffffffffffffffffffffffff808816835280871660208401525084604083015283606083015260a06080830152611cd660a0830184611ba5565b979650505050505050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052602160045260246000fd5b8082018082111561022057610220611a8f565b600181815b80851115611d7c57817fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff04821115611d6257611d62611a8f565b80851615611d6f57918102915b93841c9390800290611d28565b509250929050565b600082611d9357506001610220565b81611da057506000610220565b8160018114611db65760028114611dc057611ddc565b6001915050610220565b60ff841115611dd157611dd1611a8f565b50506001821b610220565b5060208310610133831016604e8410600b8410161715611dff575081810a610220565b611e098383611d23565b807fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff04821115611e3b57611e3b611a8f565b029392505050565b60006114cf8383611d8456fea26469706673582212207c940e53b85785a9e9696ed245fe0b69b28d15ee0aa47858d9b928543d5327fe64736f6c63430008120033";
    static readonly abi: ({
        anonymous: boolean;
        inputs: {
            indexed: boolean;
            internalType: string;
            name: string;
            type: string;
        }[];
        name: string;
        type: string;
        outputs?: undefined;
        stateMutability?: undefined;
    } | {
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
        anonymous?: undefined;
    })[];
    static createInterface(): ERC1155MintBurnPackedBalanceInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): ERC1155MintBurnPackedBalance;
}
export {};
