/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { utils, Contract, ContractFactory } from "ethers";
const _abi = [
    {
        inputs: [
            {
                internalType: "string",
                name: "_name",
                type: "string",
            },
            {
                internalType: "string",
                name: "_baseURI",
                type: "string",
            },
        ],
        stateMutability: "nonpayable",
        type: "constructor",
    },
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
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: "string",
                name: "_uri",
                type: "string",
            },
            {
                indexed: true,
                internalType: "uint256",
                name: "_id",
                type: "uint256",
            },
        ],
        name: "URI",
        type: "event",
    },
    {
        stateMutability: "nonpayable",
        type: "fallback",
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
        inputs: [],
        name: "baseURI",
        outputs: [
            {
                internalType: "string",
                name: "",
                type: "string",
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
                internalType: "uint256[]",
                name: "_ids",
                type: "uint256[]",
            },
            {
                internalType: "uint256[]",
                name: "_values",
                type: "uint256[]",
            },
        ],
        name: "batchBurnMock",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
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
                name: "_values",
                type: "uint256[]",
            },
            {
                internalType: "bytes",
                name: "_data",
                type: "bytes",
            },
        ],
        name: "batchMintMock",
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
                internalType: "uint256",
                name: "_id",
                type: "uint256",
            },
            {
                internalType: "uint256",
                name: "_value",
                type: "uint256",
            },
        ],
        name: "burnMock",
        outputs: [],
        stateMutability: "nonpayable",
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
                name: "_value",
                type: "uint256",
            },
            {
                internalType: "bytes",
                name: "_data",
                type: "bytes",
            },
        ],
        name: "mintMock",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [],
        name: "name",
        outputs: [
            {
                internalType: "string",
                name: "",
                type: "string",
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
    {
        inputs: [
            {
                internalType: "uint256",
                name: "_id",
                type: "uint256",
            },
        ],
        name: "uri",
        outputs: [
            {
                internalType: "string",
                name: "",
                type: "string",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
];
const _bytecode = "0x60806040523480156200001157600080fd5b506040516200284138038062002841833981016040819052620000349162000142565b818160036200004483826200023c565b5060026200005382826200023c565b505050505062000363565b634e487b7160e01b600052604160045260246000fd5b600082601f8301126200008657600080fd5b815167ffffffffffffffff80821115620000a457620000a46200005e565b604051601f83017fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe0908116603f01168101908282118183101715620000ed57620000ed6200005e565b816040528381526020925086838588010111156200010a57600080fd5b600091505b838210156200012e57858201830151818301840152908201906200010f565b600093810190920192909252949350505050565b600080604083850312156200015657600080fd5b825167ffffffffffffffff808211156200016f57600080fd5b6200017d8683870162000074565b935060208501519150808211156200019457600080fd5b50620001a38582860162000074565b9150509250929050565b600181811c90821680620001c257607f821691505b602082108103620001e357634e487b7160e01b600052602260045260246000fd5b50919050565b601f8211156200023757600081815260208120601f850160051c81016020861015620002125750805b601f850160051c820191505b8181101562000233578281556001016200021e565b5050505b505050565b815167ffffffffffffffff8111156200025957620002596200005e565b62000271816200026a8454620001ad565b84620001e9565b602080601f831160018114620002c75760008415620002905750858301515b7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff600386901b1c1916600185901b17855562000233565b6000858152602081207fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe08616915b828110156200031657888601518255948401946001909101908401620002f5565b50858210156200035357878501517fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff600388901b60f8161c191681555b5050505050600190811b01905550565b6124ce80620003736000396000f3fe608060405234801561001057600080fd5b50600436106100e95760003560e01c80636c0360eb1161008c578063bd7a6c4111610066578063bd7a6c411461025d578063d7a0ad9014610270578063e985e9c514610283578063f242432a146102cc576100e9565b80636c0360eb1461022f578063a22cb46514610237578063a3f091f51461024a576100e9565b80630e89341c116100c85780630e89341c146101d45780632eb2c2d6146101e7578063437ecbe9146101fc5780634e1273f41461020f576100e9565b8062fdd58e1461017657806301ffc9a71461019c57806306fdde03146101bf575b6040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152602360248201527f455243313135354d696e744275726e4d6f636b3a20494e56414c49445f4d455460448201527f484f44000000000000000000000000000000000000000000000000000000000060648201526084015b60405180910390fd5b610189610184366004611a09565b6102df565b6040519081526020015b60405180910390f35b6101af6101aa366004611a64565b610315565b6040519015158152602001610193565b6101c7610320565b6040516101939190611aef565b6101c76101e2366004611b02565b6103ae565b6101fa6101f5366004611cb6565b6103e2565b005b6101fa61020a366004611d60565b610586565b61022261021d366004611d93565b610596565b6040516101939190611e8e565b6101c7610736565b6101fa610245366004611ea1565b610743565b6101fa610258366004611edd565b6107da565b6101fa61026b366004611f3e565b6107ec565b6101fa61027e366004611fb2565b6107f7565b6101af61029136600461203f565b73ffffffffffffffffffffffffffffffffffffffff918216600090815260016020908152604080832093909416825291909152205460ff1690565b6101fa6102da366004612072565b610803565b73ffffffffffffffffffffffffffffffffffffffff82166000908152602081815260408083208484529091529020545b92915050565b600061030f826109a0565b6003805461032d906120d7565b80601f0160208091040260200160405190810160405280929190818152602001828054610359906120d7565b80156103a65780601f1061037b576101008083540402835291602001916103a6565b820191906000526020600020905b81548152906001019060200180831161038957829003601f168201915b505050505081565b606060026103bb836109fc565b6040516020016103cc929190612146565b6040516020818303038152906040529050919050565b3373ffffffffffffffffffffffffffffffffffffffff86161480610436575073ffffffffffffffffffffffffffffffffffffffff8516600090815260016020908152604080832033845290915290205460ff165b6104c2576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152602f60248201527f45524331313535237361666542617463685472616e7366657246726f6d3a204960448201527f4e56414c49445f4f50455241544f520000000000000000000000000000000000606482015260840161016d565b73ffffffffffffffffffffffffffffffffffffffff8416610565576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152603060248201527f45524331313535237361666542617463685472616e7366657246726f6d3a204960448201527f4e56414c49445f524543495049454e5400000000000000000000000000000000606482015260840161016d565b61057185858585610b49565b61057f858585855a86610e80565b5050505050565b610591838383611009565b505050565b60608151835114610629576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152602c60248201527f455243313135352362616c616e63654f6642617463683a20494e56414c49445f60448201527f41525241595f4c454e4754480000000000000000000000000000000000000000606482015260840161016d565b6000835167ffffffffffffffff81111561064557610645611b1b565b60405190808252806020026020018201604052801561066e578160200160208202803683370190505b50905060005b845181101561072e5760008086838151811061069257610692612253565b602002602001015173ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008583815181106106e8576106e8612253565b602002602001015181526020019081526020016000205482828151811061071157610711612253565b602090810291909101015280610726816122b1565b915050610674565b509392505050565b6002805461032d906120d7565b33600081815260016020908152604080832073ffffffffffffffffffffffffffffffffffffffff87168085529083529281902080547fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff001686151590811790915590519081529192917f17307eab39ab6107e8899845ad3d59bd9653f200f220920489ca2b5937696c31910160405180910390a35050565b6107e6848484846110b3565b50505050565b610591838383611169565b6107e68484848461137a565b3373ffffffffffffffffffffffffffffffffffffffff86161480610857575073ffffffffffffffffffffffffffffffffffffffff8516600090815260016020908152604080832033845290915290205460ff165b6108e3576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152602a60248201527f4552433131353523736166655472616e7366657246726f6d3a20494e56414c4960448201527f445f4f50455241544f5200000000000000000000000000000000000000000000606482015260840161016d565b73ffffffffffffffffffffffffffffffffffffffff8416610986576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152602b60248201527f4552433131353523736166655472616e7366657246726f6d3a20494e56414c4960448201527f445f524543495049454e54000000000000000000000000000000000000000000606482015260840161016d565b61099285858585611595565b61057f858585855a8661168d565b60007ff176cbe4000000000000000000000000000000000000000000000000000000007fffffffff000000000000000000000000000000000000000000000000000000008316016109f357506001919050565b61030f8261180c565b606081600003610a3f57505060408051808201909152600181527f3000000000000000000000000000000000000000000000000000000000000000602082015290565b818060005b8215610a6a5780610a54816122b1565b9150610a639050600a84612318565b9250610a44565b60008167ffffffffffffffff811115610a8557610a85611b1b565b6040519080825280601f01601f191660200182016040528015610aaf576020820181803683370190505b5090506000610abf60018461232c565b90505b8315610b3f57610ad3600a8561233f565b610ade906030612353565b60f81b8282610aec81612366565b935081518110610afe57610afe612253565b60200101907effffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916908160001a905350610b38600a85612318565b9350610ac2565b5095945050505050565b8051825114610bda576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152603560248201527f45524331313535235f7361666542617463685472616e7366657246726f6d3a2060448201527f494e56414c49445f4152524159535f4c454e4754480000000000000000000000606482015260840161016d565b815160005b81811015610dfa57610c7b838281518110610bfc57610bfc612253565b60200260200101516000808973ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000206000878581518110610c5657610c56612253565b60200260200101518152602001908152602001600020546118a990919063ffffffff16565b6000808873ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000206000868481518110610ccd57610ccd612253565b6020026020010151815260200190815260200160002081905550610d7b838281518110610cfc57610cfc612253565b60200260200101516000808873ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000206000878581518110610d5657610d56612253565b602002602001015181526020019081526020016000205461192990919063ffffffff16565b6000808773ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000206000868481518110610dcd57610dcd612253565b60200260200101518152602001908152602001600020819055508080610df2906122b1565b915050610bdf565b508373ffffffffffffffffffffffffffffffffffffffff168573ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff167f4a39dc06d4c0dbc64b70af90fd698a233a518aa5d07e595d983b8c0526c8f7fb8686604051610e7192919061239b565b60405180910390a45050505050565b610e9f8573ffffffffffffffffffffffffffffffffffffffff166119a9565b156110015760008573ffffffffffffffffffffffffffffffffffffffff1663bc197c8184338a8989886040518763ffffffff1660e01b8152600401610ee89594939291906123c0565b60206040518083038160008887f1158015610f07573d6000803e3d6000fd5b50505050506040513d601f19601f82011682018060405250810190610f2c919061242b565b90507fffffffff0000000000000000000000000000000000000000000000000000000081167fbc197c810000000000000000000000000000000000000000000000000000000014610fff576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152603f60248201527f45524331313535235f63616c6c6f6e455243313135354261746368526563656960448201527f7665643a20494e56414c49445f4f4e5f524543454956455f4d45535341474500606482015260840161016d565b505b505050505050565b73ffffffffffffffffffffffffffffffffffffffff831660009081526020818152604080832085845290915290205461104290826118a9565b73ffffffffffffffffffffffffffffffffffffffff84166000818152602081815260408083208784528252808320949094558351868152908101859052909233917fc3d58168c5ae7397731d063d5bbf3d657854427343f4c083240f7aacaa2d0f62910160405180910390a4505050565b73ffffffffffffffffffffffffffffffffffffffff84166000908152602081815260408083208684529091529020546110ec9083611929565b73ffffffffffffffffffffffffffffffffffffffff851660008181526020818152604080832088845282528083209490945583518781529081018690529192909133917fc3d58168c5ae7397731d063d5bbf3d657854427343f4c083240f7aacaa2d0f62910160405180910390a46107e660008585855a8661168d565b8151815181146111fb576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152603060248201527f455243313135354d696e744275726e2362617463684275726e3a20494e56414c60448201527f49445f4152524159535f4c454e47544800000000000000000000000000000000606482015260840161016d565b60005b818110156112f45761127583828151811061121b5761121b612253565b60200260200101516000808873ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000206000878581518110610c5657610c56612253565b6000808773ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008684815181106112c7576112c7612253565b602002602001015181526020019081526020016000208190555080806112ec906122b1565b9150506111fe565b50600073ffffffffffffffffffffffffffffffffffffffff168473ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff167f4a39dc06d4c0dbc64b70af90fd698a233a518aa5d07e595d983b8c0526c8f7fb868660405161136c92919061239b565b60405180910390a450505050565b815183511461140b576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152603060248201527f455243313135354d696e744275726e2362617463684d696e743a20494e56414c60448201527f49445f4152524159535f4c454e47544800000000000000000000000000000000606482015260840161016d565b825160005b818110156115065761148784828151811061142d5761142d612253565b60200260200101516000808973ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000206000888581518110610d5657610d56612253565b6000808873ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008784815181106114d9576114d9612253565b602002602001015181526020019081526020016000208190555080806114fe906122b1565b915050611410565b508473ffffffffffffffffffffffffffffffffffffffff16600073ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff167f4a39dc06d4c0dbc64b70af90fd698a233a518aa5d07e595d983b8c0526c8f7fb878760405161157e92919061239b565b60405180910390a461057f60008686865a87610e80565b73ffffffffffffffffffffffffffffffffffffffff84166000908152602081815260408083208584529091529020546115ce90826118a9565b73ffffffffffffffffffffffffffffffffffffffff8086166000908152602081815260408083208784528252808320949094559186168152808252828120858252909152205461161e9082611929565b73ffffffffffffffffffffffffffffffffffffffff84811660008181526020818152604080832088845282529182902094909455805186815293840185905290929187169133917fc3d58168c5ae7397731d063d5bbf3d657854427343f4c083240f7aacaa2d0f62910161136c565b6116ac8573ffffffffffffffffffffffffffffffffffffffff166119a9565b156110015760008573ffffffffffffffffffffffffffffffffffffffff1663f23a6e6184338a8989886040518763ffffffff1660e01b81526004016116f5959493929190612448565b60206040518083038160008887f1158015611714573d6000803e3d6000fd5b50505050506040513d601f19601f82011682018060405250810190611739919061242b565b90507fffffffff0000000000000000000000000000000000000000000000000000000081167ff23a6e610000000000000000000000000000000000000000000000000000000014610fff576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152603a60248201527f45524331313535235f63616c6c6f6e4552433131353552656365697665643a2060448201527f494e56414c49445f4f4e5f524543454956455f4d455353414745000000000000606482015260840161016d565b60007f264985da000000000000000000000000000000000000000000000000000000007fffffffff0000000000000000000000000000000000000000000000000000000083160161185f57506001919050565b7f01ffc9a7000000000000000000000000000000000000000000000000000000007fffffffff0000000000000000000000000000000000000000000000000000000083161461030f565b600082821115611915576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152601760248201527f536166654d617468237375623a20554e444552464c4f57000000000000000000604482015260640161016d565b6000611921838561232c565b949350505050565b6000806119368385612353565b9050838110156119a2576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152601660248201527f536166654d617468236164643a204f564552464c4f5700000000000000000000604482015260640161016d565b9392505050565b6000813f80158015906119a257507fc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470141592915050565b803573ffffffffffffffffffffffffffffffffffffffff81168114611a0457600080fd5b919050565b60008060408385031215611a1c57600080fd5b611a25836119e0565b946020939093013593505050565b7fffffffff0000000000000000000000000000000000000000000000000000000081168114611a6157600080fd5b50565b600060208284031215611a7657600080fd5b81356119a281611a33565b60005b83811015611a9c578181015183820152602001611a84565b50506000910152565b60008151808452611abd816020860160208601611a81565b601f017fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe0169290920160200192915050565b6020815260006119a26020830184611aa5565b600060208284031215611b1457600080fd5b5035919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b604051601f82017fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe016810167ffffffffffffffff81118282101715611b9157611b91611b1b565b604052919050565b600067ffffffffffffffff821115611bb357611bb3611b1b565b5060051b60200190565b600082601f830112611bce57600080fd5b81356020611be3611bde83611b99565b611b4a565b82815260059290921b84018101918181019086841115611c0257600080fd5b8286015b84811015611c1d5780358352918301918301611c06565b509695505050505050565b600082601f830112611c3957600080fd5b813567ffffffffffffffff811115611c5357611c53611b1b565b611c8460207fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe0601f84011601611b4a565b818152846020838601011115611c9957600080fd5b816020850160208301376000918101602001919091529392505050565b600080600080600060a08688031215611cce57600080fd5b611cd7866119e0565b9450611ce5602087016119e0565b9350604086013567ffffffffffffffff80821115611d0257600080fd5b611d0e89838a01611bbd565b94506060880135915080821115611d2457600080fd5b611d3089838a01611bbd565b93506080880135915080821115611d4657600080fd5b50611d5388828901611c28565b9150509295509295909350565b600080600060608486031215611d7557600080fd5b611d7e846119e0565b95602085013595506040909401359392505050565b60008060408385031215611da657600080fd5b823567ffffffffffffffff80821115611dbe57600080fd5b818501915085601f830112611dd257600080fd5b81356020611de2611bde83611b99565b82815260059290921b84018101918181019089841115611e0157600080fd5b948201945b83861015611e2657611e17866119e0565b82529482019490820190611e06565b96505086013592505080821115611e3c57600080fd5b50611e4985828601611bbd565b9150509250929050565b600081518084526020808501945080840160005b83811015611e8357815187529582019590820190600101611e67565b509495945050505050565b6020815260006119a26020830184611e53565b60008060408385031215611eb457600080fd5b611ebd836119e0565b915060208301358015158114611ed257600080fd5b809150509250929050565b60008060008060808587031215611ef357600080fd5b611efc856119e0565b93506020850135925060408501359150606085013567ffffffffffffffff811115611f2657600080fd5b611f3287828801611c28565b91505092959194509250565b600080600060608486031215611f5357600080fd5b611f5c846119e0565b9250602084013567ffffffffffffffff80821115611f7957600080fd5b611f8587838801611bbd565b93506040860135915080821115611f9b57600080fd5b50611fa886828701611bbd565b9150509250925092565b60008060008060808587031215611fc857600080fd5b611fd1856119e0565b9350602085013567ffffffffffffffff80821115611fee57600080fd5b611ffa88838901611bbd565b9450604087013591508082111561201057600080fd5b61201c88838901611bbd565b9350606087013591508082111561203257600080fd5b50611f3287828801611c28565b6000806040838503121561205257600080fd5b61205b836119e0565b9150612069602084016119e0565b90509250929050565b600080600080600060a0868803121561208a57600080fd5b612093866119e0565b94506120a1602087016119e0565b93506040860135925060608601359150608086013567ffffffffffffffff8111156120cb57600080fd5b611d5388828901611c28565b600181811c908216806120eb57607f821691505b602082108103612124577f4e487b7100000000000000000000000000000000000000000000000000000000600052602260045260246000fd5b50919050565b6000815161213c818560208601611a81565b9290920192915050565b600080845481600182811c91508083168061216257607f831692505b6020808410820361219a577f4e487b710000000000000000000000000000000000000000000000000000000086526022600452602486fd5b8180156121ae57600181146121e15761220e565b7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff008616895284151585028901965061220e565b60008b81526020902060005b868110156122065781548b8201529085019083016121ed565b505084890196505b50505050505061224a612221828661212a565b7f2e6a736f6e000000000000000000000000000000000000000000000000000000815260050190565b95945050505050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b60007fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff82036122e2576122e2612282565b5060010190565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601260045260246000fd5b600082612327576123276122e9565b500490565b8181038181111561030f5761030f612282565b60008261234e5761234e6122e9565b500690565b8082018082111561030f5761030f612282565b60008161237557612375612282565b507fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff0190565b6040815260006123ae6040830185611e53565b828103602084015261224a8185611e53565b600073ffffffffffffffffffffffffffffffffffffffff808816835280871660208401525060a060408301526123f960a0830186611e53565b828103606084015261240b8186611e53565b9050828103608084015261241f8185611aa5565b98975050505050505050565b60006020828403121561243d57600080fd5b81516119a281611a33565b600073ffffffffffffffffffffffffffffffffffffffff808816835280871660208401525084604083015283606083015260a0608083015261248d60a0830184611aa5565b97965050505050505056fea26469706673582212209992d57fa7e6a04d441e375a37dce023b895a308ca4dd10d417b5e6bd79c2d9b64736f6c63430008120033";
const isSuperArgs = (xs) => xs.length > 1;
export class ERC1155MintBurnMock__factory extends ContractFactory {
    constructor(...args) {
        if (isSuperArgs(args)) {
            super(...args);
        }
        else {
            super(_abi, _bytecode, args[0]);
        }
    }
    deploy(_name, _baseURI, overrides) {
        return super.deploy(_name, _baseURI, overrides || {});
    }
    getDeployTransaction(_name, _baseURI, overrides) {
        return super.getDeployTransaction(_name, _baseURI, overrides || {});
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
ERC1155MintBurnMock__factory.bytecode = _bytecode;
ERC1155MintBurnMock__factory.abi = _abi;
