# BFactor DApp


  - Install Metamask Extension in Chrome Browser
  - Set up Local Test Network with URL:127.0.0.1:7545 to run the DApp locally

To initiate the lite-server:
```sh
npm run dev
```

Allow Ethereum account to interact with this DApp. You should be able to observe the Eth address being used currently in the home page.

# Run App in local device

The contract needs to be funded with ether before deploying. Copy the Ethereum address from which you wish to deploy the contract and:

```sh
cd migrations/
```

Open 2_deploy_contracts.js and replace the account address in line 24 with the account address that you copied earlier

To run app in your local device, compile and deploy the contract with the following command:

```sh
truffle migrate --reset
```

Copy the contract address of the **BFactor.sol** and replace it with the contract address in **app.js** file.

```sh
cd src/js 
```

Replace the contract address in **app.js** in line 36

Import account into Metamask wallet to interact with the smart contract.
