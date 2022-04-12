var { DecentralizedFileStorage } = require("./ipfs");
var { keccak256Packed } = require("./utils");
var fs = require("fs");

async function main() {
    // Define your ipfs connection url here. 
    // If you started the server from docker-compose, then you can use the container
    // name if you are in the same docker network. Or you can use your computer's
    // ip address, get by `ifconfig`.
    const url = "http://192.168.1.94:5001/api/v0";
    const path = "./docker-compose.yaml";
    
    const ipfs = new DecentralizedFileStorage(url);

    const buffer = keccak256Packed(["string", "string"], ["tom", "2020-12-01"]);
    console.log("keccak256Packed", buffer);

    // Read or generate or data to upload here.
    const content = fs.readFileSync(path);
    const encodedContent = content.toString("hex");
    
    // Encoding
    const cid = await ipfs.save(JSON.stringify(encodedContent));
    console.log("obtained cid", cid);

    // Get the data
    const encoded = await ipfs.find(cid);
    console.log(encoded === encodedContent);

    const recovered = Buffer.from(encoded, 'hex');
    console.log(recovered.equals(content));
    console.log(recovered.toString("ascii"));
}

main().then();