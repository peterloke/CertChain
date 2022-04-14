// SPDX-License-Identifier: MIT
pragma solidity ^0.8.3;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * Simple NFT contract to CERT.
 */
contract CertNFT is ERC721URIStorage, AccessControl {
    using Counters for Counters.Counter;
    using Strings for uint256;

    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    address private _owner;
    Counters.Counter private _tokenIds;
    
    // uint256 private numTokensMinted;
    // event MintNft(address indexed sender, uint256 startWith);
    event MintNft(address indexed sender, uint256 tokenId);
    event AddedMinter(address institution);
    event RemovedMinter(address institution);



    constructor() ERC721("CertNFT", "CERT") {
        _owner = _msgSender();
        _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());
    }

    // function getNumTokensMinted() public view returns(uint256){
    //     return numTokensMinted;
    // }

    function mint(address receiver, string calldata tokenUri) public onlyRole(MINTER_ROLE) returns(uint256) {
        _tokenIds.increment();
        uint256 newId = _tokenIds.current();
        // _safeMint(receiver, numTokensMinted);
        // _setTokenURI(numTokensMinted, tokenUri);
        
        _safeMint(receiver, newId);
        _setTokenURI(newId, tokenUri);

        emit MintNft(receiver, newId);

        return newId;
        // emit MintNft(receiver, numTokensMinted);

        // numTokensMinted += 1;
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721, AccessControl) returns (bool) {
        return
            interfaceId == type(IERC721).interfaceId ||
            interfaceId == type(IERC721Metadata).interfaceId ||
            super.supportsInterface(interfaceId);
        
    }

    function getContractOwner() public view returns(address) {
        return _owner;
    }

    function addMinter(address institution) external {
      grantRole(MINTER_ROLE, institution);

      emit AddedMinter(institution);
  }

  function removeMinter(address institution) external {
      revokeRole(MINTER_ROLE, institution);
      
      emit RemovedMinter(institution);
  }
}
