# Equinox Election DApp

## Concept

A centralized voting system requires complete trust in the organization(that conducts voting), making it a single point of failure. Furthermore, such organizations having absolute control and discretion over the entire voting process can be motivated to act maliciously for the right price, hence compromising the integrity of the election. We propose to solve the challenges mentioned above by developing a Decentralized Application using Ethereum Blockchain(known for its high security). We envision a web-application prototype that enables two different kinds of voting processes: permission and permissionless. Both the systems require the user to have an Ethereum address. A permission system accepts votes from only users having the right to vote(determined by the conducting committee), while a permissionless voting system doesn’t enforce such restrictions(allowing all users to vote: an open election). The prototype classifies the users into two different categories: organizations and users. A smart contract will be utilized to allow only legitimate transactions(such as ensuring the user has the right to vote, votes not counted after the election is expired, preventing double-voting, etc.) to pass through and be added to the blockchain. An intuitive dashboard representing the overall results and margin of victory will be displayed for all the participants of the election. The security and integrity of the entire process will be ensured by an Ethereum Smart Contract that enforces the logic and conditions for creating an election with appropriate(and critical) parameters including expiry time, users that are allowed to vote, etc. The novelty in our solution is implementing two different kinds of elections(permission and permissionless) and enabling the committee conducting the election to choose between the types that tailor to their specific requirements.


## Tech Stack Implemented

Frontend: HTML, CSS, Bootstrap 4 <br/>
Backend: JavaScript  <br/>
Smart Contract: Ethereum Smart Contract  <br/>
Server: NodeJS Lite Server  <br/>


## Setup

  - Install Metamask Extension in Chrome Browser
  - Set up Local Test Network with URL:127.0.0.1:7545 to run the DApp locally

To compile contracts:
```sh
truffle migrate --reset
```

To run tests:
```sh
truffle test
```

To initiate the lite-server:
```sh
npm run dev
```

Allow Ethereum account to interact with this DApp. You should be able to observe the Eth address being used currently in the home page.

