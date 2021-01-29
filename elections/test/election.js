const { assert } = require('chai');
const truffleAssert = require('truffle-assertions');

//We need Web3 to sign transactions
const Web3 = require("web3")
const Election = artifacts.require("Election");
App = {
    web3Provider: null,
    web3: null,
}
//

require('chai')
    .use(require('chai-as-promised'))
    .should()

contract('Election', (accounts) => {
    var election;
    var bizs, debs, facs;

    before(async () => {
        election = await Election.new();
        
        //Instantiating web3 provider
        if (typeof web3 !== 'undefined') {
            App.web3Provider = web3.currentProvider;
            web3 = new Web3(web3.currentProvider);
        } else {
            App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
            web3.eth.defaultAccount = web3.eth.accounts[0]
            web3 = new Web3(App.web3Provider);
        }

    })

    describe('Election initialisation', async () => {
        it('Users initialized to 0', async () => {
            users = await election.getNumberOfUsers();
            noOfUsers=parseInt(users);
            assert.equal(noOfUsers, 0)
        })

        it('No of elections initialized to 0', async () => {
            elections = await election.noOfElections();
            noOfElections=parseInt(elections)
            assert.equal(noOfElections, 0)
        })

        
    })

    describe('Registering', async () => {
        it('User John Doe Registers', async () => {
            let result = await election.register('John Doe' , {from: accounts[0]});
            
        })

        it('User Jane Doe Registers', async () => {
            let result = await election.register('Jane Doe' , {from: accounts[1]});
            
        })

        it('User Albert Registers', async () => {
            let result = await election.register('Albert' , {from: accounts[2]});
            
        })

        it('Users count incremented to 3', async () => {
            users = await election.getNumberOfUsers();
            noOfUsers=parseInt(users);
            assert.equal(noOfUsers, 3)
            
        })
   
    })

    describe('Creating Election', async () => {
    
        it('Creates an election', async () => {
            let result = await election.createElection('C1','C2',false,'New Election',0 , {from: accounts[0]});
            
        })
   
    })

    describe('Voting', async () => {
    
        it('Vote to candidate 1', async () => {
            let result = await election.vote(1,1, {from: accounts[0]});
            
        })
        it('Vote to candidate 2', async () => {
            let result = await election.vote(1,2, {from: accounts[1]});
            
        })
        it('Vote to candidate 1 again', async () => {
            let result = await election.vote(1,1, {from: accounts[2]});
            
        })
        it('Checks if candidate 1 received 2 votes', async () => {
            let result = await election.elections(1);
            let count1=result.optCount1;
            let count2=result.optCount2;
            assert.equal(count1, 2);
            
        })
        it('Checks if candidate 2 received 1 vote', async () => {
            let result = await election.elections(1);
            let count1=result.optCount1;
            let count2=result.optCount2;
            assert.equal(count2, 1);
            
        })
    })
    describe('Closing Election', async () => {
    
        it('Should close the election', async () => {
            let result = await election.closeElection(1,{from: accounts[0]});
            
        })
        
    })


    /*
    describe('Manage Invoices', async () => {
        let result
        let inv
        let invId 
        let invOwner

        it('should commit invoice hash', async () => {
            let hashedData = await election.getInvoiceHash(accounts[0], accounts[1], web3.utils.toWei('10', 'ether'), {from: accounts[0]})
            let invoiceId = await election.createInvoiceId()
            
            result = await election.commit(accounts[0], hashedData, invoiceId, {from: accounts[0]})

            const event = result.logs[0].args
            assert.equal(hashedData, event.dataHash);
            invId = event.invoiceId;
            invOwner = event.sender;
        })

        it('should allow debtor to confirm invoice hash', async () => {
            console.log(invId);
            console.log(invOwner);
           result =  await election.acknowledgeInvoice(invId, web3.utils.toWei('10', 'ether'), invOwner, {from: accounts[1]})

           const event = result.logs[0].args
           assert.equal(accounts[1], event.debtor);
           assert.equal(invId.toString(), event.invoiceId.toString())
        })

        it('should create invoice', async () => {
            await election.createInvoice(invId, accounts[1], web3.utils.toWei('10', 'ether'), {from: accounts[0]})
            inv = await election.invoices(1)
            assert.equal(inv.amount, web3.utils.toWei('10', 'ether'), "Invoice does not have the correct amount")
            assert.equal(inv.owner, accounts[0], "Invoice does not have the correct owner")
            assert.equal(inv.issuedTo, accounts[1], "Invoice does not have the correct debtor")
            assert.equal(inv.state, 2, "Invoices does not have the correct state")
        })

        // it('should allow debtor to acknowledge invoices', async () => {
        //     result = await election.acknowledgeInvoice(1, {from: accounts[1]})
        //     inv = await election.invoices(1)
        //     assert.equal(inv.state, 2, "Invoice state is not changed to Acknowledge")

        //     const event = result.logs[0].args
        //     assert.equal(event._invoiceId, 1)
        //     assert.equal(event._newState, 2)
        // })

        it('should allow business to offer invoice for factoring', async () => {
            result = await election.offerInvoice(1, {from: accounts[0]})
            inv = await election.invoices(1)
            assert.equal(inv.state, 3, "Invoice state is not changed to Offered")

            const event = result.logs[0].args
            assert.equal(event._invoiceId, 1)
            assert.equal(event._newState, 3)
        })
    })

    describe('Manage Offers', async () => {
        let result
        let offer
        let inv

        it('should reject invoice', async () => {
            result = await election.rejectInvoice(1, "reason for rejection", {from: accounts[2]})
            inv = await election.invoices(1)
            assert.equal(inv.state, 2, "Invoice state is not changed to Acknowledged")

            // const event = result.logs[0].args
            // assert.equal(event._invoiceId, 1)
            // assert.equal(event._newState, 2)

            truffleAssert.eventEmitted(result, 'InvoiceStateChanged', (ev) => {
                return ev._invoiceId == 1 && ev._newState == 2;
            });

            // const rejectEvent = result.logs[1].args
            // assert.equal(rejectEvent._invoiceId, 1)
            // assert.equal(rejectEvent._reason, 'reason for rejection')

            truffleAssert.eventEmitted(result, 'InvoiceRejected', (ev) => {
                return ev._invoiceId == 1 && ev._reason == 'reason for rejection';
            });
        }) 

        it('should accept invoice', async () => {
            await election.offerInvoice(1, {from: accounts[0]})
            result = await election.acceptInvoice(1, {from: accounts[2]})
            inv = await election.invoices(1)
            assert.equal(inv.state, 4, "Invoice state is not changed to Factorable")

            const event = result.logs[0].args
            assert.equal(event._invoiceId, 1)
            assert.equal(event._newState, 4)
        })

        it('should create offer', async () => {
            result = await election.createOffer(1, 80, 1, {from: accounts[2]})
            offer = await election.offers(1)
            assert.equal(offer.invoiceId, 1, "Offer does not have the correct invoice")
            assert.equal(offer.owner, accounts[2], "Offer doesn not have the correct owner")
            assert.equal(offer.advanceRate, 80, "Invoice doesn not have the correct advance rate")
            assert.equal(offer.discountRate, 1, "Invoice doesn not have the correct discount rate")
            assert.equal(offer.state, 0, "Offer does not have the correct state")

            const event = result.logs[0].args
            assert.equal(event._offerId, 1)
        })

        it('should reject offer', async () => {
            result = await election.rejectOffer(1, "reason for rejection", {from: accounts[0]})
            offer = await election.offers(1)
            assert.equal(offer.state, 0, "Offer state is not set to Pending")

            // const event = result.logs[0].args
            // assert.equal(event._offerId, 1)
            // assert.equal(event._reason, 'reason for rejection')

            truffleAssert.eventEmitted(result, 'OfferRejected', (ev) => {
                return ev._offerId == 1 && ev._reason == 'reason for rejection';
            });
        })

        it('should accept offer', async () => {
            result = await election.acceptOffer(1, {from: accounts[0]})
            offer = await election.offers(1)
            assert.equal(offer.state, 1, "Offer state is not set to Accepted")

            // const event = result.logs[0].args
            // assert.equal(event._offerId, 1)

            truffleAssert.eventEmitted(result, 'OfferAccepted', (ev) => {
                return ev._offerId == 1;
            });
        })
    })

    describe('Factor Invoices', async () => {

        it('should get offer by invoice ID', async () => {
            let offerID = await election.getOfferByInvoiceId(1)
            assert.equal(offerID, 1, "The offer ID is not correct")
        });

        it('should allow factor to send advance rate', async () => {
            let factorBalanceBefore = await web3.eth.getBalance(accounts[2])
            let inv = await election.invoices(1)
            let offer = await election.offers(1)
            //It was 0.8 * inv.amount earlier
            //But the contract doesn't receive 100% wei, hence I increased the amount
            //that we send to the contract to ensure that the contract has sufficient funds
            //TODO: We have to fix this problem to ensure the contract is funded enough
            let advanceRate = (2*inv.amount)
            
            //Converting int to string as web3 utils require us to do so
            //converting string to wei eventually
            var weiValue=web3.utils.toWei(advanceRate.toString(), 'wei')
            
            try{
                //value argument specifies how much wei we wish to send to the contract
                await election.sendAdvanceRate(1, {from: accounts[2], value: weiValue})
            }
            catch(error){
                console.log(error)
            }
            //await election.withdrawAdvanceRate(1, {from: accounts[0]})
            //Check factor balance after sending the advance rate
            let factorBalanceAfter = await web3.eth.getBalance(accounts[2])
            let expectedBalance = factorBalanceBefore - advanceRate
            //We can't equate before and after balance without any loss of precision
            //Hence commented the below assert statement
            //assert.equal(factorBalanceAfter.toString(), expectedBalance)
            

            return advanceRate
            
        });
    })
    */
})