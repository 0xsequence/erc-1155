/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { utils, Contract, ContractFactory } from "ethers";
const _abi = [
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "_owner",
                type: "address",
            },
            {
                indexed: true,
                internalType: "address",
                name: "_operator",
                type: "address",
            },
            {
                indexed: false,
                internalType: "bool",
                name: "_approved",
                type: "bool",
            },
        ],
        name: "ApprovalForAll",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "_operator",
                type: "address",
            },
            {
                indexed: true,
                internalType: "address",
                name: "_from",
                type: "address",
            },
            {
                indexed: true,
                internalType: "address",
                name: "_to",
                type: "address",
            },
            {
                indexed: false,
                internalType: "uint256[]",
                name: "_ids",
                type: "uint256[]",
            },
            {
                indexed: false,
                internalType: "uint256[]",
                name: "_amounts",
                type: "uint256[]",
            },
        ],
        name: "TransferBatch",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "_operator",
                type: "address",
            },
            {
                indexed: true,
                internalType: "address",
                name: "_from",
                type: "address",
            },
            {
                indexed: true,
                internalType: "address",
                name: "_to",
                type: "address",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "_id",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "_amount",
                type: "uint256",
            },
        ],
        name: "TransferSingle",
        type: "event",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "_owner",
                type: "address",
            },
            {
                internalType: "uint256",
                name: "_id",
                type: "uint256",
            },
        ],
        name: "balanceOf",
        outputs: [
            {
                internalType: "uint256",
                name: "",
                type: "uint256",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address[]",
                name: "_owners",
                type: "address[]",
            },
            {
                internalType: "uint256[]",
                name: "_ids",
                type: "uint256[]",
            },
        ],
        name: "balanceOfBatch",
        outputs: [
            {
                internalType: "uint256[]",
                name: "",
                type: "uint256[]",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "_owner",
                type: "address",
            },
            {
                internalType: "address",
                name: "_operator",
                type: "address",
            },
        ],
        name: "isApprovedForAll",
        outputs: [
            {
                internalType: "bool",
                name: "isOperator",
                type: "bool",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "_from",
                type: "address",
            },
            {
                internalType: "address",
                name: "_to",
                type: "address",
            },
            {
                internalType: "uint256[]",
                name: "_ids",
                type: "uint256[]",
            },
            {
                internalType: "uint256[]",
                name: "_amounts",
                type: "uint256[]",
            },
            {
                internalType: "bytes",
                name: "_data",
                type: "bytes",
            },
        ],
        name: "safeBatchTransferFrom",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "_from",
                type: "address",
            },
            {
                internalType: "address",
                name: "_to",
                type: "address",
            },
            {
                internalType: "uint256",
                name: "_id",
                type: "uint256",
            },
            {
                internalType: "uint256",
                name: "_amount",
                type: "uint256",
            },
            {
                internalType: "bytes",
                name: "_data",
                type: "bytes",
            },
        ],
        name: "safeTransferFrom",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "_operator",
                type: "address",
            },
            {
                internalType: "bool",
                name: "_approved",
                type: "bool",
            },
        ],
        name: "setApprovalForAll",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "bytes4",
                name: "_interfaceID",
                type: "bytes4",
            },
        ],
        name: "supportsInterface",
        outputs: [
            {
                internalType: "bool",
                name: "",
                type: "bool",
            },
        ],
        stateMutability: "pure",
        type: "function",
    },
];
const _bytecode = "0x608060405234801561001057600080fd5b50611759806100206000396000f3fe608060405234801561001057600080fd5b506004361061007c5760003560e01c80634e1273f41161005b5780634e1273f4146100df578063a22cb465146100ff578063e985e9c514610112578063f242432a1461015b57600080fd5b8062fdd58e1461008157806301ffc9a7146100a75780632eb2c2d6146100ca575b600080fd5b61009461008f36600461105e565b61016e565b6040519081526020015b60405180910390f35b6100ba6100b53660046110b9565b6101a4565b604051901515815260200161009e565b6100dd6100d8366004611271565b610241565b005b6100f26100ed36600461131b565b6103ea565b60405161009e9190611416565b6100dd61010d366004611429565b61058a565b6100ba610120366004611465565b73ffffffffffffffffffffffffffffffffffffffff918216600090815260016020908152604080832093909416825291909152205460ff1690565b6100dd610169366004611498565b610621565b73ffffffffffffffffffffffffffffffffffffffff82166000908152602081815260408083208484529091529020545b92915050565b60007f264985da000000000000000000000000000000000000000000000000000000007fffffffff000000000000000000000000000000000000000000000000000000008316016101f757506001919050565b7f01ffc9a7000000000000000000000000000000000000000000000000000000007fffffffff0000000000000000000000000000000000000000000000000000000083161461019e565b3373ffffffffffffffffffffffffffffffffffffffff86161480610295575073ffffffffffffffffffffffffffffffffffffffff8516600090815260016020908152604080832033845290915290205460ff165b610326576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152602f60248201527f45524331313535237361666542617463685472616e7366657246726f6d3a204960448201527f4e56414c49445f4f50455241544f52000000000000000000000000000000000060648201526084015b60405180910390fd5b73ffffffffffffffffffffffffffffffffffffffff84166103c9576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152603060248201527f45524331313535237361666542617463685472616e7366657246726f6d3a204960448201527f4e56414c49445f524543495049454e5400000000000000000000000000000000606482015260840161031d565b6103d5858585856107be565b6103e3858585855a86610af5565b5050505050565b6060815183511461047d576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152602c60248201527f455243313135352362616c616e63654f6642617463683a20494e56414c49445f60448201527f41525241595f4c454e4754480000000000000000000000000000000000000000606482015260840161031d565b6000835167ffffffffffffffff811115610499576104996110d6565b6040519080825280602002602001820160405280156104c2578160200160208202803683370190505b50905060005b8451811015610582576000808683815181106104e6576104e66114fd565b602002602001015173ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020600085838151811061053c5761053c6114fd565b6020026020010151815260200190815260200160002054828281518110610565576105656114fd565b60209081029190910101528061057a8161155b565b9150506104c8565b509392505050565b33600081815260016020908152604080832073ffffffffffffffffffffffffffffffffffffffff87168085529083529281902080547fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff001686151590811790915590519081529192917f17307eab39ab6107e8899845ad3d59bd9653f200f220920489ca2b5937696c31910160405180910390a35050565b3373ffffffffffffffffffffffffffffffffffffffff86161480610675575073ffffffffffffffffffffffffffffffffffffffff8516600090815260016020908152604080832033845290915290205460ff165b610701576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152602a60248201527f4552433131353523736166655472616e7366657246726f6d3a20494e56414c4960448201527f445f4f50455241544f5200000000000000000000000000000000000000000000606482015260840161031d565b73ffffffffffffffffffffffffffffffffffffffff84166107a4576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152602b60248201527f4552433131353523736166655472616e7366657246726f6d3a20494e56414c4960448201527f445f524543495049454e54000000000000000000000000000000000000000000606482015260840161031d565b6107b085858585610c7e565b6103e3858585855a86610d7f565b805182511461084f576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152603560248201527f45524331313535235f7361666542617463685472616e7366657246726f6d3a2060448201527f494e56414c49445f4152524159535f4c454e4754480000000000000000000000606482015260840161031d565b815160005b81811015610a6f576108f0838281518110610871576108716114fd565b60200260200101516000808973ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008785815181106108cb576108cb6114fd565b6020026020010151815260200190815260200160002054610efe90919063ffffffff16565b6000808873ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000206000868481518110610942576109426114fd565b60200260200101518152602001908152602001600020819055506109f0838281518110610971576109716114fd565b60200260200101516000808873ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008785815181106109cb576109cb6114fd565b6020026020010151815260200190815260200160002054610f7e90919063ffffffff16565b6000808773ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000206000868481518110610a4257610a426114fd565b60200260200101518152602001908152602001600020819055508080610a679061155b565b915050610854565b508373ffffffffffffffffffffffffffffffffffffffff168573ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff167f4a39dc06d4c0dbc64b70af90fd698a233a518aa5d07e595d983b8c0526c8f7fb8686604051610ae6929190611593565b60405180910390a45050505050565b610b148573ffffffffffffffffffffffffffffffffffffffff16610ffe565b15610c765760008573ffffffffffffffffffffffffffffffffffffffff1663bc197c8184338a8989886040518763ffffffff1660e01b8152600401610b5d959493929190611625565b60206040518083038160008887f1158015610b7c573d6000803e3d6000fd5b50505050506040513d601f19601f82011682018060405250810190610ba19190611690565b90507fffffffff0000000000000000000000000000000000000000000000000000000081167fbc197c810000000000000000000000000000000000000000000000000000000014610c74576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152603f60248201527f45524331313535235f63616c6c6f6e455243313135354261746368526563656960448201527f7665643a20494e56414c49445f4f4e5f524543454956455f4d45535341474500606482015260840161031d565b505b505050505050565b73ffffffffffffffffffffffffffffffffffffffff8416600090815260208181526040808320858452909152902054610cb79082610efe565b73ffffffffffffffffffffffffffffffffffffffff80861660009081526020818152604080832087845282528083209490945591861681528082528281208582529091522054610d079082610f7e565b73ffffffffffffffffffffffffffffffffffffffff84811660008181526020818152604080832088845282529182902094909455805186815293840185905290929187169133917fc3d58168c5ae7397731d063d5bbf3d657854427343f4c083240f7aacaa2d0f62910160405180910390a450505050565b610d9e8573ffffffffffffffffffffffffffffffffffffffff16610ffe565b15610c765760008573ffffffffffffffffffffffffffffffffffffffff1663f23a6e6184338a8989886040518763ffffffff1660e01b8152600401610de79594939291906116ad565b60206040518083038160008887f1158015610e06573d6000803e3d6000fd5b50505050506040513d601f19601f82011682018060405250810190610e2b9190611690565b90507fffffffff0000000000000000000000000000000000000000000000000000000081167ff23a6e610000000000000000000000000000000000000000000000000000000014610c74576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152603a60248201527f45524331313535235f63616c6c6f6e4552433131353552656365697665643a2060448201527f494e56414c49445f4f4e5f524543454956455f4d455353414745000000000000606482015260840161031d565b600082821115610f6a576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152601760248201527f536166654d617468237375623a20554e444552464c4f57000000000000000000604482015260640161031d565b6000610f7683856116fd565b949350505050565b600080610f8b8385611710565b905083811015610ff7576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152601660248201527f536166654d617468236164643a204f564552464c4f5700000000000000000000604482015260640161031d565b9392505050565b6000813f8015801590610ff757507fc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470141592915050565b803573ffffffffffffffffffffffffffffffffffffffff8116811461105957600080fd5b919050565b6000806040838503121561107157600080fd5b61107a83611035565b946020939093013593505050565b7fffffffff00000000000000000000000000000000000000000000000000000000811681146110b657600080fd5b50565b6000602082840312156110cb57600080fd5b8135610ff781611088565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b604051601f82017fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe016810167ffffffffffffffff8111828210171561114c5761114c6110d6565b604052919050565b600067ffffffffffffffff82111561116e5761116e6110d6565b5060051b60200190565b600082601f83011261118957600080fd5b8135602061119e61119983611154565b611105565b82815260059290921b840181019181810190868411156111bd57600080fd5b8286015b848110156111d857803583529183019183016111c1565b509695505050505050565b600082601f8301126111f457600080fd5b813567ffffffffffffffff81111561120e5761120e6110d6565b61123f60207fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe0601f84011601611105565b81815284602083860101111561125457600080fd5b816020850160208301376000918101602001919091529392505050565b600080600080600060a0868803121561128957600080fd5b61129286611035565b94506112a060208701611035565b9350604086013567ffffffffffffffff808211156112bd57600080fd5b6112c989838a01611178565b945060608801359150808211156112df57600080fd5b6112eb89838a01611178565b9350608088013591508082111561130157600080fd5b5061130e888289016111e3565b9150509295509295909350565b6000806040838503121561132e57600080fd5b823567ffffffffffffffff8082111561134657600080fd5b818501915085601f83011261135a57600080fd5b8135602061136a61119983611154565b82815260059290921b8401810191818101908984111561138957600080fd5b948201945b838610156113ae5761139f86611035565b8252948201949082019061138e565b965050860135925050808211156113c457600080fd5b506113d185828601611178565b9150509250929050565b600081518084526020808501945080840160005b8381101561140b578151875295820195908201906001016113ef565b509495945050505050565b602081526000610ff760208301846113db565b6000806040838503121561143c57600080fd5b61144583611035565b91506020830135801515811461145a57600080fd5b809150509250929050565b6000806040838503121561147857600080fd5b61148183611035565b915061148f60208401611035565b90509250929050565b600080600080600060a086880312156114b057600080fd5b6114b986611035565b94506114c760208701611035565b93506040860135925060608601359150608086013567ffffffffffffffff8111156114f157600080fd5b61130e888289016111e3565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b60007fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff820361158c5761158c61152c565b5060010190565b6040815260006115a660408301856113db565b82810360208401526115b881856113db565b95945050505050565b6000815180845260005b818110156115e7576020818501810151868301820152016115cb565b5060006020828601015260207fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe0601f83011685010191505092915050565b600073ffffffffffffffffffffffffffffffffffffffff808816835280871660208401525060a0604083015261165e60a08301866113db565b828103606084015261167081866113db565b9050828103608084015261168481856115c1565b98975050505050505050565b6000602082840312156116a257600080fd5b8151610ff781611088565b600073ffffffffffffffffffffffffffffffffffffffff808816835280871660208401525084604083015283606083015260a060808301526116f260a08301846115c1565b979650505050505050565b8181038181111561019e5761019e61152c565b8082018082111561019e5761019e61152c56fea26469706673582212208b9d9f33094dc1df993cadaa37a3ed72c362e926159171be0aaad5de359b322264736f6c63430008120033";
const isSuperArgs = (xs) => xs.length > 1;
export class ERC1155MintBurn__factory extends ContractFactory {
    constructor(...args) {
        if (isSuperArgs(args)) {
            super(...args);
        }
        else {
            super(_abi, _bytecode, args[0]);
        }
    }
    deploy(overrides) {
        return super.deploy(overrides || {});
    }
    getDeployTransaction(overrides) {
        return super.getDeployTransaction(overrides || {});
    }
    attach(address) {
        return super.attach(address);
    }
    connect(signer) {
        return super.connect(signer);
    }
    static createInterface() {
        return new utils.Interface(_abi);
    }
    static connect(address, signerOrProvider) {
        return new Contract(address, _abi, signerOrProvider);
    }
}
ERC1155MintBurn__factory.bytecode = _bytecode;
ERC1155MintBurn__factory.abi = _abi;
