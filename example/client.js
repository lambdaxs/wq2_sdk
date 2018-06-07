const nodews = require('../client/node/index');


//node
(async()=>{
    const {client} = await nodews.initRPCClient('ws://localhost:8082',{debug:true});
    const mongoClient = new nodews.MgoClient(client);
    const redisClient = new nodews.RedisClient(client);

    mongoClient.data_model('test').find({}).then(rs=>{
        console.log(rs)
    }).catch(err=>{
        console.log(err)
    });



    redisClient.set('name','xs').then(rs=>{
        console.log(rs);
        redisClient.get('name').then(rs=>{
            console.log(rs)
        }).catch(err=>{
            console.log(err)
        });
    }).catch(err=>{
        console.log(err)
    })


})();

//web
// (async()=>{
//     const webws = require('../client/web/index');
//     const {client} = await webws.initRPCClient('ws://127.0.0.1:8082',{debug:true,reconn_time:3000});
//     const mgoClient = new webws.MgoClient(client);
//     const redisClient = new webws.RedisClient(client);
//
//     mgoClient.data_model('test').find({}).then(rs=>{
//         console.log(rs)
//     }).catch(err=>{
//         console.log(err)
//     });
//
//
//     redisClient.set('name','xs').then(rs=>{
//         console.log(rs);
//         redisClient.get('name').then(rs=>{
//             console.log(rs)
//         }).catch(err=>{
//             console.log(err)
//         });
//     }).catch(err=>{
//         console.log(err)
//     })
// })();
