const { assert } = require("chai")
//const { It } = require("react-bootstrap/lib/Breadcrumb")
//const { assert } = require("assert")

const DaiToken  = artifacts.require('DaiToken')
const DappToken  = artifacts.require('DappToken')
const TokenFarm  = artifacts.require('TokenFarm')

require("chai")
.use(require("chai-as-promised"))
.should()

//utility functions

const tokens = (n) => {
    return web3.utils.toWei(n, 'Ether')
}

contract("TokenFarm", ([owner, investor]) =>{

    let daiToken, dappToken, tokenFarm
    
    before(async () => {
        //Load Contracts
        daiToken = await DaiToken.new()
        dappToken = await DappToken.new()
        tokenFarm = await TokenFarm.new(dappToken.address, daiToken.address)

        //Transfer all Dapp tokens to famrm (1 million)
        await dappToken.transfer(tokenFarm.address, tokens('1000000'))

        //send tokens to investor
        await daiToken.transfer(investor, tokens('100'), {from: owner})
    })

    describe("Mock Dai Depolyment", async () => {
        it("has a name", async () => {
            const name = await daiToken.name()
            assert.equal(name, "Mock DAI Token")
        })
    })

    describe("DApp Token Depolyment", async () => {
        it("has a name", async () => {
            const name = await dappToken.name()
            assert.equal(name, "DApp Token")
        })
    })

    describe("Token Farm Depolyment", async () => {
        it("has a name", async () => {
            const name = await tokenFarm.name()
            assert.equal(name, "Dapp Token Farm")
        })
    })

    it("contract has tokens", async() => {
        let balance = await dappToken.balanceOf(tokenFarm.address)
        assert.equal(balance.toString(), tokens('1000000'))
    })

    // it("investor has Dai", async() => {
    //     let balance = await dappToken.balanceOf(tokenFarm.address)
    //     assert.equal(balance.toString(), tokens('1000000'))
    // })

    describe("Farming tokens", async () => {

        it("rewards investors for staking mDai tokens", async () => {
            let result
            //Check investor balance before staking
            result = await daiToken.balanceOf(investor)

            assert.equal(result.toString(), tokens("100"), "investor Mock DAI wallet balance should be correct before staking")

            //Stake Mock Dai Tokens
            await daiToken.approve(tokenFarm.address, tokens('100'), {from: investor})
            await tokenFarm.stakeTokens(tokens('100'), {from: investor})

            //Check staking result
            result = await daiToken.balanceOf(investor)
            assert.equal(result.toString(), tokens('0'), "investor mock Dai wallet balance correct after staking")

            result = await daiToken.balanceOf(tokenFarm.address)
            assert.equal(result.toString(), tokens('100'), "Token Farm Mock Dai balance correct after staking")

            result = await tokenFarm.stakingBalance(investor)
            assert.equal(result.toString(), tokens('100'), "Investor staking balance correct  after staking")

            result = await tokenFarm.isStaking(investor)
            assert.equal(result.toString(), 'true', "Investor staking status correct  after staking")

            //Issue tokens
            await tokenFarm.issueTokens({from: owner})

            //Check balances after issuance
            result = await dappToken.balanceOf(investor)
            assert.equal(result.toString(), tokens('100'), 'investor dapp token balance is correct after issuance')

            //Ensure the owner is the only person that can issue tokens
            await tokenFarm.issueTokens({from: investor}).should.be.rejected

            //Unstake the tokens
            await tokenFarm.unstakeTokens({from:investor})

            //Checkl results after unstaking

            result = await daiToken.balanceOf(investor)
            assert.equal(result.toString(),tokens('100'), "investor mock dai wallet balance is correct after staking")

            result = await daiToken.balanceOf(tokenFarm.address)
            assert.equal(result.toString(),tokens('0'), "iToken Farm Mock Dai balance correct after staking")

            result = await tokenFarm.stakingBalance(investor)
            assert.equal(result.toString(),tokens('0'), "investor staking balance correct after staking")


        })
    })

})

