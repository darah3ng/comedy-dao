import { ethers } from "ethers";
import sdk from "./1-initialize-sdk.js";

// This is the address to our ERC-1155 membership NFT contract.
const bundleDropModule = sdk.getBundleDropModule(
  "0x4BbB42D171858Ea5025A18CC22ac65759384C42A",
);

// This is the address to our ERC-20 token contract.
const tokenModule = sdk.getTokenModule(
  "0x6FC5C8A826B216DF26CB90E0dA9E3cf2cF988E8E",
);

(async () => {
  try {
    // Grab all the addresses of people who own our membership NFT, which has 
    // a tokenId of 0.
    const walletAddresses = await bundleDropModule.getAllClaimerAddresses('0');

    if (walletAddresses.length === 0) {
      console.log('No NFTs have been claimed yet, maybe get some friends to claim your free NFTs!');
      process.exit(0);
    }

    // Loop through the array of address.
    const airDropTargets = walletAddresses.map(address => {
      // Pick a random # between 1000 and 10000.
      const randomAmount = Math.floor(Math.random() * (10000 - 1000 + 1) + 1000);
      console.log("✅ Going to airdrop", randomAmount, "tokens to", address);

      // Set up the target wallet.
      const airdropTarget = {
        address,
        amount: ethers.utils.parseUnits(randomAmount.toString(), 18),
      };

      return airdropTarget;
    });

    console.log('airDropTargets', airDropTargets);

    // Call transferBatch on all our airdrop targets.
    console.log("🌈 Starting airdrop...");
    await tokenModule.transferBatch(airDropTargets);
    console.log("✅ Successfully airdropped tokens to all the holders of the NFT!");

  } catch (err) {
    console.error("Failed to airdrop tokens", err);
  }
})();