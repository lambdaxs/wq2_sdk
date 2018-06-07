//client for nodejs
// (async()=>{
//     try{
//         await initClient([{
//             dbname:'test',
//             rpc_port:5004,
//         }])
//         const rs = await getClient('test').data_model('students').find({})
//         console.log(rs)
//     }catch (err){
//         console.log('err')
//         console.log(err)
//     }
//
// })()
const dnode = require("dnode");

const connectMap = {};
const clientMap = {};

function Client(dbname, nodeClient) {
  this.dbname = dbname;
  this.nodeClient = nodeClient;
}

function default_query_op(value) {
  if (!value || typeof value !== "object") {
    return {};
  } else {
    return value;
  }
}

function check_data(data) {
  return !(!data || typeof data !== "object" || JSON.stringify(data) === "{}");
}

Client.prototype.data_model = function(data_name) {
  this.data_name = data_name;
  return this;
};

Client.prototype.find = function(query, op) {
  query = default_query_op(query);
  op = default_query_op(op);
  op.limit = 100;
  return new Promise(s => {
    this.nodeClient.find(this.data_name, query, op, result => {
      s(JSON.parse(result));
    });
  });
};
Client.prototype.insert = function(data) {
  return new Promise((s, f) => {
    if (!check_data(data)) {
      return f(new Error("data cant be empty"));
    }
    this.nodeClient.insert(this.data_name, data, r => {
      s(JSON.parse(r));
    });
  });
};
Client.prototype.insertMany = function(datas) {
  return new Promise((s, f) => {
    if (!Array.isArray(datas) || datas.length === 0) {
      return f(new Error("datas cont be empty"));
    }
    if (Array.isArray(datas) && datas.length > 100) {
      return f(new Error("datas length cont be more than 100"));
    }
    this.nodeClient.insertMany(this.data_name, datas, r => {
      s(JSON.parse(r));
    });
  });
};
Client.prototype.deleteOne = function(query) {
  query = default_query_op(query);
  return new Promise((s, f) => {
    if (JSON.stringify(query) === "{}") {
      return f(new Error("delete query cont be empty"));
    }
    this.nodeClient.deleteOne(this.data_name, query, r => {
      s(JSON.parse(r));
    });
  });
};
Client.prototype.deleteMany = function(query) {
  query = default_query_op(query);
  return new Promise((s, f) => {
    if (JSON.stringify(query) === "{}") {
      return f(new Error("delete query cont be empty"));
    }
    this.nodeClient.deleteMany(this.data_name, query, r => {
      s(JSON.parse(r));
    });
  });
};
Client.prototype.updateOne = function(query, data) {
  query = default_query_op(query);
  return new Promise((s, f) => {
    if (!check_data(data)) {
      return f(new Error("data cant be empty"));
    }
    this.nodeClient.updateOne(this.data_name, query, data, r => {
      s(JSON.parse(r));
    });
  });
};
Client.prototype.count = function(query) {
  query = default_query_op(query);
  return new Promise((s, f) => {
    this.nodeClient.count(this.data_name, query, r => {
      s(JSON.parse(r));
    });
  });
};
Client.prototype.distinct = function(key, query) {
  query = default_query_op(query);
  return new Promise((s, f) => {
    if (typeof key !== "string") {
      return new Error("key is not string type");
    }
    this.nodeClient.distinct(this.data_name, key, query, r => {
      s(JSON.parse(r));
    });
  });
};
Client.prototype.findOne = function(query, op) {
  query = default_query_op(query);
  op = default_query_op(op);
  return new Promise((s, f) => {
    this.nodeClient.findOne(this.data_name, query, op, r => {
      s(JSON.parse(r));
    });
  });
};
Client.prototype.findOneAndUpdate = function(query, data, op) {
  query = default_query_op(query);
  op = default_query_op(op);
  return new Promise((s, f) => {
    if (!check_data(data)) {
      return f(new Error("data cont be empty"));
    }
    this.nodeClient.findOneAndUpdate(this.data_name, query, data, op, r => {
      s(JSON.parse(r));
    });
  });
};
Client.prototype.findOneAndDelete = function(query, op) {
  query = default_query_op(query);
  op = default_query_op(op);
  return new Promise((s, f) => {
    this.nodeClient.findOneAndDelete(this.data_name, query, op, r => {
      s(JSON.parse(r));
    });
  });
};

const initRPCClient = async (dbname, prot) => {
  const d = dnode.connect(prot);
  const client = await createClient(d);
  connectMap[dbname] = d;
  clientMap[dbname] = new Client(dbname, client);
  console.log(`success link rpc server,dbname is ${dbname} port is ${prot}`);
};

const createClient = d => {
  return new Promise((s, f) => {
    d.on("remote", function(remote) {
      s(remote);
    });
  });
};

const getClient = dbname => {
  return clientMap[dbname];
};

const closeConn = dbname => {
  connectMap[dbname].end();
};

const initClient = async configs => {
  for (let i = 0; i < configs.length; i++) {
    const { dbname, rpc_port } = configs[i];
    await initRPCClient(dbname, rpc_port);
  }
};

module.exports = {
  initClient,
  getClient,
  closeConn
};
