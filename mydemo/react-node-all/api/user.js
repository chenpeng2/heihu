const express = require("express");
const router  = express.Router();
module.exports = router;
var request = require('request');
const config = require("../config/mysql");
const mysql = require("mysql");
const conn = mysql.createConnection(config);
router.all("/select",(req,res) => {
    request('http://www.liulongbin.top:3005/api/getlunbo', function (error, response, body) {
    if (!error && response.statusCode == 200) {
        console.log(body) // Show the HTML for the baidu homepage.
        // return res.json({code:0,data:body})
        res.send(body)
    }
    })
    // res.json({code:0,data:[{"name":"你给"}]})
})