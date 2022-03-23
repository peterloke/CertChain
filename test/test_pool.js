const _deploy_contracts = require("../migrations/2_deploy_contracts");
const truffleAssert = require('truffle-assertions');
var assert = require('assert');


var ERC20 = artifacts.require("../contracts/ERC20.sol");
var Pool = artifacts.require("../contracts/Pool.sol");

contract('Pool', function(accounts) {
    before(async () => {
        erc20instance = await ERC20.deployed();
        poolInstance = await Pool.deployed();
    });

    it('Test Get PTs', async() => {
        let getPT = await poolInstance.getPT({from:accounts[1], value: 1E18});
        truffleAssert.eventEmitted(getPT, "GetPT");
        let checkPT = await poolInstance.getTokenBalance.call(accounts[1]);
        assert.strictEqual(checkPT.toNumber(), 100, "PT not deployed correctly");
        
        let getPT2 = await poolInstance.getPT({from:accounts[2], value: 1E18});
        truffleAssert.eventEmitted(getPT2, "GetPT");
        let checkPT2 = await poolInstance.getTokenBalance.call(accounts[2]);
        assert.strictEqual(checkPT2.toNumber(), 100, "PT not deployed correctly");

    });

    it('Test Send Tokens', async() => {
        let sendToken = await poolInstance.sendTokens(50, {from:accounts[1]});
        truffleAssert.eventEmitted(sendToken, "TokenSent");

        let sendToken2 = await poolInstance.sendTokens(40, {from:accounts[2]});
        truffleAssert.eventEmitted(sendToken2, "TokenSent");

        let tpool = await poolInstance.getTotalPool.call();
        assert.strictEqual(tpool.toNumber(), 90, "TotalPool doesn't align");
    });

    it('Check Voter List length', async () => {
        let vlistlen = await poolInstance.getVoterListLength.call();
        assert.strictEqual(vlistlen.toNumber(), 2);
    });


    it('Test Voting', async() => {
        let vote_acct2 = await poolInstance.vote(accounts[2], {from: accounts[1]});
        truffleAssert.eventEmitted(vote_acct2, "Voted");

        let checkVote = await poolInstance.getVote.call(accounts[1]);
        assert.strictEqual(checkVote, accounts[2], "vote not working");

    });

    it('Test that voters cannot vote twice', async() => {
        await truffleAssert.reverts(poolInstance.vote(accounts[2], {from: accounts[1]}), "Can't vote twice!");
    })

    it('Check candidateVotes', async() => {
        let vres = await poolInstance.getcandidateVotes.call(accounts[2]);
        assert.strictEqual(vres.toNumber(), 50, "candidateVotes not working");
    })

    it('Ensure non-chairs cannot end vote', async() => {
        await truffleAssert.reverts(poolInstance.endVoting({from:accounts[1]}), "Only chairperson can end voting")
    })

    it('Test VoteWon', async() => {
        //Please work on this test
        let maxvotes = await poolInstance.endVoting({from:accounts[0]});
        truffleAssert.eventEmitted(maxvotes, "VoteWon");
        let tpool = await poolInstance.getTotalPool.call();
        //let winnerAmt = await poolInstance.getTokenBalance.call(accounts[2]);
        assert.strictEqual(tpool, 100+tpool, "VoteWon not working")
    });


    it('Test VoteDrawn', async() => {
        //Please work on this test
        let getPT3 = await poolInstance.getPT({from:accounts[3], value: 1E18});
        let getPT4 = await poolInstance.getPT({from:accounts[4], value: 1E18});
        let getPT5 = await poolInstance.getPT({from:accounts[5], value: 1E18});

        let sendToken3 = await poolInstance.sendTokens(100, {from:accounts[3]});
        let sendToken4 = await poolInstance.sendTokens(100, {from:accounts[4]});
        let sendToken5 = await poolInstance.sendTokens(100, {from:accounts[5]});

        let vote_acct4 = await poolInstance.vote(accounts[4], {from: accounts[3]}); // 3 votes for 4
        let vote_acct5 = await poolInstance.vote(accounts[5], {from: accounts[4]}); // 4 votes for 5
        let vote_acct3 = await poolInstance.vote(accounts[3], {from: accounts[5]}); // 5 votes for 6

        let maxvotes = await poolInstance.endVoting({from:accounts[0]});
        truffleAssert.eventEmitted(maxvotes, "VoteDrawn");

        let amt_acct3 = await poolInstance.getTokenBalance.call(accounts[3]);
        let amt_acct4 = await poolInstance.getTokenBalance.call(accounts[4]);
        let amt_acct5 = await poolInstance.getTokenBalance.call(accounts[5]);

        assert.strictEqual(amt_acct3, 100, "VoteDrawn not working")
        assert.strictEqual(amt_acct4, 100, "VoteDrawn not working")
        assert.strictEqual(amt_acct5, 100, "VoteDrawn not working")
    })

    
});