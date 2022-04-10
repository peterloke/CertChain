var http = require("http");
var https = require("https");
var ipfsHttpClient = require("ipfs-http-client");

class DecentralizedFileStorage {
    ipfs;
  
    constructor(url) {
      const agentOptions = {
        keepAlive: true,
        keepAliveMsecs: 60 * 1000,
        // Similar to browsers which limit connections to six per host
        maxSockets: 6
      };
  
      const agent = url?.startsWith('http') ? new http.Agent(agentOptions) : new https.Agent(agentOptions);
  
      let options = {
        agent: agent
      };
  
      if (url !== undefined) {
        options.url = url;
      }
  
      this.ipfs = ipfsHttpClient.create(options);
    }
  
    get isOnline() {
      return this.ipfs.isOnline();
    }
  
    async id() {
      return this.ipfs.id();
    }
  
    async version() {
      return this.ipfs.version();
    }


    // For content, pls use string type
    async save(content) {
      const result = await this.ipfs.add(content);
      return result.cid.toString();
    }
  
    async find(cid) {
      let data = '';
      const stream = this.ipfs.cat(ipfsHttpClient.CID.parse(cid));
      for await (const chunk of stream) {
        data += chunk.toString();
      }
      return data;
    }
  }

module.exports = { DecentralizedFileStorage };