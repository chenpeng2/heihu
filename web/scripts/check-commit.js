const chalk = require('chalk');

function exitProcess(code = 1) {
  console.log('');
  process.exit(code);
}

function checkNetworkEnv() {
  const args = process.argv.splice(2);
  const env = require(args[0]);
  if (env) {
    const { dev, feat, test } = env;
    if (dev || feat || test) {
      console.log(chalk.yellow('👊 src/config/env中环境变量被改了! 👊'));
      exitProcess();
    }
  }
}

checkNetworkEnv();
