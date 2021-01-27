
const Elections = artifacts.require("Election");



module.exports = function(deployer) {
  deployer.deploy(Elections);
};
