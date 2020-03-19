/* eslint valid-jsdoc: "off" */

'use strict';

/**
 * @param {Egg.EggAppInfo} appInfo app info
 */
module.exports = appInfo => {
  /**
   * built-in config
   * @type {Egg.EggAppConfig}
   **/
  const config = exports = {};

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1584326482408_5062';

  // add your middleware config here
  config.middleware = [];

  // add your user config here
  const userConfig = {
    // myAppName: 'egg',
  };
  /*其他代码*/
  config.view = {
    // 设置ejs为默认的模板引擎
    defaultViewEngine: '.ejs',
    mapping: {
      '.ejs': 'ejs'
    }
  };
  /*其他代码*/
  return {
    ...config,
    ...userConfig,
  };
};
