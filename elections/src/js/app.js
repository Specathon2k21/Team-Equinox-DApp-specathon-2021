App = {
  web3Provider: null,
  contracts: {},
  contract: null,
  web3: null,

  init: function() {
    

  
    return App.initWeb3();
  },

  initWeb3: function () {
    if (typeof web3 !== 'undefined') {
      // If a web3 instance is already provided by Meta Mask.
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
    } else {
      // Specify default instance if no web3 instance provided
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
      web3 = new Web3(App.web3Provider);
    }

    return App.initContract();
  },

  initContract: function() {

    $.getJSON("Election.json", function(election) {
      console.log(election);
      App.contracts.Election = TruffleContract(election);
      App.contracts.Election.setProvider(App.web3Provider);
      App.contracts.Election.deployed().then(function(election) {
        //console.log("BFactor Address:", bfactor.address);
      });

      App.contracts.Election.deployed().then(function(instance) {
        App.electionContract = instance;
        console.log("contract:" + App.electionContract);
      });

      return App.render();

    })
  },

  

  render: function () {

    //dashboard account dashlet
    web3.eth.getCoinbase(function (err, account) {
      if (err === null) {
        App.account = account;
        console.log("account " + account);
        $("#accountAddress").html("Account currently in use: " + account);
        $("#accountAddress").html(account);
      } else {
        console.log(err);
      }
    });

    //Display debtors dropdown list in the Submit Invoice page
    var electionContract;
    
    App.contracts.Election.deployed().then(function(instance) {
      electionContract = instance;
      return instance.debtorsCount.call();
    }).then(function(dCount) {
      //console.log("debtors:" + dCount);
      var debtorsSelect = $('#debtorsSelect');
      debtorsSelect.empty();

      for(var i = 1; i <= dCount; i++) {
        electionContract.debtors(i).then(function(debtor) {
          var id = debtor[0];
          var name = debtor[1];
          var address = debtor[2];

          var debtorsOption = "<option value='" + id + "' >" + name + ", " + address.toString() +"</ option>";
          debtorsSelect.append(debtorsOption);
        });
      }
    });

    App.contracts.Election.deployed().then(function(instance) {
      electionContract = instance;
      return instance.invoicesCount.call();
    }).then(function(dCount) {
      dCount=dCount.c[0];
      console.log(dCount);
      //console.log("debtors:" + dCount);
      var invoiceSelect = $('#invoiceSelect');
      invoiceSelect.empty();

      for(var i = 1; i <= dCount; i++) {
        electionContract.invoices(i).then(function(invoice) {
          var id = invoice[0];
          var amount = invoice[3];
          //var address = invoice[2];

          var invoiceOption = "<option value='" + id + "' >" + id + ", Amount= " + amount.toString() +"</ option>";
          invoiceSelect.append(invoiceOption);
        });
      }
    });

    App.contracts.Election.deployed().then(function(instance) {
      electionContract = instance;
      return instance.offersCount.call();
    }).then(function(dCount) {
      dCount=dCount.c[0];
      console.log(dCount);
      //console.log("debtors:" + dCount);
      var invoiceSelect = $('#offerSelect');
      invoiceSelect.empty();

      for(var i = 1; i <= dCount; i++) {
        electionContract.offers(i).then(function(invoice) {
          var id = invoice[0];
          var amount = invoice[1];
          //var address = invoice[2];

          var invoiceOption = "<option value='" + id + "' >" + id + ", Advance Rate= " + amount.toString() + "%" +"</ option>";
          invoiceSelect.append(invoiceOption);
        });
      }
    });

    //Display the list of submitted invoices in the Acknowledge Invoice page
    App.contracts.Election.deployed().then(function(instance) {
      electionContract = instance;
      return electionContract.commitsCount.call();
    }).then(function(commitCount) {
      console.log("commits count" + commitCount);

      for(var i=0; i < commitCount; i++) {
        electionContract.commits(i).then(function(commit) {
          if(!commit[3]) {
            var invoiceHash = commit[0];
            var invoiceID = commit[7];
            var invoiceDebtor = commit[5];
            console.log("inv debtor" + invoiceDebtor);
            var commitTemplate = "<tr><td class=\"comid\">" + i + "<td class=\"invid\">" + invoiceID + "</td><td><input type=\"text\" class=\"invIssuer\"></input></td><td><input type=\"text\" class=\"acktext\"></input></td><td><input type=\"text\" class=\"invYear\" size=\"10\" style=\"margin-right: 10px\"><input type=\"text\" class=\"invMonth\" size=\"10\" style=\"margin-right: 10px\"><input type=\"text\" class=\"invDay\" size=\"10\"></td><td><input type=\"button\" class=\"ackbtn\"id=\"ackInvoice\" value=\"Approve\"/></td></tr>";
            $("#commitsList").append(commitTemplate);
          }
        })
      }
    });

    //Display the list of submitted invoices in the offer Invoice page
    App.contracts.Election.deployed().then(function(instance) {
      electionContract = instance;
      console.log("offer invoice");
      return electionContract.invoicesCount.call();
    }).then(function(invoicesCount) {
      console.log("invoices count" + invoicesCount);

      for(var i=1; i <= invoicesCount; i++) {
        console.log("loop");
        electionContract.invoices(i).then(function(invoice) {
          if(invoice[5] == 2) {
            var invoiceID = invoice[0];
            var invoiceDebtor = invoice[2];
            var invoiceAmount = invoice[3]
            var invoiceState = invoice[5];
            console.log("invoice id" + invoiceID);
            console.log("invoice debtor", invoiceDebtor);

            var invoiceTemplate = "<tr><td class=\"invid\">" + invoiceID + "<td class=\"invDebtor\">" + invoiceDebtor + "</td><td class=\"invAmount\">" + invoiceAmount + "</td><td><input type=\"button\" class=\"offerbtn btn btn-primary\"id=\"offerInvoice\" value=\"Offer\"/></td></tr>";
            $("#toOfferInvoicesList").append(invoiceTemplate);
          }
        })
      }
    });

    //Display the list of submitted offers in the Accept Offers page
    App.contracts.Election.deployed().then(function(instance) {
      electionContract = instance;
      return electionContract.offersCount.call();
    }).then(function(offersCount) {
      console.log("offers count" + offersCount);

      for(var i=1; i <= offersCount; i++) {
        electionContract.offers(i).then(function(offer) {
          console.log(offer[3]);
          //if(offer[3] === 0) {
            var invoiceID = offer[0];
            var advanceRate = offer[1];
            var discountRate = offer[2];

            //console.log("inv debtor" + invoiceDebtor);
            var commitTemplate = "<tr><td class=\"offId\">" + i + "</td><td class=\"invid\">" + invoiceID + "</td><td class=\"offAdv\">" + advanceRate + "</td><td class=\"offDis\">" + discountRate + "</td><td><input type=\"button\" class=\"acceptbtn btn btn-primary btn-lg\"id=\"acceptOffer\" value=\"Accept\"/></td></tr>";
            $("#offersList").append(commitTemplate);
          //}
        })
      }
    });

    InvoiceStates=["Created","Pending","Acknowledged","Offered","Factorable","Factored","Settled"];

    //dashboard
    App.contracts.Election.deployed().then(function(instance) {
      return instance.getNumberOfUsers();
    }).then(function(dCount) {
      

      var usersCount=dCount.c[0];
      console.log(usersCount);
      $("#noOfUsers").html(usersCount);
      
    });
    App.contracts.Election.deployed().then(function(instance) {
      return instance.getNumberOfElection();
    }).then(function(dCount) {
      

      var electionsCount=dCount.c[0];
      
      $("#noOfElections").html(electionsCount);
      
    });

 
    App.newOffer();

  },

  newOffer: function () {

    var reference;

    //create business
    $("#register").click(async function() {
      var userName=$("#userName").val();
      console.log("Here");
      console.log(userName, App.account);
      App.contracts.Election.deployed().then(function (instance) {
        return instance.register(userName, {
          from: App.account
        }).then(function(result) {
          console.log(result);
        })
      });
    });

    //Create factor
    $("#factorCreate").click(async function () {
      var factorName = $("#factorName").val();
      var address = $("#factorAddress").val();
      var location = $("#factorLocation").val();
      var telephone = $("#factorTelephone").val();
      var email = $("#factorEmail").val();
      App.contracts.Election.deployed().then(function(instance) {
        return instance.createFactor(factorName, address, location, telephone, email, { 
          from: App.account 
        }).then(function(result) {
          console.log(result);
        })
      });
    });

    //Debtor create
    $("#createElection").click(async function () {
      var c1 = $("#cd1").val();
      var c2 = $("#cd2").val();
      var desc = $("#permission").val();
      var permission = $("#electionDesc").val();
      


      App.contracts.Election.deployed().then(function(instance) {
        console.log("Here");
        return instance.createElection(c1, c2, true, permission, 0, { 
          from: App.account 
        }).then(function(result) {
          console.log(result);
        })
      });
    });

    

    //Invoice Acknowledgement
    $("#commitsList").on('click', '.ackbtn', function() {
     
      var $invoiceHash = $(this).closest("tr")
                                .find(".invHash")
                                .text();

      var $invoiceID = $(this).closest("tr")
                              .find(".invid")
                              .text();

      var $comID = $(this).closest("tr")
      .find(".comid")
      .text();

      var $ackText = $(this).closest("tr")
      .find(".acktext")
      .val();
      console.log($ackText);

      var $invIssuer = $(this).closest("tr")
      .find(".invIssuer")
      .val();
      console.log($invIssuer);

      var $invYear = $(this).closest("tr")
      .find(".invYear")
      .val();
      console.log($invYear);

      var $invMonth = $(this).closest("tr")
      .find(".invMonth")
      .val();
      console.log($invMonth);

      var $invDay = $(this).closest("tr")
      .find(".invDay")
      .val();
      console.log($invDay);
      
      var electionContract;
      var invoiceAmount;
      var invoiceOwner;

      App.contracts.Election.deployed().then(function(instance) {
        electionContract = instance;
        // console.log("invoice ID", $invoiceID);
        // console.log("commit ID", $comID);
        // console.log("amount", $ackText);
        // console.log("owner", $invIssuer);
        // console.log("year", $invYear);
        // console.log("month", $invMonth);
        // console.log("day", $invDay);
        return electionContract.getInvoiceDateTimeStamp($invYear, $invMonth, $invDay);
      }).then(function(invDateTimeStamp) {
        //console.log("date working");
        return electionContract.getInvoiceDataEncoded($invIssuer, App.account, $ackText, invDateTimeStamp);
      }).then(function(invoiceDataEncoded) {
        //console.log("encoded data working");
        return electionContract.getInvoiceHash(invoiceDataEncoded);
      }).then(function(invoiceDataHashed) {
        //console.log("invoice hash working " + invoiceDataHashed);
        var cID = $comID - 1;
        return electionContract.acknowledgeInvoice(invoiceDataHashed, cID);
      }).then(function(err) {
        console.log(err);
        var comId = $comID - 1;
        return electionContract.createInvoice($invoiceID, comId, $invYear, $invMonth, $invMonth);
      })
    });


    $("#toOfferInvoicesList").on('click', '.offerbtn', function() {
      var $invoiceID = $(this).closest("tr")
                              .find(".invid")
                              .text();
      console.log("here ... ");
      var electionContract;
      var invoiceCount;

      App.contracts.Election.deployed().then(function(instance) {
        electionContract = instance;
        return electionContract.invoicesCount.call();
      }).then(function(iCount) {
        //console.log("invoices count" + iCount);
        for(var i=1; i <= iCount; i++) {
          electionContract.invoices(i).then(function(invoice) {
            console.log("invoice ID " + invoice[0]);
            if(invoice[0].c[0] == $invoiceID) {
              console.log(invoice[0].c[0])
              invoiceCount = i;
              console.log("invoice count: " + invoiceCount);
              
              App.contracts.Election.deployed().then(function(instance) {
                electionContract = instance;
                var invID = invoiceCount -1;
                console.log(invID);
                return electionContract.offerInvoice(invID);
              }).then(function(error) {
                if (error) console.log(error);
              });
            }
          });
        }
      });      
    });

    $("#offersList").on('click', '.acceptbtn', async function() {

      var $offerID = $(this).closest("tr")
                            .find(".invid")
                            .text();

      var electionContract;
      var invoiceCount;

      App.contracts.Election.deployed().then(function(instance) {
        electionContract = instance;
        return electionContract.offersCount.call();
      }).then(function(oCount) {
        oCount=oCount.c[0];
        console.log(oCount);
        for(var i=1; i <= oCount; i++) {
          electionContract.offers(i).then(function(offer) {
            console.log(offer[0].c[0],$offerID);
            if(offer[0] == $offerID) {
              console.log(offer[0].c[0]);
              var offId=i-1;
              console.log(offId);
              App.contracts.Election.deployed().then(function(instance) {
                electionContract = instance;
                return electionContract.acceptOffer(offId)
              }).then(function(error) {
                if (error) console.log(error);
              })
            }
          });
        }
      });
    });

    $("#accInvoice").click(async function() {
      var id=$("#accInvID").val();
      
    });


    $("#selectInvoice").click(async function() {
      console.log("Here");
      var invoiceSelect=document.getElementById("invoiceSelect");

      var invoice=invoiceSelect.options[invoiceSelect.selectedIndex].text;
      invoiceId=invoice.split(',')[0];
      invoiceAmount=invoice.split(',')[1].split('= ')[1];
      document.getElementById("invoiceAmount").innerHTML="<small><b>Subtotal: "+invoiceAmount+"</b></small>";
      console.log(invoiceAmount);
      document.getElementById("invoiceDetails").style.display="inline";

      App.contracts.Election.deployed().then(function(instance) {
      electionContract = instance;
      return instance.invoicesCount.call();
      }).then(function(dCount) {
        dCount=dCount.c[0];
        console.log(dCount);
        //console.log("debtors:" + dCount);

        for(var i = 1; i <= dCount; i++) {
          electionContract.invoices(i).then(function(invoice) {
            if(invoice[0]==invoiceId){
              var owner=invoice[1];
              var debtor=invoice[2];
              var invoiceDate=invoice[6];
              var electionContract
              var year, month, day;
              App.contracts.Election.deployed().then(function(instance) {
                electionContract = instance;
                return instance.dateTime.getYear(invoiceDate);
              }).then(function($year) {
                year = $year;
                return instance.dateTime.getMonth(invoiceDate);
              }).then(function($month) {
                month = $month;
                return instance.dateTime.getDay(invoiceDate);
              }).then(function($day) {
                day = $day;
              });
 
              document.getElementById("invoiceDate").innerHTML="<small><em>Issue Date</b>: "+day+"/"+month+"/"+year+"</em></small>";
              console.log(owner);
              console.log(debtor);
              App.contracts.Election.deployed().then(function(instance){
                contractInstance=instance;
                return contractInstance.debtorsCount.call();
              }).then(function(dCount){
                var count=dCount.c[0];
                
                
                for(var i=0; i<=count; i++){
                  
                  electionContract.debtors(i).then(function(debtorDetails){
                    if(debtorDetails[2]===debtor){

                      document.getElementById("invoiceHide").style.display="inline";
                      document.getElementById("invoiceDebtor").innerHTML="<small><em>"+debtorDetails[1]+"</em></small>";
                      document.getElementById("invoiceDebtorAccount").innerHTML="<small><em>"+debtorDetails[2]+"</em></small>";
                      document.getElementById("invoiceDebtorAddress").innerHTML="<small><em>"+debtorDetails[3]+"</em></small>";
                      document.getElementById("invoiceDebtorTelephone").innerHTML="<small><em>"+debtorDetails[4]+"</em></small>";
                      document.getElementById("invoiceDebtorEmail").innerHTML="<small><em><a href = \"mailto:"+debtorDetails[5]+"\">"+debtorDetails[5]+"</a></em></small>";
                      
                    }
                  })
                  
                  
                }
                
              })
              App.contracts.Election.deployed().then(function(instance){
                contractInstance=instance;
                return contractInstance.businessesCount.call();
              }).then(function(dCount){
                var count=dCount.c[0];
                console.log(count);
                
                //for(var i=1; i<=count+1; i++){
                  
                  electionContract.businesses(owner).then(function(businessDetails){
                    console.log(businessDetails[2]);
                    //if(businessDetails[2]===owner){
                      console.log("here");
                      document.getElementById("invoiceHide").style.display="inline";
                      document.getElementById("invoiceBusiness").innerHTML="<b><small><em>"+businessDetails[1]+"</em></small>";
                      document.getElementById("invoiceBusinessAccount").innerHTML="<b><small><em>"+businessDetails[2]+"</em></small>";
                      document.getElementById("invoiceBusinessAddress").innerHTML="<b><small><em>"+businessDetails[3]+"</em></small>";
                      document.getElementById("invoiceBusinessTelephone").innerHTML="<b><small><em>"+businessDetails[4]+"</em></small>";
                      document.getElementById("invoiceBusinessEmail").innerHTML="<small><em><a href = \"mailto:"+businessDetails[5]+"\">"+businessDetails[5]+"</a></em></small>";
                    //}
                  })

                  
                //}
                
              })

              }
          });
        }
      });

      
    });

    $("#rejInvoice").click(async function () {
      var id = $("#rejInvID").val();
      var reason = $("#rejReason").val();

      App.contract.rejectInvoice(id, reason, { from: App.account }, function (error, result) {
        if (error) console.log(error);
        else console.log(result);


      });
    });

    $("#createOffer").click(async function () {
      var invoiceSelect=document.getElementById("invoiceSelect");

      var invoice=invoiceSelect.options[invoiceSelect.selectedIndex].text;
      invoiceId=invoice.split(',')[0];
      var adv = $("#createOfferAdv").val();
      var disc = $("#createOfferDisc").val();

      App.contracts.Election.deployed().then(function(instance) {

        return instance.createOffer(invoiceId, adv, disc, { 
          from: App.account 
        }).then(function(result) {
          console.log(result);
        })
      });
    });

    $("#accOffer").click(async function () {
      var id = $("#acceptOfferID").val();

      App.contract.acceptOffer(id, { from: App.account }, function (error, result) {
        if (error) console.log(error);
        else console.log(result);

      });
    });

    $("#rejOffer").click(async function () {
      var id = $("#rejectOfferID").val();
      var reason = $("#rejectOfferReason").val();

      App.contract.rejectOffer(id, reason, { from: App.account }, function (error, result) {
        if (error) console.log(error);
        else console.log(result);

        console.log(id, reason);
      });
    });

    $("#sendAdvance").click(async function () {
      var id = $("#sendInvID").val();
      var invoiceSelect=document.getElementById("offerSelect");

      var invoice=invoiceSelect.options[invoiceSelect.selectedIndex].text;
      invoiceId=invoice.split(',')[0];
      console.log(invoiceId);


      //Converting int to string as web3 utils require us to do so
      //converting string to wei eventualls


      //Not implemented yet

      App.contracts.Election.deployed().then(function(instance) {
        electionContract = instance;
        return electionContract.offersCount.call();
      }).then(function(oCount) {
        oCount=oCount.c[0];
        console.log(oCount);
        var amount;
        for(var i=0; i <= oCount; i++) {
          electionContract.offers(i).then(function(offer) {
            
            if(offer[0] == invoiceId) {
              var advanceRate=offer[1];
              var discountRate=offer[2];
              electionContract.invoicesCount.call().then(function(iCount){
                iCount=iCount.c[0];
                for(var i=1; i<=iCount; i++){
                  electionContract.invoices(i).then(function(invoice){
                    invId=invoice[0].c[0];
                    console.log(invoiceId," ", invId);
                    if(invoiceId==invId){
                      console.log(i-1);
                      var invID=i-1;
                      amount=invoice[3].c[0];

                      var weiValue=window.web3.toWei(amount.toString(), 'wei');
                      weiValue=(weiValue*advanceRate)/100;
                      
                      electionContract.sendAdvanceRate(invID,{from:App.account, value: weiValue}).then(function(error){
                        if(error){
                          console.log(error);
                        }
                      })
                      
                      console.log(App.account);
                      
                    }
                  })
                }
                
              })
              
              /*
              App.contracts.Election.deployed().then(function(instance) {
                electionContract = instance;
                return electionContract.acceptOffer($offerID)
              }).then(function(error) {
                if (error) console.log(error);
              })
              */
            }
          });
        }
        
      });      
    

    

      //console.log(invoice.amount);
      //let weiValue=web3.utils.toWei(invoice.amount.toString(),'wei');
      //console.log(weiValue);
      /*
      
      */
    });

    $("#withdrawAdvance").click(async function () {
      var id = $("#withdrawInvID").val();

      App.contract.withdrawAdvanceRate(id, { from: App.account }, function (error, result) {
        if (error) console.log(error);
        else console.log(result);

        console.log(id);
      });
    });

    $("#settleInvoice").click(async function () {
      var id = $("#settleInvID").val();


      //Converting int to string as web3 utils require us to do so
      //converting string to wei eventualls
      //var weiValue=window.web3.utils.toWei(advanceRate.toString(), 'wei')

      //Not working yet    
      /*
      
      App.contract.settleInvoice(id,{from: App.account, value:weiValue},function(error,result){
      if(error) console.log(error);
      else console.log(result);
      */
      console.log(id);
    });
    //});

    $("#sendRemaining").click(async function () {
      var id = $("#sendRemainingAmount").val();


      //Converting int to string as web3 utils require us to do so
      //converting string to wei eventualls
      //var weiValue=window.web3.utils.toWei(advanceRate.toString(), 'wei')

      /*
      App.contract.sendRemaining(id,{from: App.account, value:weiValue},function(error,result){
      if(error) console.log(error);
      else console.log(result);
      */
      console.log(id);
    });

    /*
  web3.eth.getCoinbase(function(err,account){
    if(!err){

  App.contract.dataStoring.call(account, function(error,thisData){
    if(!error){
      var thisEvents = $("#MyEvents");
      var id=thisData[0];
      var quantity=thisData[1];
      var refId=thisData[2];
      var sellerAddress=thisData[3];

      var template= "<tr><th>" + id + "</th><td>" + quantity + "</td><td>" + refId + "</td><td>" + sellerAddress + "</td></tr>" 
      if(quantity!=0) thisEvents.append(template);
    }
    else console.log(error);
      });
    }
  })

  App.contract.getNumberOfEvents(function(error,value){
    if(error) 
      console.log(error);
    else{
  
    var bookingEvents = $("#BookingEvents");
    

    for (var i = 1; i <= value; i++) {
          
          App.contract.Events.call( i, function(error,event) {
          if(!error){

          var id=event[0];
          var name = event[1];
          var price = event[5];
          var status = event[6];
          var time=event[7];
          var date=event[8];
          var quantity=event[9];
          var venue=event[10];
          var add=event[3];

          var thisStatus;
          if(quantity==0 && status==false){
            thisStatus="Inactive";
          }
          else if(price!=0 && status==false){
            thisStatus="Available for free";
          }
          else if(price!=0 && status==true && add==0x0000000000000000000000000000000000000000){
            thisStatus="Active";
          }

          else if(add!=0x0000000000000000000000000000000000000000){
            thisStatus="Booked";
          }      
          var bookingTemplate = "<tr><th>" + id + "</th><td>" + name + "</td><td>" + price + "</td><td>" + date + "</td><td>" + time + "</td><td>" + quantity + "</td><td>" + venue + "</td><td>" + thisStatus + "</td></tr>" ;
          
          if(quantity!=0) bookingEvents.append(bookingTemplate);
          }
          else{
            console.log(error);
          }        
        });
    }
    

    }
  });
  */
  }
}

$(function () {
  $(window).load(function () {
    App.init();
  });
});