import { useEffect, useMemo, useState } from 'react';
import { Container, Heading, Box, Button } from '@chakra-ui/react';
import { useWeb3 } from '@3rdweb/hooks';

const App = () => {
  const { connectWallet, address, error, provider } = useWeb3();
  console.log("👋 Address:", address);

  function renderNonConnectedWallet() {
    return (
      <>
        <Heading>Welcome to ComedyDAO</Heading>
        <Button onClick={() => connectWallet('injected')}>
          Connect your wallet
        </Button>
      </>
    )
  }

  function renderConnectedWallet() {
    return (
      <Heading>Wallet connected, let's dance! 💃</Heading>
    )
  }

  return (
    <Container mt={10}>
      {!address ? renderNonConnectedWallet() : renderConnectedWallet()}
    </Container>
  )
};

export default App;
