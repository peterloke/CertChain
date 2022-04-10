// SPDX-License-Identifier: MIT
pragma solidity ^0.8.3;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * Simple NFT contract to CERT.
 */
contract CertNFT is ERC721URIStorage, AccessControl {
    using Strings for uint256;

    bytes32 public const MINTER_ROLE = keccak256("MINTER_ROLE");


    event MintNft(address indexed sender, uint256 startWith);

    uint256 private numTokensMinted;

    


    constructor(
    ) ERC721("CertNFT", "CERT") {
        
        _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());
    }

    function getNumTokensMinted() public view returns(uint256){
        return numTokensMinted;
    }

    function mint(address receiver string memory tokenUri) public onlyRole(MINTER_ROLE) {
        _safeMint(receiver, numTokensMinted);
        _setTokenURI(numTokensMinted, tokenUri);
        emit MintNft(receiver, numTokensMinted);

        numTokensMinted += 1;
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721, AccessControl) returns (bool) {
        return
            interfaceId == type(IERC721).interfaceId ||
            interfaceId == type(IERC721Metadata).interfaceId ||
            super.supportsInterface(interfaceId);
        
    }
}
