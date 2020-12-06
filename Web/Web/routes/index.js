'use strict';
var express = require('express');
var router = express.Router();
const MongoClient = require("mongodb").MongoClient;

// Connection URL
//const url = "mongodb://localhost:27017";
const url = "mongodb+srv://leon1234858:8ntscpal@cluster0.gyixj.gcp.mongodb.net/army?retryWrites=true&w=majority"
// Database Name
const dbName = "army";

router.get("/", function (req, res) {
    res.render("index", {});
});
//db:army collection:109/XX/XX XX點回報 element: num=>30,include=>1000在家睡覺
router.post("/send", function (req, res) {
    //ctx.body = "koa2 string";
    const when = req.body.when;
    const who = req.body.who;
    const what = req.body.what;

    MongoClient.connect(url, function (err, client) {
        if (err) throw err;
        //console.log("Connected successfully to server");

        const db = client.db(dbName);
        const collection = db.collection(when);
        //.updateOne({ $and: [{ name: name }, { nickName: nickName }] }, { $set: { name: name, nickName: nickName, order: parseInt(nickName) } }, { upsert: true },
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
//date + "\n步一連訓員 第2班\n今日看診人員：共0員\n發燒人員：共0員\n應到：16員 \n實到：" + result.length + "員" + str
router.post("/refresh", function (req, res) {
    //ctx.body = "koa2 string";
    const when = req.body.when;
    //console.log(req.body);
    MongoClient.connect(url, function (err, client) {
        if (err) return "error";
        else console.log("Connected successfully to server");

        const db = client.db(dbName);
        const collection = db.collection(when);
        collection.find({}).toArray(function (err, result) {
            if (err) return "error";
            else {
                //console.log(result);
                var json = {};
                for (var i in result) json[result[i].num] = result[i].include;
                //console.log(json);
                var str =
                    "\n31017 諶品勛：" +
                    json["17"] +
                    "\n" +
                    "31018 吳瑞軒：" +
                    json["18"] +
                    "\n" +
                    "31019 阮甯：" +
                    json["19"] +
                    "\n" +
                    "31020 朱震：" +
                    json["20"] +
                    "\n" +
                    "31021 林純宥：" +
                    json["21"] +
                    "\n" +
                    "31022 陳忠遠：" +
                    json["22"] +
                    "\n" +
                    "31023 陳柏勳：" +
                    json["23"] +
                    "\n" +
                    "31024 林書逸：" +
                    json["24"] +
                    "\n" +
                    "31025 吳駿：" +
                    json["25"] +
                    "\n" +
                    "31026 賴昱誠：" +
                    json["26"] +
                    "\n" +
                    "31027 張友直：" +
                    json["27"] +
                    "\n" +
                    "31028 陳俊豪：" +
                    json["28"] +
                    "\n" +
                    "31029 林昱軒：" +
                    json["29"] +
                    "\n" +
                    "31030 林俊佑：" +
                    json["30"] +
                    "\n" +
                    "31031 徐允璟：" +
                    json["31"] +
                    "\n" +
                    "31032 林則亦：" +
                    json["32"] +
                    "\n";
                client.close();
                //console.log(reply(when, result.length, str));
                res.send(reply(when, result.length, str));
            }
        });
    });
});

function reply(when, length, str) {
    return (
        when +
        "\n步一連訓員 第2班\n今日看診人員：共0員\n發燒人員：共0員\n應到：16員 \n實到：" +
        length +
        "員" +
        str
    );
}

module.exports = router;
