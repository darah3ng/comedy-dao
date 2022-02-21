import { useEffect, useMemo, useState } from 'react';
import { Container, Heading, Box, Button } from '@chakra-ui/react';
import { useWeb3 } from '@3rdweb/hooks';

const headingBgGradient = 'linear(to-r, #1ab3b3, #20dfdf, #dfaf20)';
const buttonBgGradient = 'linear(to-r, #062d2d, #0d5959, #138686)';

const App = () => {
  const { connectWallet, address, error, provider } = useWeb3();

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

  function renderConnectedWallet() {
    return (
      <>
        <Heading bgGradient={headingBgGradient} bgClip={'text'}>Wallet connected, let's dance! 💃</Heading>
      </>
    )
  }

  return (
    <Container mt={10} centerContent>
      {!address ? renderNonConnectedWallet() : renderConnectedWallet()}
    </Container>
  )
};

export default App;
