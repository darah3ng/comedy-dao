import React from "react";
import ReactDOM from "react-dom";
import App from "./App.jsx";
import { ChakraProvider, extendTheme, theme } from '@chakra-ui/react';
import { mode } from "@chakra-ui/theme-tools";

// Import thirdweb
import { ThirdwebWeb3Provider } from '@3rdweb/hooks';

// Override fonts from default theme
const light = "#e9fcfc";
const customTheme = extendTheme({
  ...theme,
  fonts: {
    body: 'Inter, sans-serif',
    heading: 'Inter, sans-serif',
    mono: 'Fira Code, monospace'
  },
  styles: {
    global: (props) => ({
      body: {
        bg: mode(light,)(props),
      }
    })
  }
});

// Include what chains you wanna support
// 4 = Rinkeby
const supportedChainIds = [4];

// Include what type of wallet you want to support
// In this case, we support MetaMask which is an "injected wallet"
const connectors = {
  injected: {},
};

// Render the App component to the DOM
ReactDOM.render(
  <React.StrictMode>
    <ThirdwebWeb3Provider
      connectors={connectors}
      supportedChainIds={supportedChainIds}
    >
      <ChakraProvider theme={customTheme}>
      <App />
      </ChakraProvider>
    </ThirdwebWeb3Provider>
  </React.StrictMode>,
  document.getElementById("root")
);
