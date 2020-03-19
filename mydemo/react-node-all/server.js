var http = require('http');
var fs= require('fs');
var server = http.createServer(function(request,response){
    var url = request.url;
    if (request.url === '/' || request.url === '/index') {
        fs.readFile('./index.html', function(err, data){
            if(!err){
                response.writeHead(200, {"Content-Type": "text/html;charset=UTF-8"});
                response.end(data)
            }else{
                throw err;
            }
        });
      }
      // 如果链接的路径是 /login 时，返回的页面的 login 页面
      else if (request.url === '/login') {
        
      }
      // 如果链接的路径是 /register 时，返回的页面的 register 页面
      else if (request.url === '/register') {
         
      }
      else if (request.url === '/data') {
        fs.readFile('./data.json',function(err,data){
            if(!err){
                response.writeHead(200,{"Content-Type":"application/json"});
                response.end(data)
            }else{
                throw err
            }
        })
      }
      // 如果链接的路径都不是上面定义的路径，返回 404 没有此页面
      else {
        console.log("错误");
      }
})
server.listen(8080);
console.log('Server is running at http://127.0.0.1:8080/');