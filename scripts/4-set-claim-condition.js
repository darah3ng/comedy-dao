import sdk from './1-initialize-sdk.js';

const DROP_MODULE_ADDRESS = '0x4BbB42D171858Ea5025A18CC22ac65759384C42A';
const bundleDrop = sdk.getBundleDropModule(
  DROP_MODULE_ADDRESS,
);

(async () => {
  try {
    const claimConditionFactory = bundleDrop.getClaimConditionFactory();

    // Specify conditions
    // `startTime` is the time when the users are allowed to start miniting NFTs, in this case, we set it to the date/time of the current time (meaning it can start minting immediately)
    // `maxQuantity` is the max # of membership NFTs can be minted.
    // `maxQuantityPerTransaction` specifies how many token someone can claim in a single transaction, in this case, we're setting it to minting one at a time.
    claimConditionFactory.newClaimPhase({
      startTime: new Date(),
      maxQuantity: 50_000,
      maxQuantityPerTransaction: 1
    });

    // Setting the specified conditions to the membership NFT
    // We pass '0' because the membership NFT has a tokenId of 0 since it's the first token in this ERC-1155 contract.
    await bundleDrop.setClaimCondition(0, claimConditionFactory);
    console.log("✅ Successfully set claim condition on bundle drop:", bundleDrop.address);
  }
  catch (err) {
    console.error('Failed to set claim condition', err)
  }
})()