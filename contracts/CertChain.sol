// SPDX-License-Identifier: MIT
pragma solidity ^0.8.3;
import "@openzeppelin/contracts/access/AccessControl.sol";
import "./CertNFT.sol";


contract CertChain is AccessControl {
    CertNFT public certToken;

    bytes32 public constant INSTITUTION_ROLE = keccak256("INSTITUTION_ROLE");
  
    address private _owner;
    mapping(uint256 => bool) private isActive;
    mapping(string => uint256[]) private listOfCertsId;
    mapping(uint256 => string) private certholder;

    event AddedInstitution(address institution);
    event RemovedInstitution(address institution);
    event CreateCert(string certHolder, uint256 tokenId);
    event DeactivateCert(uint256 tokenId);



    constructor(CertNFT cnft) {
        _owner = _msgSender();
        certToken = cnft;
        _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());

    }

    // Only owner of certificate token can access function
    modifier onlyTokenOwner(uint256 id){
        require(certToken.ownerOf(id) == _msgSender(), "Only owner can deactivate certificate");
        _;
    }

    // Set certificate status as deactivated; only owner of cert token can access
    function deactivateCert(uint256 id) external onlyTokenOwner(id) {
        require(isActive[id] == true, "Certificate already deactivated!");

        isActive[id] = false;
        emit DeactivateCert(id);
    }

    // Create cert token; only institutions can create
    function createCert(string memory certholderId, string memory tokenUri) external onlyRole(INSTITUTION_ROLE) returns(uint256) {
        uint256 tokenId = certToken.mint(_msgSender(), tokenUri);
        _initMetadata(tokenId, certholderId);
        emit CreateCert(certholderId, tokenId);

        return tokenId;
    }

    // Sets certificate metadata (hash of cert recipient's details)
    function _initMetadata(uint256 id, string memory certholderId) internal {
        isActive[id] = true;
        listOfCertsId[certholderId].push(id);
        certholder[id] = certholderId;
    }

    // Add Institutions to contract (grants institution role to address)
    function addInstitution(address institution) external {
        grantRole(INSTITUTION_ROLE, institution);

        emit AddedInstitution(institution);
    }

    // Removes Institutions from contract (revokes institution role from address)
    function removeInstitution(address institution) external {
        revokeRole(INSTITUTION_ROLE, institution);
        
        emit RemovedInstitution(institution);
    }

    // Validate certificate; checks if cert is not deactivated and ownership matches
    function validateCert(string memory candidate, uint256 tokenId) external view returns(bool){
        bool certStatus = getIsActiveCert(tokenId);
        if (certStatus) {
            string memory certOwner = getCertholder(tokenId);
            // return candidate == certOwner;
            return compareStrings(candidate, certOwner);
        } else {
            return false;
        }
    }

    // helper method to compare string
    function compareStrings(string memory a, string memory b) internal pure returns (bool) {
        return (keccak256(abi.encodePacked((a))) == keccak256(abi.encodePacked((b))));
    } 

    // getter method(s) 
    function getCertholder(uint256 id) public view returns(string memory){
        return certholder[id];
    }

    function getIsActiveCert(uint256 id) public view returns(bool) {
        return isActive[id];
    }

    function getListOfCertsId(string memory certholderId) external view returns(uint256[] memory) {
        return listOfCertsId[certholderId];
    }
}
