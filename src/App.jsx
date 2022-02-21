import { useEffect, useMemo, useState } from 'react';
import { Container, Heading, Button, VStack, Text, Box } from '@chakra-ui/react';
import { Table, Thead, Tbody, Tr, Th, Td } from '@chakra-ui/react';
import { useWeb3 } from '@3rdweb/hooks';
import { ThirdwebSDK } from "@3rdweb/sdk";
import { ethers } from 'ethers';
import { shortenAddress } from './utils/shortenAddress';

// CSS
const headingBgGradient = 'linear(to-r, #1ab3b3, #20dfdf, #dfaf20)';
const buttonBgGradient = 'linear(to-r, #062d2d, #0d5959, #138686)';

// ERC-1155 contract
const sdk = new ThirdwebSDK('rinkeby');
const BUNDLE_DROP_ADDRESS = '0x4BbB42D171858Ea5025A18CC22ac65759384C42A';
const bundleDropModule = sdk.getBundleDropModule(BUNDLE_DROP_ADDRESS);

// ERC-20 contract
const tokenAddress = '0x6fc5c8a826b216df26cb90e0da9e3cf2cf988e8e';
const tokenModule = sdk.getTokenModule(tokenAddress);

const App = () => {
  const { connectWallet, address, error, provider } = useWeb3();
  const [hasClaimedNFT, setHasClaimedNFT] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [memberAddresses, setMemberAddresses] = useState([]);
  const [memberTokenAmounts, setMemberTokenAmounts] = useState({});

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

  function renderWelcomeMember() {
    return (
      <VStack spacing={8}>
        <Heading bgGradient={headingBgGradient} bgClip={'text'}>
          ComedyDAO Member Page
        </Heading>
        <Text>Congratulations on being a member! 🤝</Text>

        <Box width={'100%'}>
          <Heading size={'sm'} mb={5} bgGradient={headingBgGradient} bgClip='text'>
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
      </VStack>
    )
  }

  return (
    <Container mt={10} centerContent>
      {!address ? renderNonConnectedWallet() : !hasClaimedNFT ? renderConnectedWallet() : renderWelcomeMember()}
    </Container>
  )
};

export default App;
