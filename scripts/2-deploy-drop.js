import { ethers } from "ethers";
import sdk from "./1-initialize-sdk.js";
import { readFileSync } from "fs";

// To get your app address, you need to run `node scripts/1-initialize-sdk.js`
const APP_ADDRESS = '0xDfA44975d93CCb7AE85153F80C98e59C56df02eB';
const app = sdk.getAppModule(APP_ADDRESS);

(async () => {
  try {
    // Create an ERC-1155 collection
    // Unlike ERC-721 where every NFT is unique, ERC-1155 allows multiple people to be the holder of the same NFT
    // Why do we need ERC-155 in this case?
    // We're building a "membership NFT", so everyone gets a hold of one instead of creating a unique NFT everytime to access the DAO.
    // Also it's more gas efficient
    const bundleDropModule = await app.deployBundleDropModule({
      // The collection's name, ex. CryptoKitties, CryptoPunks, etc
      name: 'ComedyDAO membership',

      // A description for the collection
      description: 'A DAO for fans of Comedy',

      // The image for the collection that will show up on OpenSea
      image: readFileSync('scripts/assets/comedydao.png'),

      // We need to pass in the address of the person who will be receiving the proceeds from sales of the NFTs
      // We're planning on not charging people for the drop, so we'll pass in the 0x0 address
      // You can set this to your own wallet if you want to charge for the drop
      primarySaleRecipientAddress: ethers.constants.AddressZero,
    });

    console.log(
      "✅ Successfully deployed bundleDrop module, address:",
      bundleDropModule.address,
    );

    console.log(
      "✅ bundleDrop metadata:",
      await bundleDropModule.getMetadata(),
    );
  }
  catch (error) {
    console.log('failed to deploy bundleDrop module', error);
  }
})()
