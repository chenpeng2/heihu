const express = require("express");
const router  = express.Router();
module.exports = router;

const config = require("../config/mysql");
const mysql = require("mysql");
const conn = mysql.createConnection(config);
router.all("/select",(req,res) => {
    return res.json({code:0,data:[{"name":"你给"}]})
})