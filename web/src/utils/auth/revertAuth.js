const fs = require('fs');
const path = require('path');
const prettier = require('prettier');

fs.readFile(path.resolve(__dirname, './auth.csv'), 'utf8', (err, data) => {
  const col = data.split(/\r?\n|\r/);
  const arr = col.map(str => {
    return str.split(',');
  });
  let insertStr = '';
  arr.forEach(str => {
    const lineStr = `${str[3]}:'${str[3]}', // ${str[4]}\n`;
    insertStr = lineStr + insertStr;
  });
  console.log(insertStr);
  const writeStr = `
  const auth = {
    ${insertStr}
  }
  export default auth;
  `;
  fs.writeFile(
    path.resolve(__dirname, './index.js'),
    prettier.format(writeStr, { singleQuote: true }),
    err => {
      if (err) throw err;
      console.log('write success!');
    },
  );
});
