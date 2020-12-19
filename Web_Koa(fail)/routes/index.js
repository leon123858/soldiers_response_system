const router = require("koa-router")();
const MongoClient = require("mongodb").MongoClient;

// Connection URL
const url = "mongodb://localhost:27017";
// Database Name
const dbName = "army";

router.get("/", async (ctx, next) => {
  await ctx.render("index", {});
});
//db:army collection:109/XX/XX XX點回報 element: num=>30,include=>1000在家睡覺
router.post("/send", async (ctx, next) => {
  //ctx.body = "koa2 string";
  const when = ctx.request.body.when;
  const who = ctx.request.body.who;
  const what = ctx.request.body.what;

  MongoClient.connect(url, function (err, client) {
    if (err) throw err;
    console.log("Connected successfully to server");

    const db = client.db(dbName);
    const collection = db.collection(when);

    // Insert some documents
    collection.insertOne({ num: who, include: what }, function (err, result) {
      if (err) ctx.body = "error";
      else {
        client.close();
        ctx.body = "success";
      }
    });
  });
});
//date + "\n步一連訓員 第2班\n今日看診人員：共0員\n發燒人員：共0員\n應到：16員 \n實到：" + result.length + "員" + str
router.post("/refresh", async (ctx, next) => {
  //ctx.body = "koa2 string";
  const when = ctx.request.body.when;
  //console.log(ctx.request.body);
  ctx.body = await MongoClient.connect(url, function (err, client) {
    if (err) return "error";
    else console.log("Connected successfully to server");

    const db = client.db(dbName);
    const collection = db.collection(when);
    collection.find({}).toArray(function (err, result) {
      if (err) return "error";
      else {
        var json = {};
        for (var i in result) json[result[i].num] = result[i].include;
        var str =
         
        client.close();
        console.log(reply(when, result.length, str));
        return reply(when, result.length, str);
      }
    });
  });
});

function promise() {
  return new Promise(function (resolve, reject) {});
}

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
