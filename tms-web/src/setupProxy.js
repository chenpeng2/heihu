const proxy = require("http-proxy-middleware");
 
module.exports = function(app) {
  app.use(
    proxy("/tmsqc/mock/**", {
      target: "http://localhost:8000/mock",
      changeOrigin: true
    })
  );
};