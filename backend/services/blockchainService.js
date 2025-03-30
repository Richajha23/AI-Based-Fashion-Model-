const Web3 = require('web3');
const { ethers } = require('ethers');
const IPFS = require('ipfs-http-client');
const { CeramicClient } = require('@ceramicnetwork/http-client');
const { DataModel } = require('@glazed/datamodel');
const { DIDDataStore } = require('@glazed/did-datastore');

class BlockchainService {
    constructor() {
        this.web3 = new Web3(process.env.ETHEREUM_NODE_URL);
        this.provider = new ethers.providers.JsonRpcProvider(process.env.ETHEREUM_NODE_URL);
        this.ipfs = IPFS.create({
            host: 'ipfs.infura.io',
            port: 5001,
            protocol: 'https'
        });
        this.ceramic = new CeramicClient(process.env.CERAMIC_API_URL);
        
        // Smart contract addresses
        this.contractAddresses = {
            productVerification: process.env.PRODUCT_VERIFICATION_CONTRACT,
            sustainabilityToken: process.env.SUSTAINABILITY_TOKEN_CONTRACT,
            supplyChain: process.env.SUPPLY_CHAIN_CONTRACT
        };

        // Load smart contract ABIs
        this.contractABIs = {
            productVerification: require('../contracts/ProductVerification.json'),
            sustainabilityToken: require('../contracts/SustainabilityToken.json'),
            supplyChain: require('../contracts/SupplyChain.json')
        };

        // Initialize contracts
        this.initializeContracts();
    }

    async initializeContracts() {
        try {
            // Initialize smart contracts
            this.contracts = {
                productVerification: new this.web3.eth.Contract(
                    this.contractABIs.productVerification,
                    this.contractAddresses.productVerification
                ),
                sustainabilityToken: new this.web3.eth.Contract(
                    this.contractABIs.sustainabilityToken,
                    this.contractAddresses.sustainabilityToken
                ),
                supplyChain: new this.web3.eth.Contract(
                    this.contractABIs.supplyChain,
                    this.contractAddresses.supplyChain
                )
            };
        } catch (error) {
            console.error('Error initializing smart contracts:', error);
            throw error;
        }
    }

    async verifyProduct(productId) {
        try {
            // Get product verification data from blockchain
            const verificationData = await this.contracts.productVerification.methods
                .getProductVerification(productId)
                .call();

            // Get supply chain data
            const supplyChainData = await this.contracts.supplyChain.methods
                .getProductSupplyChain(productId)
                .call();

            // Verify sustainability certificates
            const certificatesValid = await this.verifySustainabilityCertificates(productId);

            return {
                verified: verificationData.isVerified,
                sustainabilityScore: verificationData.sustainabilityScore,
                supplyChainVerified: supplyChainData.isComplete,
                certificatesValid: certificatesValid,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            console.error('Error verifying product:', error);
            throw error;
        }
    }

    async verifySustainabilityCertificates(productId) {
        try {
            const certificates = await this.contracts.productVerification.methods
                .getProductCertificates(productId)
                .call();

            // Verify each certificate's validity
            const validations = await Promise.all(
                certificates.map(cert => this.verifyCertificate(cert))
            );

            return validations.every(v => v === true);
        } catch (error) {
            console.error('Error verifying sustainability certificates:', error);
            return false;
        }
    }

    async verifyCertificate(certificate) {
        // Implementation for certificate verification
        return true;
    }

    async storeProductData(productData) {
        try {
            // Store product data on IPFS
            const ipfsResult = await this.ipfs.add(JSON.stringify(productData));
            
            // Store IPFS hash on blockchain
            const transaction = await this.contracts.productVerification.methods
                .addProduct(productData.id, ipfsResult.path)
                .send({
                    from: process.env.ETHEREUM_ACCOUNT,
                    gas: 3000000
                });

            // Store structured data on Ceramic
            const dataModel = new DataModel({
                ceramic: this.ceramic,
                model: productData
            });
            const dataStore = new DIDDataStore({ ceramic: this.ceramic, model: dataModel });
            await dataStore.set('product', productData);

            return {
                success: true,
                ipfsHash: ipfsResult.path,
                transactionHash: transaction.transactionHash,
                ceramicStreamId: dataStore.id
            };
        } catch (error) {
            console.error('Error storing product data:', error);
            throw error;
        }
    }

    async mintSustainabilityNFT(productId, sustainabilityData) {
        try {
            // Create metadata for NFT
            const metadata = {
                productId,
                sustainabilityScore: sustainabilityData.score,
                certificates: sustainabilityData.certificates,
                timestamp: new Date().toISOString()
            };

            // Store metadata on IPFS
            const ipfsResult = await this.ipfs.add(JSON.stringify(metadata));

            // Mint NFT
            const transaction = await this.contracts.sustainabilityToken.methods
                .mintToken(productId, ipfsResult.path)
                .send({
                    from: process.env.ETHEREUM_ACCOUNT,
                    gas: 3000000
                });

            return {
                success: true,
                tokenId: transaction.events.Transfer.returnValues.tokenId,
                ipfsHash: ipfsResult.path,
                transactionHash: transaction.transactionHash
            };
        } catch (error) {
            console.error('Error minting sustainability NFT:', error);
            throw error;
        }
    }

    async updateSupplyChain(productId, stage, data) {
        try {
            // Store stage data on IPFS
            const ipfsResult = await this.ipfs.add(JSON.stringify(data));

            // Update supply chain on blockchain
            const transaction = await this.contracts.supplyChain.methods
                .updateProductStage(productId, stage, ipfsResult.path)
                .send({
                    from: process.env.ETHEREUM_ACCOUNT,
                    gas: 3000000
                });

            return {
                success: true,
                stage,
                ipfsHash: ipfsResult.path,
                transactionHash: transaction.transactionHash
            };
        } catch (error) {
            console.error('Error updating supply chain:', error);
            throw error;
        }
    }

    async getSustainabilityHistory(productId) {
        try {
            // Get all sustainability-related events for the product
            const events = await this.contracts.productVerification.getPastEvents('allEvents', {
                filter: { productId },
                fromBlock: 0,
                toBlock: 'latest'
            });

            // Process and return the events
            return events.map(event => ({
                eventType: event.event,
                data: event.returnValues,
                timestamp: new Date(event.timestamp * 1000).toISOString(),
                transactionHash: event.transactionHash
            }));
        } catch (error) {
            console.error('Error getting sustainability history:', error);
            throw error;
        }
    }
}

module.exports = new BlockchainService(); 