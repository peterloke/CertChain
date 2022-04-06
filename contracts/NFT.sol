// SPDX-License-Identifier: MIT
pragma solidity ^0.8.3;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * Simple NFT contract to CERT.
 */
contract Nft is ERC721URIStorage, AccessControl {
    using Strings for uint256;


    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    event MintNft(address indexed sender, uint256 startWith);
    event BaseURIChanged(string baseURI);

    uint256 public numTokensMinted;
    uint256 public maxSupply;

    /* The base url for nft tokens */
    string public baseTokenURI;

    mapping(uint256 => bool) private isActive;
    mapping(bytes32 => uint256[]) private listOfCertsId;
    mapping(uint256 => bytes32) private certholder;


    constructor(
        string memory initialURI,
        uint256 _maxSupply
    ) ERC721("CertNFT", "CERT") {
        baseTokenURI = initialURI;
        maxSupply = _maxSupply;
        
        _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());
    }

    function getCertholder(uint256 id) external view returns(bytes32){
        return certholder[id];
    }

    function getIsActiveCert(uint256 id) external view returns(bool) {
        return isActive[id];
    }

    function setIsActiveCert(uint256 id, bool status) external onlyRole(DEFAULT_ADMIN_ROLE) {
        isActive[id] = status;
    }

    function getListOfCertsId(bytes32 certholderId) external view returns(uint256[] memory) {
        return listOfCertsId[certholderId];
    }

    function setMaxSupply(uint256 _maxSupply) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(_maxSupply > maxSupply, "Invalid max supply");
        maxSupply = _maxSupply;
    }

    function setBaseURI(string memory baseURI) external onlyRole(DEFAULT_ADMIN_ROLE) {
        baseTokenURI = baseURI;
        emit BaseURIChanged(baseURI);
    }

    function _baseURI() internal view virtual override returns (string memory) {
        return baseTokenURI;
    }

    function _initMetadata(uint256 id, bytes32 certholderId) internal {
        isActive[id] = true;
        listOfCertsId[certholderId].push(id);
        certholder[id] = certholderId;
    }

    function mint(address receiver, bytes32 certholderId, string memory tokenUri) external onlyRole(MINTER_ROLE) {
        require(numTokensMinted < maxSupply, "Exceeding max supply");

        _safeMint(receiver, numTokensMinted);
        _setTokenURI(numTokensMinted, tokenUri);
        _initMetadata(numTokensMinted, certholderId);
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
