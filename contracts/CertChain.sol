// SPDX-License-Identifier: MIT
pragma solidity ^0.8.3;
import "@openzeppelin/contracts/access/AccessControl.sol";
import "./CertNFT.sol";


contract CertChain is AccessControl {
  CertNFT public certToken;

  bytes32 public constant INSTITUTION_ROLE = keccak256("INSTITUTION_ROLE");

  address private _owner;
  mapping(uint256 => bool) private isActive;
  mapping(bytes32 => uint256[]) private listOfCertsId;
  mapping(uint256 => bytes32) private certholder;

  event AddedInstitution(address institution);
  event RemovedInstitution(address institution);
  event CreateCert(bytes32 certHolder, uint256 tokenId);
  event DeactivateCert(uint256 tokenId);

  constructor(CertNFT cnft) {
    _owner = _msgSender();
    certToken = cnft;
    _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());

  }

  modifier onlyTokenOwner(uint256 id){
    require(certToken.ownerOf(id) == _msgSender());
    _;
  }

  function getCertholder(uint256 id) public view returns(bytes32){
        return certholder[id];
  }

  function getIsActiveCert(uint256 id) public view returns(bool) {
        return isActive[id];
  }

  function deactivateCert(uint256 id) external onlyTokenOwner(id) {
    require(isActive[id] == true, "Certificate already deactivated!");
    isActive[id] = false;
    emit DeactivateCert(id);
  }

  function getListOfCertsId(bytes32 certholderId) external view returns(uint256[] memory) {
        return listOfCertsId[certholderId];
  }

  function createCert(bytes32 certholderId, string memory tokenUri) external onlyRole(INSTITUTION_ROLE) returns(uint256) {
    // uint256 id = certToken.getNumTokensMinted();
    // _initMetadata(id, certholderId);

    uint256 tokenId = certToken.mint(_msgSender(), tokenUri);
    _initMetadata(tokenId, certholderId);
    emit CreateCert(certholderId, tokenId);

    return tokenId;
  }

  function _initMetadata(uint256 id, bytes32 certholderId) internal {
      isActive[id] = true;
      listOfCertsId[certholderId].push(id);
      certholder[id] = certholderId;
  }

  function addInstitution(address institution) external {
      grantRole(INSTITUTION_ROLE, institution);

      emit AddedInstitution(institution);
  }

  function removeInstitution(address institution) external {
      revokeRole(INSTITUTION_ROLE, institution);
      
      emit RemovedInstitution(institution);
  }

  function validateCert(bytes32 candidate, uint256 tokenId) external view returns(bool){
      bool certStatus = getIsActiveCert(tokenId);
      if (certStatus) {
          bytes32 certOwner = getCertholder(tokenId);
          return candidate == certOwner;
      } else {
          return false;
      }
  }
}
