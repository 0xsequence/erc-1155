"use strict";
/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
exports.ERC1155Metadata__factory = void 0;
var ethers_1 = require("ethers");
var ERC1155Metadata__factory = /** @class */ (function (_super) {
    __extends(ERC1155Metadata__factory, _super);
    function ERC1155Metadata__factory(signer) {
        return _super.call(this, _abi, _bytecode, signer) || this;
    }
    ERC1155Metadata__factory.prototype.deploy = function (_name, _baseURI, overrides) {
        return _super.prototype.deploy.call(this, _name, _baseURI, overrides || {});
    };
    ERC1155Metadata__factory.prototype.getDeployTransaction = function (_name, _baseURI, overrides) {
        return _super.prototype.getDeployTransaction.call(this, _name, _baseURI, overrides || {});
    };
    ERC1155Metadata__factory.prototype.attach = function (address) {
        return _super.prototype.attach.call(this, address);
    };
    ERC1155Metadata__factory.prototype.connect = function (signer) {
        return _super.prototype.connect.call(this, signer);
    };
    ERC1155Metadata__factory.connect = function (address, signerOrProvider) {
        return new ethers_1.Contract(address, _abi, signerOrProvider);
    };
    return ERC1155Metadata__factory;
}(ethers_1.ContractFactory));
exports.ERC1155Metadata__factory = ERC1155Metadata__factory;
var _abi = [
    {
        inputs: [
            {
                internalType: "string",
                name: "_name",
                type: "string"
            },
            {
                internalType: "string",
                name: "_baseURI",
                type: "string"
            },
        ],
        stateMutability: "nonpayable",
        type: "constructor"
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: "string",
                name: "_uri",
                type: "string"
            },
            {
                indexed: true,
                internalType: "uint256",
                name: "_id",
                type: "uint256"
            },
        ],
        name: "URI",
        type: "event"
    },
    {
        inputs: [],
        name: "baseURI",
        outputs: [
            {
                internalType: "string",
                name: "",
                type: "string"
            },
        ],
        stateMutability: "view",
        type: "function"
    },
    {
        inputs: [],
        name: "name",
        outputs: [
            {
                internalType: "string",
                name: "",
                type: "string"
            },
        ],
        stateMutability: "view",
        type: "function"
    },
    {
        inputs: [
            {
                internalType: "bytes4",
                name: "_interfaceID",
                type: "bytes4"
            },
        ],
        name: "supportsInterface",
        outputs: [
            {
                internalType: "bool",
                name: "",
                type: "bool"
            },
        ],
        stateMutability: "pure",
        type: "function"
    },
    {
        inputs: [
            {
                internalType: "uint256",
                name: "_id",
                type: "uint256"
            },
        ],
        name: "uri",
        outputs: [
            {
                internalType: "string",
                name: "",
                type: "string"
            },
        ],
        stateMutability: "view",
        type: "function"
    },
];
var _bytecode = "0x608060405234801561001057600080fd5b5060405161083c38038061083c8339818101604052604081101561003357600080fd5b810190808051604051939291908464010000000082111561005357600080fd5b90830190602082018581111561006857600080fd5b825164010000000081118282018810171561008257600080fd5b82525081516020918201929091019080838360005b838110156100af578181015183820152602001610097565b50505050905090810190601f1680156100dc5780820380516001836020036101000a031916815260200191505b50604052602001805160405193929190846401000000008211156100ff57600080fd5b90830190602082018581111561011457600080fd5b825164010000000081118282018810171561012e57600080fd5b82525081516020918201929091019080838360005b8381101561015b578181015183820152602001610143565b50505050905090810190601f1680156101885780820380516001836020036101000a031916815260200191505b50604052505082516101a2915060019060208501906101be565b5080516101b69060009060208401906101be565b50505061025f565b828054600181600116156101000203166002900490600052602060002090601f0160209004810192826101f4576000855561023a565b82601f1061020d57805160ff191683800117855561023a565b8280016001018555821561023a579182015b8281111561023a57825182559160200191906001019061021f565b5061024692915061024a565b5090565b5b80821115610246576000815560010161024b565b6105ce8061026e6000396000f3fe608060405234801561001057600080fd5b506004361061004c5760003560e01c806301ffc9a71461005157806306fdde03146100a45780630e89341c146101215780636c0360eb1461013e575b600080fd5b6100906004803603602081101561006757600080fd5b50357fffffffff0000000000000000000000000000000000000000000000000000000016610146565b604080519115158252519081900360200190f35b6100ac6101ab565b6040805160208082528351818301528351919283929083019185019080838360005b838110156100e65781810151838201526020016100ce565b50505050905090810190601f1680156101135780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b6100ac6004803603602081101561013757600080fd5b5035610256565b6100ac6103a9565b60007fffffffff0000000000000000000000000000000000000000000000000000000082167f0e89341c00000000000000000000000000000000000000000000000000000000141561019a575060016101a6565b6101a382610422565b90505b919050565b60018054604080516020600284861615610100027fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff0190941693909304601f8101849004840282018401909252818152929183018282801561024e5780601f106102235761010080835404028352916020019161024e565b820191906000526020600020905b81548152906001019060200180831161023157829003601f168201915b505050505081565b606060006102638361046c565b60405160200180838054600181600116156101000203166002900480156102c15780601f1061029f5761010080835404028352918201916102c1565b820191906000526020600020905b8154815290600101906020018083116102ad575b5050825160208401908083835b6020831061030b57805182527fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe090920191602091820191016102ce565b5181516020939093036101000a7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff01801990911692169190911790527f2e6a736f6e000000000000000000000000000000000000000000000000000000920191825250604080518083037fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe50181526005909201905295945050505050565b6000805460408051602060026001851615610100027fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff0190941693909304601f8101849004840282018401909252818152929183018282801561024e5780601f106102235761010080835404028352916020019161024e565b7fffffffff0000000000000000000000000000000000000000000000000000000081167f01ffc9a70000000000000000000000000000000000000000000000000000000014919050565b6060816104ad575060408051808201909152600181527f300000000000000000000000000000000000000000000000000000000000000060208201526101a6565b818060005b82156104c657600101600a830492506104b2565b60608167ffffffffffffffff811180156104df57600080fd5b506040519080825280601f01601f19166020018201604052801561050a576020820181803683370190505b5090507fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff82015b831561058e57600a840660300160f81b8282806001900393508151811061055457fe5b60200101907effffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916908160001a905350600a84049350610531565b509594505050505056fea26469706673582212205abd37bd16639ca9fbf0ea9aa3edb56d4a300602416ce7dfcab6972d32fec15664736f6c63430007040033";
