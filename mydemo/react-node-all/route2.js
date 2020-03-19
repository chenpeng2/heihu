var http = require('http');
var url = require('url');
var fs = require('fs');
var hostname = '127.0.0.1';
var port = 8080;
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/runoob');
var user = require('./models/user').user;
console.log(user)
const server = http.createServer((req,res)=>{  //箭头函数
    var pathname = url.parse(req.url).pathname;  //找出浏览器请求的 URL 路径
    if(req.url!=='/favicon.ico'){   // 去掉/favicon.ico 请求
        console.log(pathname);
        console.log('Request for ' + pathname + ' received.');
        function showPaper(path,status){
            var content = fs.readFileSync(path);
            res.writeHead(status, { 'Content-Type': 'text/html;charset=utf-8' });
            res.write(content);
            res.end();
        }    
        switch(pathname){
            case '/':
            case '/product':     //'商品列表页'
                showPaper('./html/product.html',200);
                break;
            case '/details':    //'商品详情页'
                showPaper('./html/details.html',200);   
                break;
            default:
                showPaper('./html/my.html',200);  //'我的页'
                break;                            
        }   
    } 
}).listen(port,hostname,()=>{   //监听
    console.log(`Server running at http://${hostname}:${port}/`);
});