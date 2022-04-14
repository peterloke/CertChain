const _deploy_contracts = require("../migrations/2_deploy_contracts");
const truffleAssert = require('truffle-assertions');
var assert = require('assert');
const { keccak256 } = require("ethers/lib/utils");

var CertChain = artifacts.require("../contracts/CertChain.sol");
var CertNFT = artifacts.require("../contracts/CertNFT.sol");

contract('CertChain', function(accounts) {
    before(async () => {
        certChainInstance = await CertChain.deployed();
        certNFTInstance = await CertNFT.deployed();
    });

    it('Add Institution', async() => {
        let institution = accounts[1];

        certChainInstance.addInstitution(institution);
        truffleAssert.eventEmitted(AddedInstitution, "AddedInstitution");

        certNFTInstance.addMinter(institution);
        truffleAssert.eventEmitted(AddedMinter, "AddedMinter");
    });

    it('Create Cert', async() => {
        let certholder = keccak256("John Doe, 1999-9-9");
        let cid = "Qmahhk78zqecYeCW9h4ZSmFFnfnwmKaHhYJEVdXpjrmTNa"; // cert pdf file cid on IPFS
        let tokenId = certChainInstance.createCert(certholder, cid, { from: accounts[1] });
        truffleAssert.eventEmitted(CreateCert, "CreateCert");
    });

    it('Validate Cert (incorrect details)', async() => {
        let invalidCertholder = keccak256("Not John Doe, 1999-9-9");
        let validationStatus = certChainInstance.validateCert(invalidCertholder, tokenId);

        assert.strictEqual(validationStatus, false, "Cert not validated correctly");
    });

    it('Validate Cert (correct details)', async() => {
        let validCertholder = keccak256("John Doe, 1999-9-9");
        let validationStatus = certChainInstance.validateCert(validCertholder, tokenId);

        assert.strictEqual(validationStatus, true, "Cert not validated correctly");
    });

    it('Retrieve Cert List', async() => {
        let certList = certChainInstance.getListOfCertsId(validCertholder);
        assert.strictEqual(certList, [tokenId], "Cert list not retrieved correctly");
    });

    it('Deactivate Cert (not owner)', async() => {
        await truffleAssert.reverts(certChainInstance.deactivateCert(tokenId, { from: accounts[2] }), "Only owner can deactivate certificate")
    });

    it('Deactivate Cert (owner)', async() => {
        certChainInstance.deactivateCert(tokenId, { from: accounts[1] });
        truffleAssert.eventEmitted(DeactivateCert, "DeactivateCert")
    });

    it('Validate Cert (deactivated cert)', async() => {
        let validationStatus = certChainInstance.validateCert(validCertholder, tokenId);

        assert.strictEqual(validationStatus, false, "Cert not validated correctly");
    });
});