/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { utils, Contract, ContractFactory } from "ethers";
const _abi = [
    {
        inputs: [],
        name: "globalRoyaltyInfo",
        outputs: [
            {
                internalType: "address",
                name: "receiver",
                type: "address",
            },
            {
                internalType: "uint256",
                name: "feeBasisPoints",
                type: "uint256",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "uint256",
                name: "",
                type: "uint256",
            },
            {
                internalType: "uint256",
                name: "_saleCost",
                type: "uint256",
            },
        ],
        name: "royaltyInfo",
        outputs: [
            {
                internalType: "address",
                name: "receiver",
                type: "address",
            },
            {
                internalType: "uint256",
                name: "royaltyAmount",
                type: "uint256",
            },
        ],
        stateMutability: "view",
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
const _bytecode = "0x608060405234801561001057600080fd5b50610389806100206000396000f3fe608060405234801561001057600080fd5b50600436106100415760003560e01c806301ffc9a7146100465780632a55205a14610099578063c9823cc6146100ec575b600080fd5b6100856004803603602081101561005c57600080fd5b50357fffffffff00000000000000000000000000000000000000000000000000000000166100f4565b604080519115158252519081900360200190f35b6100bc600480360360408110156100af57600080fd5b5080359060200135610159565b6040805173ffffffffffffffffffffffffffffffffffffffff909316835260208301919091528051918290030190f35b6100bc6101ba565b60007fffffffff0000000000000000000000000000000000000000000000000000000082167f2a55205a00000000000000000000000000000000000000000000000000000000141561014857506001610154565b610151826101dc565b90505b919050565b60008061016461033c565b506040805180820190915260005473ffffffffffffffffffffffffffffffffffffffff16808252600154602083018190526101ae906103e8906101a8908890610226565b906102b8565b92509250509250929050565b60005460015473ffffffffffffffffffffffffffffffffffffffff9091169082565b7fffffffff0000000000000000000000000000000000000000000000000000000081167f01ffc9a70000000000000000000000000000000000000000000000000000000014919050565b600082610235575060006102b2565b8282028284828161024257fe5b04146102af57604080517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152601660248201527f536166654d617468236d756c3a204f564552464c4f5700000000000000000000604482015290519081900360640190fd5b90505b92915050565b600080821161032857604080517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152601e60248201527f536166654d617468236469763a204449564953494f4e5f42595f5a45524f0000604482015290519081900360640190fd5b600082848161033357fe5b04949350505050565b60408051808201909152600080825260208201529056fea2646970667358221220500d0606933313f45141c424c5b303e333204707c19b03c34b061c17f69006f964736f6c63430007040033";
const isSuperArgs = (xs) => xs.length > 1;
export class ERC2981Global__factory extends ContractFactory {
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
ERC2981Global__factory.bytecode = _bytecode;
ERC2981Global__factory.abi = _abi;
