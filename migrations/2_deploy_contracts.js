const CertChain = artifacts.require("CertChain");
const CertNFT = artifacts.require("CertNFT");

module.exports = (deployer, network, accounts) => {
    deployer.deploy(CertNFT).then(function() {
        return deployer.deploy(CertChain, CertNFT.address);
    });
};