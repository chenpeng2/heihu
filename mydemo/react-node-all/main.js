const express = require("express");
const app = express();
const port = 8080;
var fs= require('fs');
var router = require("./router")
app.listen(port,()=>console.log(`http://127.0.0.1:${port}/user/select`));
app.use(require("body-parser").json());
app.use(require("body-parser").urlencoded({extended:false}));
//设置跨域
app.all("*",function(req,res,next){
    // res.header("Access-Control-Allow-Origin","*");
	// res.header("Access-Control-Allow-Headers","X-Requested-With");
	// res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
	// res.header("X-Powered-By",' 3.2.1');
	// //res.header("Content-Type","*");  /**/
	// next();
    res.header("Access-Control-Allow-Origin","*");
    res.header("Access-Control-Allow-Headers","*");
    res.header("Access-Control-Allow-Methods","*");
    res.header("X-Powered-By","chenpeng");
    res.header("Content-Type","application/json;charset=utf-8");
    res.header("Access-Control-Allow-Credentials",true);
    req.method.toUpperCase() === "OPTIONS" ? res.sendStatus(200) : next();
});
app.use('/',router)