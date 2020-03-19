var express = require('express')
var router = express.Router()
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/runoob";
 
MongoClient.connect(url, { useNewUrlParser: true }, function(err, db) {
  if (err) throw err;
  console.log("数据库已创建!");
  var dbo = db.db("runoob");
  var myobj =  [
    { name: '菜鸟工具', url: 'https://c.runoob.com', type: 'cn'},
    { name: 'Google', url: 'https://www.google.com', type: 'en'},
    { name: 'Facebook', url: 'https://www.google.com', type: 'en'}
   ];
    dbo.collection("site").insertMany(myobj, function(err, res) {
        if (err) throw err;
        console.log("插入的文档数量为: " + res.insertedCount);
        db.close();
    });
});
MongoClient.connect(url, { useNewUrlParser: true }, function(err, db) {
    if (err) throw err;
    var dbo = db.db("runoob");
    dbo.collection("site"). find({}).toArray(function(err, result) { // 返回集合中所有数据
        if (err) throw err;
        console.log("查询数据为: " ,result);
        db.close();
    });
});
router.get("/",(req,res)=>{
    res.send("/")
})
router.get("/one",(req,res)=>{
    res.send("one")
})
router.get("/second",(req,res)=>{
    res.send("second")
})
router.get("/treen",(req,res)=>{
    res.send("treen")
})
module.exports = router;