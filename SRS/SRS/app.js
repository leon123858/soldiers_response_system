'use strict';

// 引用linebot SDK
var linebot = require('linebot');
var MongoClient = require('mongodb').MongoClient;
var mongoURL = 'mongodb://localhost:27017/mymondb';
//var mongoURL = 'mongodb + srv://leon1234858:8ntscpal@cluster0.gyixj.gcp.mongodb.net/army?retryWrites=true&w=majority'
// 用於辨識Line Channel的資訊
var bot = linebot({
    channelId: '',
    channelSecret: '',
    channelAccessToken: ''
});

function saveMessage(db, name, date, thing,order) {
    return new Promise((resolve, reject) => {
        db.db("army").collection('solidersData').updateOne({ $and: [{ name: name }, { date: date }] }, { $set: { name: name, date: date, thing: thing, order: order } }, { upsert: true },
            function (err, result) {
                if (err)
                    reject("error");
                else
                    resolve("success");
            });
    });
}

function signUp(db, name, nickName) {
    return new Promise((resolve, reject) => {
        db.db("army").collection('soliders').updateOne({ $and: [{ name: name }, { nickName: nickName }] }, { $set: { name: name, nickName: nickName, order: parseInt(nickName) } }, { upsert: true },
            function (err, result) {
                if (err)
                    reject("error");
                else
                    resolve("success");
            });
    });
}

function ClearSignUp(db, name) {
    return new Promise((resolve, reject) => {
        db.db("army").collection('soliders').deleteOne({ name: name },
            function (err, result) {
                if (err)
                    reject("error");
                else
                    if (result.deletedCount > 0)
                        resolve("success");
                    else
                        reject("do not have this user");
            });
    });
}

function nickNameToName(db, nickName) {
    return new Promise((resolve, reject) => {
        db.db("army").collection('soliders').findOne({ nickName: nickName },
            function (err, result) {
                if (err)
                    reject("error");
                else
                    if (result == null)
                        reject("no exist this nickname");
                    else
                        resolve({ name: result.name, order: result.order });
            })
    });
}

function getList(db, date) {
    return new Promise((resolve, reject) => {
        db.db("army").collection('solidersData').find({ date: date }).sort({ order: 1 }).toArray(
            function (err, result) {
                if (err)
                    reject("error");
                var str = "";
                if (result == null)
                    reject("no exist data");
                else {
                    for (var i = 0; i < result.length; i++)
                        str += "\n" + result[i].name + " " + result[i].thing;
                    resolve(date + "\n步一連訓員 第2班\n今日看診人員：共0員\n發燒人員：共0員\n應到：16員 \n實到：" + result.length + "員" + str);
                }
            });
    });
}

function reply(say, event) {
    // 使用event.reply(要回傳的訊息)方法可將訊息回傳給使用者
    event.reply(say).then(function (data) {
        // 當訊息成功回傳後的處理
    }).catch(function (error) {
        // 當訊息回傳失敗後的處理
        console.log(error);
    });
}

//server action
function serverAction(list, db, say, event) {
    switch (list[1]) {
        case "存訊息":
            var dt = new Date();
            var thing = "";
            for (var i = 4; i < list.length; i++)
                thing += list[i];
            nickNameToName(db, list[2])
                .then(pkg => { saveMessage(db, pkg.name, (parseInt(dt.getFullYear()) - 1911).toString() + "/" + (parseInt(dt.getMonth()) + 1).toString() + "/" + dt.getDate().toString() + " " + list[3], thing,pkg.order) })
                .then(pkg => { say = "存儲成功"; reply(say, event); })
                .catch(error => { say = error; reply(say, event); })
            break;
        case "要資料":
            getList(db, list[2] + " " + list[3])
                .then(pkg => { say = pkg; reply(say, event); })
                .catch(error => { say = error; reply(say, event); })
            break;
        case "使用者註冊":
            signUp(db, list[2] + " " + list[3], list[4])
                .then(pkg => { say = "存儲成功"; reply(say, event); })
                .catch(error => { say = error; reply(say, event); })
            break;
        case "取消註冊":
            ClearSignUp(db, list[2] + " " + list[3])
                .then(pkg => { say = "取消該用戶成功"; reply(say, event); })
                .catch(error => { say = error; reply(say, event); })
            break;
        default:

            break;
    }
}
// 當有人傳送訊息給Bot時
bot.on('message', function (event) {
    var list = event.message.text.split(' ');
    if (list[0] == "卡米狗") {
        var say = "";
        MongoClient.connect(mongoURL, { useNewUrlParser: true, useUnifiedTopology: true }, function (err, db) {
            if (err) {
                say = "db connect error";
                event.reply(say).then(function (data) {
                    // 當訊息成功回傳後的處理
                }).catch(function (error) {
                    // 當訊息回傳失敗後的處理
                    console.log(error);
                });
            } else
                try {
                    serverAction(list, db, say, event);
                } catch (e) {
                    event.reply("你指令打錯了喔, 請檢查一下有沒有多打空白鍵").then(function (data) {
                        // 當訊息成功回傳後的處理
                    }).catch(function (error) {
                        // 當訊息回傳失敗後的處理
                        console.log(error);
                    });
                }
        });
    }
});

// Bot所監聽的webhook路徑與port
bot.listen('/linebot', 1337, function () {
    console.log('linebot server prepare OK');
});