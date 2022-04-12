var ethers = require("ethers");

/**
 * Create hash of data.
 * Sample: 
 *  keccak256Packed(["string", "string"], ["tom", "2020-12-01"])
 * @param {The solidity types of each data element} types string[]
 * @param {The data to be hashed} data any[]
 * @returns Buffer
 */
function keccak256Packed(types, data) {
    let hex = ethers.utils.solidityPack(types, data).substr(2); // remove starting "0x"
    const buf = Buffer.from(hex, "hex");
    hex = ethers.utils.keccak256(buf).substr(2); // remove starting "0x"
    return Buffer.from(hex, "hex");
}

module.exports = { keccak256Packed };