/**
 * createWebRPCServer(app,{port,keepAlive_time,ssl})
 */
const WebSocket = require("ws");
const fs = require("fs");
const https = require("https");
const path = require("path");

const createWebRPCServer = (app = {}, options = {}) => {
  const { port = 8080, keepAlive_time = 30000, ssl = false } = options;

  let wss = null;
  if (ssl) {
    const dir = path.resolve(__dirname, "..");
    const server = new https.createServer({
      cert: fs.readFileSync(dir + "/config/server.cer"),
      key: fs.readFileSync(dir + "/config/server.pem")
    });
    wss = new WebSocket.Server({ server });
    server.listen(port);
  } else {
    wss = new WebSocket.Server({
      port,
      perMessageDeflate: {
        zlibDeflateOptions: {
          // See zlib defaults.
          chunkSize: 1024,
          memLevel: 7,
          level: 3
        },
        zlibInflateOptions: {
          chunkSize: 10 * 1024
        },
        // Other options settable:
        clientNoContextTakeover: true, // Defaults to negotiated value.
        serverNoContextTakeover: true, // Defaults to negotiated value.
        clientMaxWindowBits: 10, // Defaults to negotiated value.
        serverMaxWindowBits: 10, // Defaults to negotiated value.
        // Below options specified as default values.
        concurrencyLimit: 10, // Limits zlib concurrency for perf.
        threshold: 1024 // Size (in bytes) below which messages
        // should not be compressed.
      }
    });
  }

  //连接的时候检查客户端ip，做客户端ip白名单设置
  function checkIp(req) {
    let ip = req.connection.remoteAddress;
    if (ip) {
      ip = ip.split(":").pop();
      console.log(ip);
    }
  }

  function heartbeat() {
    this.isAlive = true;
  }

  function keepAlive(ws) {
    ws.isAlive = true;
    ws.on("pong", heartbeat);
  }

  wss.on("connection", function connection(ws, req) {
    //ip白名单过滤
    checkIp(req);
    //ping-pong关闭无效链接
    keepAlive(ws);
    //通讯
    ws.on("message", function incoming(message) {
      handler(ws, message);
    });
  });

  //30s确保连接存活
  setInterval(function() {
    wss.clients.forEach(function(ws) {
      if (ws.isAlive === false) {
        return ws.terminate();
      }
      ws.isAlive = false;
      ws.ping(function() {});
    });
  }, keepAlive_time);

  //处理客户端发送的消息
  async function handler(ws, message) {
    const params = JSON.parse(message);
    if (typeof params === "object") {
      if (params.func_name) {
        //调用函数
        const { func_name = "", args = [], func_id } = params;
        if (app[func_name]) {
          let result = app[func_name](...args);
          if (result instanceof Promise) {
            //处理异步函数
            result = await result;
          }
          return ws.send(
            JSON.stringify({
              func_id,
              data: result
            })
          );
        } else {
          console.log(
            `func_name is lost func_id ${func_id} func_name ${func_name} args ${args}`
          );
        }
      }
      if (params.get_list === true) {
        //发送函数列表,初始化客户端原生函数,数据源固定在客户端升级，除数据源之外的rpc进行返回
        return ws.send(
          JSON.stringify({
            func_id: params.func_id,
            data: Object.keys(app) //TODO 在客户端注册静态数据源函数 filter(v=>{return !v.startsWith('redis_') && !v.startsWith('mgo_');})
          })
        );
      }
    }
  }

  //todo painc 后端的server要保持健壮。。不能挂
  wss.on("error", function(err) {
    console.log(err);
    console.log("server error");
  });

  console.log("start web rpc server at " + port);
  return wss;
};

module.exports = {
  createWebRPCServer
};
