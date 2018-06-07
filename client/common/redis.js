const redisFunc = {
    key: ['del','dump','exists','expire','expireat','keys','migrate','move','object','persist','pexpire','pexpireat','pttl','randomkey','rename','renamenx','restore','sort','ttl','type','scan'],
    string:['append','bitcount','bitop','bitfield','decr','decrby','get','getbit','getrange','getset','incr','incrby','incrbyfloat','mget','mset','msetnx','psetex','set','setbit','setex','setnx','setrange','strlen'],
    hash:['hdel','hexists','hget','hgetall','hincrby','hincrbyfloat','hkeys','hlen','hmget','hmset','hset','hsetnx','hvals','hscan','hstrlen'],
    list:['blpop','brpop','brpoplpush','lindex','linsert','llen','lpop','lpush','lpushx','lrange','lrem','lset','ltrim','rpop','rpoplpush','rpush','rpushx'],
    set:['sadd','scard','sdiff','sdiffstore','sinter','sinterstore','sismember','smembers','smove','spop','srandmember','srem','sunion','sunionstore','sscan'],
    zset:['zadd','zcard','zcount','zincrby','zrange','zrangebyscore','zrank','zrem','zremrangebyrank','zremrangebyscore','zrevrange','zrevrangebyscore','zrevrank','zscore','zunionstore','zinterstore','zscan','zrangebylex','zlexcount','zremrangebylex']
};

function RedisClient(webClient) {
    this.webClient = webClient;
}

Object.keys(redisFunc).forEach(function(key){
    redisFunc[key].forEach(function(funcName){
        RedisClient.prototype[funcName] = function(){
            return this.webClient[`redis_${funcName}`](...Array.from(arguments))
        }
    })
});

module.exports = {
    RedisClient
};
