'use strict';
var express = require('express');
var router = express.Router();
const MongoClient = require("mongodb").MongoClient;

// Connection URL
//local mongoDB URL
//const url = "mongodb://localhost:27017";
//cloud mongoDB URL
const url = "mongodb+srv://leon1234858:8ntscpal@cluster0.gyixj.gcp.mongodb.net/army?retryWrites=true&w=majority"
// Database Name
const dbUsers = "armyUsers";

//the URL that we can connect to this Web(door of this Web)
router.get("/index/:token", function (req, res) {
    res.render("index", { token: req.params.token });
});
router.get("/", function (req, res) {
    res.render("set", {});
});
/******************************************************
post: buildClass ,use it to build a collection which can let Web know who are in the class
db:armyUsers collection: 3B1C2(班級編號) element: num=>30, include=>31030 林俊佑
token: 3B1C2H16 => x(營)Bx(連)Cx(班)Hx(人數)
*******************************************************/
router.post("/buildClass", function (req, res) {
    //name:collection name, data: the elements in collections, it is a string can be split by <-> and <_>
    const name = req.body.name;
    const data = req.body.data;//num_include-num_include-..........-num_include

    MongoClient.connect(url, function (err, client) {
        if (err) throw err;
        IsExistCollection(name, client)
            .then(bool => insertClassData(name, data, client))
            .then(bool => res.end("success"))
            .catch(bool => res.end("error"))
    });
});
//check if this class have exist
function IsExistCollection(name, client) {
    return new Promise((resolve, reject) => {
        var db = client.db(dbUsers);
        db.listCollections({ name: name })
            .next(function (err, collinfo) {
                err ? reject(false) : (collinfo ? reject(true) : resolve(false));
            });
    });
}
//record all users in the class
function insertClassData(name, data, client) {
    return new Promise((resolve, reject) => {
        var table = client.db(dbUsers).collection(name);
        //split "data"
        var numList = [];
        var includeList = [];
        data.split("-").forEach(element => {
            numList.push(element.split("_")[0]);
            includeList.push(element.split("_")[1]);
        });
        var jsonList = [];
        for (var i in numList) {
            var json = {};
            json["num"] = numList[i];
            json["include"] = includeList[i];
            jsonList.push(json);
        }
        table.insertMany(jsonList, function (err, result) {
            err ? reject(false) : resolve(true);
        })
    });
}
/*****************************************
 post:send Record => 'when'? 'who' do "what"
 db:army collection:109/XX/XX XX點回報 element: num=>30,include=>1000在家睡覺
  *****************************************/

router.post("/send", function (req, res) {
    const token = req.body.token;//each class have it's own db to save data,db's name is it's token
    const when = req.body.when;
    const who = req.body.who;
    const what = req.body.what;

    MongoClient.connect(url, function (err, client) {
        if (err) throw err;
        //console.log("Connected successfully to server");
        const db = client.db(token);
        const collection = db.collection(when);
        // Insert some documents
        collection.updateOne({ num: who }, { $set: { num: who, include: what } }, { upsert: true }, function (err, result) {
            if (err) res.send("error");
            else {
                client.close();
                res.send("success");
            }
        });
    });
});
/*****************************************
 post:refresh => use token to find db, and use when to get goal, finally,return it
  *****************************************/
//date + "\n步一連訓員 第2班\n今日看診人員：共0員\n發燒人員：共0員\n應到：16員 \n實到：" + result.length + "員" + str
router.post("/refresh", function (req, res) {
    const token = req.body.token;//each class have it's own db to save data,db's name is it's token
    const when = req.body.when;
    //console.log(req.body);
    MongoClient.connect(url, function (err, client) {
        if (err) throw "error";
        getUsers(token, client)
            .then(pkg => getResponse(pkg, token, when, client))
            .then(re => res.send(re))
            .catch(error => res.send(error));
    });
});

function getUsers(token, client) {
    return new Promise((resolve, reject) => {
        var table = client.db(dbUsers).collection(token);
        table.find({}).toArray(function (err, result) {
            err ? reject({ result: "connect error" }) : resolve(result);
        })
    });
}

function getResponse(pkg,token,when,client) {
    return new Promise((resolve, reject) => {
        var table = client.db(token).collection(when);
        table.find({}).toArray(function (err, result) {
            if (err)
                reject("connect error");
            else {
                var json = {};
                for (var i in result) json[result[i].num] = result[i].include;
                var str = "";
                for (var i in pkg)
                    str += "\n" + pkg[i].include + " : " + json[pkg[i].num];
                resolve(reply(token,when, result.length, str));
            }
        })
    });
}

function reply(token,when, length, str) {
    return (
        when +
        "\n步" + token[2] + "連訓員 第" + token[4] + "班\n今日看診人員：共0員\n發燒人員：共0員\n應到：" + token.split('H')[1] + "員 \n實到：" +
        length +
        "員" +
        str
    );
}

module.exports = router;

//var json = {};
//for (var i in result) json[result[i].num] = result[i].include;
////console.log(json);
//var str =
//    "\n31017 諶品勛：" +
//    json["17"] +
//    "\n" +
//    "31018 吳瑞軒：" +
//    json["18"] +
//    "\n" +
//    "31019 阮甯：" +
//    json["19"] +
//    "\n" +
//    "31020 朱震：" +
//    json["20"] +
//    "\n" +
//    "31021 林純宥：" +
//    json["21"] +
//    "\n" +
//    "31022 陳忠遠：" +
//    json["22"] +
//    "\n" +
//    "31023 陳柏勳：" +
//    json["23"] +
//    "\n" +
//    "31024 林書逸：" +
//    json["24"] +
//    "\n" +
//    "31025 吳駿：" +
//    json["25"] +
//    "\n" +
//    "31026 賴昱誠：" +
//    json["26"] +
//    "\n" +
//    "31027 張友直：" +
//    json["27"] +
//    "\n" +
//    "31028 陳俊豪：" +
//    json["28"] +
//    "\n" +
//    "31029 林昱軒：" +
//    json["29"] +
//    "\n" +
//    "31030 林俊佑：" +
//    json["30"] +
//    "\n" +
//    "31031 徐允璟：" +
//    json["31"] +
//    "\n" +
//    "31032 林則亦：" +
//    json["32"] +
//    "\n";
//client.close();
////console.log(reply(when, result.length, str));
//res.send(reply(when, result.length, str));