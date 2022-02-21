import sdk from './1-initialize-sdk.js';

const tokenAddress = '0x6FC5C8A826B216DF26CB90E0dA9E3cf2cF988E8E';
const appModule = sdk.getAppModule('0xDfA44975d93CCb7AE85153F80C98e59C56df02eB');

// Deploy a governance contract.
(async () => {
  try {
    const voteModule = await appModule.deployVoteModule({
      // Give your governance contract a name.
      name: "ComedyDAO's Epic Proposals",

      // This is the location of our goverance token, the COMEDY token contract.
      // We set this so only users with COMEDY can vote.
      votingTokenAddress: tokenAddress,

      // After a proposal is created, when can members start voting?
      // For now, we set this to immediately.
      proposalStartWaitTimeInSeconds: 0,

      // Specifies how long someone has to vote once a proposal goes lives.
      // Here, we set it to 24 hours (86400 seconds)
      proposalVotingTimeInSeconds: 24 * 60 * 60,

      // In order for a proposal to pass, a minimum x % of token must be used in the vote.
      // We set this to 0, which means the proposal will pass regardless of what % of token was used on the vote.
      votingQuorumFraction: 0,

      // What's the minimum # of tokens a user needs to be allowed to create a proposal?
      // I set it to 0. Meaning no tokens are required for a user to be allowed to
      // create a proposal.
      minimumNumberOfTokensNeededToPropose: '0',
    });

    console.log(
      "✅ Successfully deployed vote module, address:",
      voteModule.address,
    );
  }
  catch (err) {
    console.error('Failed to deploy vote module', err);
  }
})()
