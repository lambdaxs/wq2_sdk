function MgoClient(webClient) {
    this.webClient = webClient;
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

MgoClient.prototype.data_model = function(data_name) {
    this.data_name = data_name;
    return this;
};

MgoClient.prototype.find = function(query, op) {
    query = default_query_op(query);
    op = default_query_op(op);
    op.limit = 100;
    return this.webClient.mgo_find(this.data_name, query, op);
};

MgoClient.prototype.insert = function(data) {
    if (!check_data(data)) {
        throw new Error("data cant be empty");
    }
    return this.webClient.mgo_insert(this.data_name, data);
};

MgoClient.prototype.insertMany = function(datas) {
    if (!Array.isArray(datas) || datas.length === 0) {
        throw new Error("datas cont be empty");
    }
    if (Array.isArray(datas) && datas.length > 100) {
        throw new Error("datas length cont be more than 100");
    }
    return this.webClient.mgo_insertMany(this.data_name, datas);
};

MgoClient.prototype.deleteOne = function(query) {
    query = default_query_op(query);
    if (JSON.stringify(query) === "{}") {
        throw new Error("delete query cont be empty");
    }
    return this.webClient.mgo_deleteOne(this.data_name, query);
};

MgoClient.prototype.deleteMany = function(query) {
    query = default_query_op(query);
    if (JSON.stringify(query) === "{}") {
        throw new Error("delete query cont be empty");
    }
    return this.webClient.mgo_deleteMany(this.data_name, query);
};

MgoClient.prototype.updateOne = function(query, data) {
    query = default_query_op(query);
    if (!check_data(data)) {
        throw new Error("data cant be empty");
    }
    return this.webClient.mgo_updateOne(this.data_name, query, data);
};
MgoClient.prototype.count = function(query) {
    query = default_query_op(query);
    return this.webClient.mgo_count(this.data_name, query);
};
MgoClient.prototype.distinct = function(key, query) {
    query = default_query_op(query);
    if (typeof key !== "string") {
        return new Error("key is not string type");
    }
    return this.webClient.mgo_distinct(this.data_name, key, query);
};
MgoClient.prototype.findOne = function(query, op) {
    query = default_query_op(query);
    op = default_query_op(op);
    return this.webClient.mgo_findOne(this.data_name, query, op);
};
MgoClient.prototype.findOneAndUpdate = function(query, data, op) {
    query = default_query_op(query);
    op = default_query_op(op);
    if (!check_data(data)) {
        throw new Error("data cont be empty");
    }
    return this.webClient.mgo_findOneAndUpdate(this.data_name, query, data, op);
};
MgoClient.prototype.findOneAndDelete = function(query, op) {
    query = default_query_op(query);
    op = default_query_op(op);
    return this.webClient.mgo_findOneAndDelete(this.data_name, query, op);
};

module.exports = {
    MgoClient
};