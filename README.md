## how to use


```js
import webs from 'wq2_sdk/client/web/index'

(async()=>{
    const {client} = await webs.initRPCClient('ws://127.0.0.1:8082',{debug:true,reconn_time:3000});
    const mgoClient = new webs.MgoClient(client);
    const redisClient = new webs.RedisClient(client);
    
    //mongo find
    const rs = await mgoClient.find({});
     
    //redis get 
    const rs1 = await redisClient.get('name')   
})()
```





  
