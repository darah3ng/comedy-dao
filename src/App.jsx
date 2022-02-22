import { useEffect, useMemo, useState } from 'react';
import { Container, Heading, Button, VStack, Text, Box, HStack } from '@chakra-ui/react';
import { FormControl, FormLabel, FormHelperText } from '@chakra-ui/react';
import { Table, Thead, Tbody, Tr, Th, Td } from '@chakra-ui/react';
import { SimpleGrid } from '@chakra-ui/react';

import { useWeb3 } from '@3rdweb/hooks';
import { ThirdwebSDK } from "@3rdweb/sdk";
import { UnsupportedChainIdError } from "@web3-react/core";
import { ethers } from 'ethers';

import { shortenAddress } from './utils/shortenAddress';
import { nftMembershipAddress, votingAddress, comedyTokenAddress } from '../src/utils/contractAddresses.js';

// CSS
const headingBgGradient = 'linear(to-r, #1ab3b3, #20dfdf, #dfaf20)';
const buttonBgGradient = 'linear(to-r, #062d2d, #0d5959, #138686)';

// ERC-1155 contract
const sdk = new ThirdwebSDK('rinkeby');
const bundleDropModule = sdk.getBundleDropModule(nftMembershipAddress);

// ERC-20 contract
const tokenModule = sdk.getTokenModule(comedyTokenAddress);

// Governance/voting contract
const voteModule = sdk.getVoteModule(votingAddress);

