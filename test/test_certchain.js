const _deploy_contracts = require("../migrations/2_deploy_contracts");
const truffleAssert = require('truffle-assertions');
var assert = require('assert');

var Pool = artifacts.require("../contracts/CertChain.sol");

contract('CertChain', function(accounts) {
    before(async () => {
        poolInstance = await Pool.deployed();
    });

    it('Test 1', async() => {
        const cid = "Qmahhk78zqecYeCW9h4ZSmFFnfnwmKaHhYJEVdXpjrmTNa";
    });
});