// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SustainabilityVerification {
    struct Verification {
        string productId;
        string hash;
        string materials;
        string labor;
        string carbonFootprint;
        uint256 timestamp;
        address verifier;
    }

    mapping(string => Verification[]) private verifications;
    mapping(string => bool) private verifiedProducts;
    address private owner;

    event VerificationStored(
        string productId,
        string hash,
        string materials,
        string labor,
        string carbonFootprint,
        uint256 timestamp
    );

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    function storeVerification(
        string memory _productId,
        string memory _hash,
        string memory _materials,
        string memory _labor,
        string memory _carbonFootprint
    ) public onlyOwner {
        Verification memory newVerification = Verification({
            productId: _productId,
            hash: _hash,
            materials: _materials,
            labor: _labor,
            carbonFootprint: _carbonFootprint,
            timestamp: block.timestamp,
            verifier: msg.sender
        });

        verifications[_productId].push(newVerification);
        verifiedProducts[_productId] = true;

        emit VerificationStored(
            _productId,
            _hash,
            _materials,
            _labor,
            _carbonFootprint,
            block.timestamp
        );
    }

    function getVerifications(string memory _productId)
        public
        view
        returns (Verification[] memory)
    {
        return verifications[_productId];
    }

    function isVerified(string memory _productId) public view returns (bool) {
        return verifiedProducts[_productId];
    }

    function getLatestVerification(string memory _productId)
        public
        view
        returns (Verification memory)
    {
        require(verifications[_productId].length > 0, "No verifications found");
        return verifications[_productId][verifications[_productId].length - 1];
    }
} 