const App = () => {
  const { connectWallet, address, error, provider } = useWeb3();
  const [hasClaimedNFT, setHasClaimedNFT] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [memberAddresses, setMemberAddresses] = useState([]);
  const [memberTokenAmounts, setMemberTokenAmounts] = useState({});

  const [proposals, setProposals] = useState([]);
  const [isVoting, setIsVoting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);

  // The signer is required to sign transactions on the blockchain
  // Without it we can only READ data, not write.
  const signer = provider ? provider.getSigner() : undefined;

  useEffect(() => {
    // The signer is passed to the sdk, which allows us to interact with the deployed contract.
    sdk.setProviderOrSigner(signer);
  }, [signer])

  useEffect(() => {
    checkIfUserHasNFT();
  }, [address])

  useEffect(() => {
    getMembers();
    getTokensFromEachMember();
  }, [hasClaimedNFT])

  useEffect(() => {
    retrieveAllProposals();
  }, [hasClaimedNFT])

  useEffect(() => {
    checkIfTheUserVoted();
  }, [hasClaimedNFT, proposals, address])

  async function retrieveAllProposals() {
    if (!hasClaimedNFT) {
      return;
    }

    // A simple call to voteModule.getAll() to grab the proposals.
    try {
      const proposals = await voteModule.getAll();
      setProposals(proposals);
      console.log("🌈 Proposals:", proposals);
    }
    catch (error) {
      console.log("failed to get proposals", error);
    }
  }

  async function checkIfTheUserVoted() {
    if (!hasClaimedNFT) {
      return;
    }
  
    // If we haven't finished retrieving the proposals from the useEffect above
    // then we can't check if the user voted yet!
    if (!proposals.length) {
      return;
    }
  
    // Check if the user has already voted on the first proposal.
    try {
      const hasVoted = await voteModule.hasVoted(proposals[0].proposalId, address);
      setHasVoted(hasVoted);

      if (hasVoted) {
        console.log("🥵 User has already voted");
      }
      else {
        console.log("🙂 User has not voted yet");
      }
    } 
    catch (error) {
      console.error("Failed to check if wallet has voted", error);
    }
  }

  async function getMembers() {
    if (!hasClaimedNFT) {
      return;
    }
    
    // Grab the users who hold our NFT with tokenId 0.
    try {
      const memberAddresses = await bundleDropModule.getAllClaimerAddresses("0");
      setMemberAddresses(memberAddresses);
      console.log("🚀 Members addresses", memberAddresses);
    }
    catch (error) {
      console.error("failed to get member list", error);
    }
  }

  async function getTokensFromEachMember() {
    if (!hasClaimedNFT) {
      return;
    }
  
    // Grab all the balances.
    try {
      const amounts = await tokenModule.getAllHolderBalances();
      setMemberTokenAmounts(amounts);
      console.log("👜 Amounts", amounts);
    }
    catch (error) {
      console.error("failed to get token amounts", error);
    }
  }

  const memberList = useMemo(() => {
    return memberAddresses.map(address => {
      return {
        address,
        tokenAmount: ethers.utils.formatUnits(
          memberTokenAmounts[address] || 0,
          18,
        ),
      };
    });
  }, [memberAddresses, memberTokenAmounts])

  async function checkIfUserHasNFT() {
    if (!address) {
      return;
    }

    // Check if the user has the NFT by using `bundleDropModule.balanceOf`
    const balance = await bundleDropModule.balanceOf(address, '0');

    try {
      // if balance is greater than 0, they have the ComedyDAO NFT
      if (balance.gt(0)) {
        setHasClaimedNFT(true);
        console.log("🌟 this user has a membership NFT!");
      }
      else {
        setHasClaimedNFT(false);
        console.log("😭 this user doesn't have a membership NFT.")
      }
    }
    catch (error) {
      setHasClaimedNFT(false);
      console.error('failed to nft balance', error);
    }
  }

  function renderNonConnectedWallet() {
    return (
      <>
        <Heading bgGradient={headingBgGradient} bgClip={'text'}>Welcome to ComedyDAO</Heading>
        <Button
          mt={5}
          bgGradient={buttonBgGradient}
          _hover={{ bg: '#20dfdf' }}
          color={'white'} 
          onClick={() => connectWallet('injected')}
        >
          Connect your wallet
        </Button>
      </>
    )
  }

  async function mintNFT() {
    setIsClaiming(true);
    try {
      await bundleDropModule.claim('0', 1);
      setHasClaimedNFT(true);
      console.log(`🌊 Successfully Minted! Check it out on OpenSea: https://testnets.opensea.io/assets/${bundleDropModule.address}/0`);
    }
    catch (err) {
      console.error('failed to claim', err);
    }
    finally {
      setIsClaiming(false);
    }
  }

  function renderConnectedWallet() {
    return (
      <VStack spacing={3}>
        <Heading bgGradient={headingBgGradient} bgClip={'text'}>
          Mint your Membership NFT
        </Heading>
        <Button
          isLoading={isClaiming}
          onClick={() => mintNFT()}
          bg={'teal'}
          color={'whiteAlpha.900'}
          _hover={{ bg: '#20dfdf' }}
        >
          Click to mint
        </Button>
      </VStack>
    )
  }

  async function onSubmitForm(e) {
    e.preventDefault();
    e.stopPropagation();

    //before we do async things, we want to disable the button to prevent double clicks
    setIsVoting(true);

    // lets get the votes from the form for the values
    const votes = proposals.map((proposal) => {
      let voteResult = {
        proposalId: proposal.proposalId,
        //abstain by default
        vote: 2,
      };
      proposal.votes.forEach((vote) => {
        const elem = document.getElementById(
          proposal.proposalId + "-" + vote.type
        );

        if (elem.checked) {
          voteResult.vote = vote.type;
          return;
        }
      });
      return voteResult;
    });

    // first we need to make sure the user delegates their token to vote
    try {
      // we'll check if the wallet still needs to delegate their tokens before they can vote
      const delegation = await tokenModule.getDelegationOf(address);
      // if the delegation is the 0x0 address that means they have not delegated their governance tokens yet
      if (delegation === ethers.constants.AddressZero) {
        //if they haven't delegated their tokens yet, we'll have them delegate them before voting
        await tokenModule.delegateTo(address);
      }
      // then we need to vote on the proposals
      try {
        await Promise.all(
          votes.map(async (vote) => {
            // before voting we first need to check whether the proposal is open for voting
            // we first need to get the latest state of the proposal
            const proposal = await voteModule.get(vote.proposalId);
            // then we check if the proposal is open for voting (state === 1 means it is open)
            if (proposal.state === 1) {
              // if it is open for voting, we'll vote on it
              return voteModule.vote(vote.proposalId, vote.vote);
            }
            // if the proposal is not open for voting we just return nothing, letting us continue
            return;
          })
        );
        try {
          // if any of the propsals are ready to be executed we'll need to execute them
          // a proposal is ready to be executed if it is in state 4
          await Promise.all(
            votes.map(async (vote) => {
              // we'll first get the latest state of the proposal again, since we may have just voted before
              const proposal = await voteModule.get(
                vote.proposalId
              );

              //if the state is in state 4 (meaning that it is ready to be executed), we'll execute the proposal
              if (proposal.state === 4) {
                return voteModule.execute(vote.proposalId);
              }
            })
          );
          // if we get here that means we successfully voted, so let's set the "hasVoted" state to true
          setHasVoted(true);
          // and log out a success message
          console.log("successfully voted");
        }
        catch (err) {
          console.error("failed to execute votes", err);
        }
      }
      catch (err) {
        console.error("failed to vote", err);
      }
    }
    catch (err) {
      console.error("failed to delegate tokens");
    }
    finally {
      // in *either* case we need to set the isVoting state to false to enable the button again
      setIsVoting(false);
    }
  }

  function renderProposals() {
    return (
      <Box>
          <Heading size={'md'} mb={5}>Active Proposals</Heading>
          <form onSubmit={onSubmitForm}>
            <FormControl>
              <VStack alignItems={'flex-start'} spacing={5}>
                {proposals.map((proposal, index) => (
                  <Box
                    key={proposal.proposalId}
                    p={4}
                    bg={'whiteAlpha.900'}
                    borderRadius={'lg'}
                    shadow='lg'
                  >
                    <FormLabel>{proposal.description}</FormLabel>
                    <HStack spacing={5}>
                        {proposal.votes.map((vote) => (
                          <div key={vote.type}>
                            <input
                              type="radio"
                              id={proposal.proposalId + "-" + vote.type}
                              name={proposal.proposalId}
                              value={vote.type}
                              //default the "abstain" vote to chedked
                              defaultChecked={vote.type === 2}
                            />
                            <label htmlFor={proposal.proposalId + "-" + vote.type}>
                              {vote.label}
                            </label>
                          </div>
                        ))}
                      </HStack>
                  </Box>
                ))}
              </VStack>
              <Box width={'100%'} textAlign='center'>
                <Button
                  disabled={isVoting || hasVoted}
                  type='submit'
                  mt={5}
                  bgGradient={buttonBgGradient}
                  _hover={{ bg: '#20dfdf' }}
                  color={'white'}
                  mb={5}
                >
                  {isVoting
                    ? "Voting..."
                    : hasVoted
                      ? "You Already Voted"
                      : "Submit Votes"}
                </Button>
                <FormHelperText>
                  This will trigger multiple transactions that you will need to
                  sign.
                </FormHelperText>
              </Box>
            </FormControl>
          </form>
        </Box>
    )
  }

  function renderWelcomeMember() {
    return (
      <VStack spacing={8}>
        <Heading bgGradient={headingBgGradient} bgClip={'text'}>
          ComedyDAO Member Page
        </Heading>
        <Text>Congratulations on being a member! 🤝</Text>

        <SimpleGrid
          templateColumns='repeat(2, 1fr)'
          spacing={20}
        >
          <Box width={'100%'} maxWidth={'400px'}>
            <Heading size={'md'} mb={5} bgGradient={headingBgGradient} bgClip='text'>
              Member List
            </Heading>
            <Table variant={'simple'} bg={'whiteAlpha.900'} borderRadius={'lg'} size='sm'>
              <Thead>
                <Tr>
                  <Th>Wallet</Th>
                  <Th>Token amount</Th>
                </Tr>
              </Thead>
              <Tbody>
                {memberList.map(member => {
                  return (
                    <Tr key={member.address}>
                      <Td>{shortenAddress(member.address)}</Td>
                      <Td>{member.tokenAmount}</Td>
                    </Tr>
                  )
                })}
              </Tbody>
            </Table>
          </Box>
          
          {renderProposals()}
        </SimpleGrid>
      </VStack>
    )
  }

  return (
    <Container mt={10} centerContent pl={5} pr={5}>
      {!address ? renderNonConnectedWallet() : !hasClaimedNFT ? renderConnectedWallet() : renderWelcomeMember()}
      {error instanceof UnsupportedChainIdError && (
          <Box mt={10} textAlign='center'>
            <Heading size={'sm'}>Please connect to Rinkeby</Heading>
            <Text fontSize={'sm'}>
              This dapp only works on the Rinkeby network, please switch networks in your connected wallet.
            </Text>
          </Box>
        )}
    </Container>
  )
};

export default App;
