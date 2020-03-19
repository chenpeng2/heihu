import env from './env';
/**
 * Created by huangyuchen on 11/01/2017.
 */

// conf是webpack编译进来的， webpack会读取项目根目录下的conf.yml文件
console.log(window);
const { dev, feat, test } = env;
window.CONF = CONF;
const getVersion = version => {
  const v = version.split('-');
  v.splice(v.length - 2, 2);
  return v.join('-');
};

const CONFIGURATION = {
  ...CONF,
  isDev: CONF.ENV === 'development',
};

if (test) {
  CONFIGURATION.API = 'https://api2-test.blacklake.cn';
} else if (feat) {
  CONFIGURATION.API = 'https://api2-feature.blacklake.cn';
} else if (dev || CONFIGURATION.isDev) {
  CONFIGURATION.API = 'https://api2-dev.blacklake.cn';
}

export const VERSION = getVersion(CONFIGURATION.VERSION);

export default CONFIGURATION;
