// SPDX-License-Identifier: MIT
pragma solidity ^0.8.3;
import "@openzeppelin/contracts/access/AccessControl.sol";
import "./CertNFT.sol";


contract CertChain is AccessControl {
  CertNFT public nftContract;

  bytes32 public const INSTITUTION_ROLE = keccak256("INSTITUTION_ROLE");

  mapping(uint256 => bool) private isActive;
  mapping(bytes32 => uint256[]) private listOfCertsId;
  mapping(uint256 => bytes32) private certholder;



  constructor(CertNFT cnft) {
    nftContract = cnft;
    _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());

  }

  modifier onlyTokenOwner(uint 256 id){
    require(nftContract.ownerOf(id) == _msgSender);
    _;
  }

  function getCertholder(uint256 id) external view returns(bytes32){
        return certholder[id];
  }

  function getIsActiveCert(uint256 id) external view returns(bool) {
        return isActive[id];
  }

  function setIsActiveCert(uint256 id, bool status) external onlyTokenOwner(id) {
        isActive[id] = status;
  }

  function getListOfCertsId(bytes32 certholderId) external view returns(uint256[] memory) {
        return listOfCertsId[certholderId];
  }

  function createCert(bytes32 certholderId, string memory tokenUri) external onlyRole(INSTITUTION_ROLE) {
    uint256 id = nftContract.getNumTokensMinted();
    nftContract.mint(_msgSender, tokenUri);
    _initMetadata(id, certholderId);
  }

    function _initMetadata(uint256 id, bytes32 certholderId) internal {
        isActive[id] = true;
        listOfCertsId[certholderId].push(id);
        certholder[id] = certholderId;
    }
}
