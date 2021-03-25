pragma solidity ^0.5.0;

import {DappToken} from "./DappToken.sol";
import {DaiToken} from "./DaiToken.sol";

contract TokenFarm {
    //All the code goes here...
    address public owner;
    string public name = "Dapp Token Farm";
    DappToken public dappToken;
    DaiToken public daiToken;

    address[] public stakers;
    mapping(address => uint256) public stakingBalance;
    mapping(address => bool) public hasStaked;
    mapping(address => bool) public isStaking;

    constructor(DappToken _dappToken, DaiToken _daiToken) public {
        dappToken = _dappToken;
        daiToken = _daiToken;
        owner = msg.sender;
    }

    //1. Stake tokens (Deposit)

    function stakeTokens(uint256 _amount) public {
        //require an amount > 0
        require(_amount > 0, "amount cannot be 0");

        //Transfer mock dai tokens to this contract for staking
        daiToken.transferFrom(msg.sender, address(this), _amount);

        //update staking balance
        stakingBalance[msg.sender] = stakingBalance[msg.sender] + _amount;

        //Add user to stakers array on;y if they haven't staked previously

        if (!hasStaked[msg.sender]) {
            stakers.push(msg.sender);
        }

        //Update staking status
        isStaking[msg.sender] = true;
        hasStaked[msg.sender] = true;
    }

    //3. Issuing tokens (get interest)

    function issueTokens() public {
        //only the oner can issue tokens
        require(msg.sender == owner, "caller must be the owner");
        //issue tokens to all stakers
        for (uint256 i = 0; i < stakers.length; i++) {
            address recipient = stakers[i];
            uint256 balance = stakingBalance[recipient];
            if (balance > 0) {
                dappToken.transfer(recipient, balance);
            }
        }
    }

    //3. Unstaking tokens (Withdraw)

    function unstakeTokens() public {
        uint256 balance = stakingBalance[msg.sender];
        require(balance > 0, "staking balance cannot be 0");

        //Transfer Dai Tokens to this contract for staking

        daiToken.transfer(msg.sender, balance);

        //reset the staking balance
        stakingBalance[msg.sender] = 0;
        //Update staking status
        isStaking[msg.sender] = false;
    }
}
