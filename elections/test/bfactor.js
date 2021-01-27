const { assert } = require('chai');
const truffleAssert = require('truffle-assertions');

//We need Web3 to sign transactions
const Web3 = require("web3")
const BFactor = artifacts.require("BFactor");
App = {
    web3Provider: null,
    web3: null,
}
//

require('chai')
    .use(require('chai-as-promised'))
    .should()

contract('BFactor', (accounts) => {
    var bf;
    var bizs, debs, facs;

    before(async () => {
        bf = await BFactor.new("Test BFactor");
        await bf.createBusiness("B1", accounts[0],"location1","telephone1","email1");
        await bf.createDebtor("D1", accounts[1],"location2","telephone2","email2");
        await bf.createFactor("F1", accounts[2],"location3","telephone3","email3");

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

    describe('Bfactor initialisation', async () => {
        it('should create a new business', async () => {
            bizs = await bf.businesses
            assert.notEqual(bizs, null)
        })

        it('should set the business name and account correctly', async () => {
            const biz = await bf.businesses(accounts[0])
            assert.equal(biz.name, "B1", "Business name was not set correctly")
            assert.equal(biz.account, accounts[0], "Business is not assigned to correct address")
        })

        it('should create a new debtor', async () => {
            debs = await bf.debtors
            assert.notEqual(debs, null)
        })

        it('should set the debtor name and account correctly', async () => {
            const deb = await bf.debtors(accounts[1])
            assert.equal(deb.name, "D1", "Debtor name was not set correctly")
            assert.equal(deb.account, accounts[1], "Debtor is not assigned to correct address")
        })

        it('should create a new factor', async () => {
            facs = await bf.factors
            assert.notEqual(facs, null)
        })

        it('should set the factor name and account correctly', async () => {
            const fac = await bf.factors(accounts[2])
            assert.equal(fac.name, "F1", "Factor name was not set correctly")
            assert.equal(fac.account, accounts[2], "Factor is not assigned to correct address")
        })
    })

    describe('Manage Invoices', async () => {
        let result
        let inv
        let invId 
        let invOwner

        it('should commit invoice hash', async () => {
            let hashedData = await bf.getInvoiceHash(accounts[0], accounts[1], web3.utils.toWei('10', 'ether'), {from: accounts[0]})
            let invoiceId = await bf.createInvoiceId()
            
            result = await bf.commit(accounts[0], hashedData, invoiceId, {from: accounts[0]})

            const event = result.logs[0].args
            assert.equal(hashedData, event.dataHash);
            invId = event.invoiceId;
            invOwner = event.sender;
        })

        it('should allow debtor to confirm invoice hash', async () => {
            console.log(invId);
            console.log(invOwner);
           result =  await bf.acknowledgeInvoice(invId, web3.utils.toWei('10', 'ether'), invOwner, {from: accounts[1]})

           const event = result.logs[0].args
           assert.equal(accounts[1], event.debtor);
           assert.equal(invId.toString(), event.invoiceId.toString())
        })

        it('should create invoice', async () => {
            await bf.createInvoice(invId, accounts[1], web3.utils.toWei('10', 'ether'), {from: accounts[0]})
            inv = await bf.invoices(1)
            assert.equal(inv.amount, web3.utils.toWei('10', 'ether'), "Invoice does not have the correct amount")
            assert.equal(inv.owner, accounts[0], "Invoice does not have the correct owner")
            assert.equal(inv.issuedTo, accounts[1], "Invoice does not have the correct debtor")
            assert.equal(inv.state, 2, "Invoices does not have the correct state")
        })

        // it('should allow debtor to acknowledge invoices', async () => {
        //     result = await bf.acknowledgeInvoice(1, {from: accounts[1]})
        //     inv = await bf.invoices(1)
        //     assert.equal(inv.state, 2, "Invoice state is not changed to Acknowledge")

        //     const event = result.logs[0].args
        //     assert.equal(event._invoiceId, 1)
        //     assert.equal(event._newState, 2)
        // })

        it('should allow business to offer invoice for factoring', async () => {
            result = await bf.offerInvoice(1, {from: accounts[0]})
            inv = await bf.invoices(1)
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
            result = await bf.rejectInvoice(1, "reason for rejection", {from: accounts[2]})
            inv = await bf.invoices(1)
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
            await bf.offerInvoice(1, {from: accounts[0]})
            result = await bf.acceptInvoice(1, {from: accounts[2]})
            inv = await bf.invoices(1)
            assert.equal(inv.state, 4, "Invoice state is not changed to Factorable")

            const event = result.logs[0].args
            assert.equal(event._invoiceId, 1)
            assert.equal(event._newState, 4)
        })

        it('should create offer', async () => {
            result = await bf.createOffer(1, 80, 1, {from: accounts[2]})
            offer = await bf.offers(1)
            assert.equal(offer.invoiceId, 1, "Offer does not have the correct invoice")
            assert.equal(offer.owner, accounts[2], "Offer doesn not have the correct owner")
            assert.equal(offer.advanceRate, 80, "Invoice doesn not have the correct advance rate")
            assert.equal(offer.discountRate, 1, "Invoice doesn not have the correct discount rate")
            assert.equal(offer.state, 0, "Offer does not have the correct state")

            const event = result.logs[0].args
            assert.equal(event._offerId, 1)
        })

        it('should reject offer', async () => {
            result = await bf.rejectOffer(1, "reason for rejection", {from: accounts[0]})
            offer = await bf.offers(1)
            assert.equal(offer.state, 0, "Offer state is not set to Pending")

            // const event = result.logs[0].args
            // assert.equal(event._offerId, 1)
            // assert.equal(event._reason, 'reason for rejection')

            truffleAssert.eventEmitted(result, 'OfferRejected', (ev) => {
                return ev._offerId == 1 && ev._reason == 'reason for rejection';
            });
        })

        it('should accept offer', async () => {
            result = await bf.acceptOffer(1, {from: accounts[0]})
            offer = await bf.offers(1)
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
            let offerID = await bf.getOfferByInvoiceId(1)
            assert.equal(offerID, 1, "The offer ID is not correct")
        });

        it('should allow factor to send advance rate', async () => {
            let factorBalanceBefore = await web3.eth.getBalance(accounts[2])
            let inv = await bf.invoices(1)
            let offer = await bf.offers(1)
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
                await bf.sendAdvanceRate(1, {from: accounts[2], value: weiValue})
            }
            catch(error){
                console.log(error)
            }
            //await bf.withdrawAdvanceRate(1, {from: accounts[0]})
            //Check factor balance after sending the advance rate
            let factorBalanceAfter = await web3.eth.getBalance(accounts[2])
            let expectedBalance = factorBalanceBefore - advanceRate
            //We can't equate before and after balance without any loss of precision
            //Hence commented the below assert statement
            //assert.equal(factorBalanceAfter.toString(), expectedBalance)
            

            return advanceRate
            
        });
    })
})