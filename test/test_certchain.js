const _deploy_contracts = require("../migrations/2_deploy_contracts");
const truffleAssert = require('truffle-assertions');
var assert = require('assert');
const utils = require('../src/utils');

var CertChain = artifacts.require("../contracts/CertChain.sol");
var CertNFT = artifacts.require("../contracts/CertNFT.sol");

contract('CertChain', function(accounts) {
    before(async () => {
        certChainInstance = await CertChain.deployed();
        certNFTInstance = await CertNFT.deployed();
    });

    it('Add Minter', async() => {
        let addMinter = await certNFTInstance.addMinter(certChainInstance.address);
        truffleAssert.eventEmitted(addMinter, "AddedMinter");
    });

    it('Add Institution', async() => {
        let institution = accounts[1];

        let addInstitution = await certChainInstance.addInstitution(institution);
        truffleAssert.eventEmitted(addInstitution, "AddedInstitution");
    });

    it('Fail to Create Cert (non-institution)', async() => {
        let buf = utils.keccak256Packed(["string", "string"], ["John Doe", "1999-9-9"]);
        let certholder = buf.toString();
        let cid = "Qmahhk78zqecYeCW9h4ZSmFFnfnwmKaHhYJEVdXpjrmTNa"; // cert pdf file cid on IPFS
        await truffleAssert.fails(
            certChainInstance.createCert(certholder, cid, { from: accounts[2] }),
            truffleAssert.ErrorType.REVERT,
        );    
    });

    it('Create Cert', async() => {
        let buf = utils.keccak256Packed(["string", "string"], ["John Doe", "1999-9-9"]);
        let certholder = buf.toString();
        let cid = "Qmahhk78zqecYeCW9h4ZSmFFnfnwmKaHhYJEVdXpjrmTNa"; // cert pdf file cid on IPFS
        let createCert = await certChainInstance.createCert(certholder, cid, { from: accounts[1] });
        truffleAssert.eventEmitted(createCert, "CreateCert");
    });

    it('Retrieve Cert URI (IPFS cid)', async() => {
        let cid = await certNFTInstance.tokenURI(1);
        assert.strictEqual(cid,"Qmahhk78zqecYeCW9h4ZSmFFnfnwmKaHhYJEVdXpjrmTNa", "Incorrect Cert URI returned");
    });

    it('Validate Cert (incorrect details)', async() => {
        let buf = utils.keccak256Packed(["string", "string"], ["Not John Doe", "1999-9-9"]);
        let invalidCertholder = buf.toString();
        let validationStatus = await certChainInstance.validateCert(invalidCertholder, 1);
        assert.strictEqual(validationStatus, false, "Cert not validated correctly");
    });

    it('Validate Cert (correct details)', async() => {
        let buf = utils.keccak256Packed(["string", "string"], ["John Doe", "1999-9-9"]);
        let validCertholder = buf.toString();
        let validationStatus = await certChainInstance.validateCert(validCertholder, 1);

        assert.strictEqual(validationStatus, true, "Cert not validated correctly");
    });

    it('Retrieve Cert List', async() => {
        let buf = utils.keccak256Packed(["string", "string"], ["John Doe", "1999-9-9"]);
        let validCertholder = buf.toString();

        let cid2 = "Qmahhk78zqecYeCW9h4ZSmFFnfnwmKaHhYJEVdXpjrmTNa"; // cert pdf file cid on IPFS
        let createCert = await certChainInstance.createCert(validCertholder, cid2, { from: accounts[1] });

        let certList = await certChainInstance.getListOfCertsId(validCertholder);
        assert.strictEqual(certList[0].toNumber(), 1, "Cert list not retrieved correctly");
        assert.strictEqual(certList[1].toNumber(), 2, "Cert list not retrieved correctly");
    });

    it('Deactivate Cert (not owner)', async() => {
        await truffleAssert.reverts(certChainInstance.deactivateCert(1, { from: accounts[2] }), "Only owner can deactivate certificate")
    });

    it('Deactivate Cert (owner)', async() => {
        let deactivateCert = await certChainInstance.deactivateCert(1, { from: accounts[1] });
        truffleAssert.eventEmitted(deactivateCert, "DeactivateCert")
    });

    it('Validate Cert (deactivated cert)', async() => {
        let buf = utils.keccak256Packed(["string", "string"], ["John Doe", "1999-9-9"]);
        let validCertholder = buf.toString();
        let validationStatus = await certChainInstance.validateCert(validCertholder, 1);
        assert.strictEqual(validationStatus, false, "Cert not validated correctly");
    });
});