import { ethers } from "ethers";
import sdk from "./1-initialize-sdk.js";
import { votingAddress, comedyTokenAddress } from '../src/utils/contractAddresses.js';
import dontev from 'dotenv';
dontev.config();

// This is the governance contract.
const voteModule = sdk.getVoteModule(votingAddress);

// This is the ERC-20 contract.
const tokenModule = sdk.getTokenModule(comedyTokenAddress);

(async () => {
  try {
    // Give the treasury the power to mint additional token if needed.
    await tokenModule.grantRole('minter', voteModule.address);

    console.log(
      'Successfully gave vote module permissions to act on token module'
    );
  }
  catch (err) {
    console.error('failed to rant vote module permissions on token module', err);
    process.exit(1);
  }

  try {
    // Grab the owner wallet token balance, which holds the entire supply
    const ownedTokenBalance = await tokenModule.balanceOf(
      process.env.WALLET_ADDRESS
    );

    // Grab 90% of the supply that the owner wallet holds.
    const ownedAmount = ethers.BigNumber.from(ownedTokenBalance.value);
    const percent90 = ownedAmount.div(100).mul(90);

    // Transfer 90% of the supply to our voting contract.
    await tokenModule.transfer(
      voteModule.address,
      percent90
    );
    
    console.log("✅ Successfully transferred tokens to vote module");
  }
  catch (err) {
    console.error("failed to transfer tokens to vote module", err);
  }
})()