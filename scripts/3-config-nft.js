import sdk from "./1-initialize-sdk.js";
import { readFileSync } from "fs";

// Access the bundleDrop module, which is the ERC-1155 contract that was initlialised in '2-deploy-drop.js'
const DROP_MODULE_ADDRESS = '0x4BbB42D171858Ea5025A18CC22ac65759384C42A';
const bundleDrop = sdk.getBundleDropModule(
  DROP_MODULE_ADDRESS,
);

(async () => {
  try {
    // Deploying metadata associated with the membership NFT
    await bundleDrop.createBatch([
      {
        name: "Smiley member token",
        description: "This NFT will give you access to ComedyDAO!",
        image: readFileSync("scripts/assets/smile.png"),
      },
    ]);

    console.log("✅ Successfully created a new NFT in the drop!");
  }
  catch (error) {
    console.error("failed to create the new NFT", error);
  }
})()