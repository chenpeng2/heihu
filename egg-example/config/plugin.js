module.exports = {
  // had enabled by egg
  static: {
    enable: true,
  },
  // 开启ejs模板插件
  ejs: {
    enable: true,
    package: 'egg-view-ejs',
  }
};

// 简化形式 exports.key = value
// exports.ejs = {
//   enable: true,
//   package: 'egg-view-ejs'
// }

// 函数形式
// module.exports = () => {
//   return {
//     ejs: {
//
//     }
//   }
// }