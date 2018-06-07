/**
 * client for web
 * e.g. 获取rpc客户端连接 const {client} = await webs.initRPCClient('ws://127.0.0.1:8082',{debug:true,reconn_time:3000});
 * e.g. 获取mgoModel客户端，操作mongo数据 const mgo = new MgoClient(client);
 * 默认的gc时间间隔为30s 断线重连间隔为1s
 * options={debug,gc_time,reconn_time,env}
 * todo env分为开发环境和发布环境
 * todo 开发环境下直接组装基础的后端函数为固定的业务层
 * todo 发布环境下通过cli工具把业务层转换为一份业务函数清单注入客户端，再把业务层实现直接搬到后端，以保证在后端控制业务逻辑 对客户端屏蔽具体的业务实现
 */
const uuid = require("uuid/v1");
const rws = require("reconnectingwebsocket");
const mgo = require('../common/mgo');
const redis = require('../common/redis');

const initRPCClient = async function(path, options = {}) {
  let func_callback_map = {};
  let func_list = [];
  let client = {};

  const { debug = false, gc_time = 30000, reconn_time = 1000 } = options;

  const reg_server_func_list = function(ws, callback) {
    const func_id = uuid();
    func_callback_map[func_id] = {
      callback,
      complete: false
    };
    ws.send(
      JSON.stringify({
        func_id,
        get_list: true
      })
    );
  };

  const call_server_func = function(ws, func_name, args, callback) {
    const func_id = uuid();
    func_callback_map[func_id] = {
      callback,
      complete: false
    };
    ws.send(
      JSON.stringify({
        func_id,
        func_name,
        args
      })
    );
  };

  const handler_data = async function(message) {
    const data = JSON.parse(message);
    const { func_id, msg_id } = data;
    if (func_id && func_callback_map[func_id]) {
      //rpc call
      const { callback } = func_callback_map[func_id];
      callback(data);
      func_callback_map[func_id].complete = true;
    } else if (msg_id) {
      //todo server msg push
      console.log("server push msg");
      console.log(data);
    }
  };

  //gc 清理已经执行完的函数结果
  setInterval(function() {
    if (Object.keys(func_callback_map).length > 0) {
      Object.keys(func_callback_map).forEach(function(v) {
        if (func_callback_map[v].complete) {
          delete func_callback_map[v];
        }
      });
    }
  }, gc_time);

  return new Promise(function(s, f) {
    let ws = new rws(path, null, {
      debug: debug,
      reconnectInterval: reconn_time
    });
    ws.onopen = function() {
      ws.onmessage = function(message) {
        handler_data(message.data);
      };


      //注册服务端函数列表
      reg_server_func_list(ws, function(msg) {
        func_list = msg.data;
        //初始化客户端原生函数
        if (Array.isArray(func_list)) {
          func_list.forEach(function(v) {
            client[v] = function() {
                const args = Array.from(arguments);
                return new Promise(function(s1,f1) {
                    call_server_func(ws, v, args, function(rs)  {
                        const server_data = JSON.parse(rs.data);
                        if (server_data.code===0){
                            s1(server_data.data);
                        }else {
                            f1(new Error(`code:${server_data.code} msg:${server_data.msg}`));
                        }
                    });
                });
            };
          });
        }
        s({ client, ws });
      });
    };
    ws.onclose = function() {
      console.log("close socket at " + path);
    };
    ws.onerror = function(err) {
      console.log("error socket at " + path);
      console.log("error is " + err.message);
      f(err);
    };
  });
};

export default {
    initRPCClient,
    MgoClient:mgo.MgoClient,
    RedisClient:redis.RedisClient,
};
