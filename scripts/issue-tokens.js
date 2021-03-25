const TokenFarm = artifacts.require("TokenFarm");

module.exports = async function(deployer, network, accounts) {
    let tokenFarm = await TokenFarm.deployed()
    await tokenFarm.issueTokens()

    console.log("Tokens issued...")
   
    callback()
};
