const dnode = require("dnode");

const createNodeRPCServer = (app, options = {}) => {
  const { port } = options;
  const server = dnode(app);
  server.listen(port, function(err) {
    console.log("success start node rpc at " + port);
  });
};

module.exports = {
  createNodeRPCServer
};
