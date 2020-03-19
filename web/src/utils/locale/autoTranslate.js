const fs = require('fs');
const path = require('path');
const translate = require('@vitalets/google-translate-api');
const CNJson = require('./languageFiles/zhCN/web-cn.json');
const ENJson = require('./languageFiles/enUS/web-en.json');

const argv = process.argv.slice(2);
const words = argv;
const userKey = '0';
const userKeyNumbers = [];

Object.keys(CNJson).forEach(key => {
  if (key.indexOf(`key-${userKey}`) !== -1) {
    userKeyNumbers.push(parseInt(key.split('-')[2], 10));
  }
});

const maxNumber = Math.max(...userKeyNumbers);
words.forEach(word => {
  CNJson[`key-${userKey}-${maxNumber + 1}`] = word;
  translate(word, { to: 'en', tld: 'cn' }).then(res => {
    const { text } = res;
    ENJson[`key-${userKey}-${maxNumber + 1}`] = text;
    fs.writeFile(path.resolve(__dirname, 'languageFiles/zhCN/web-cn.json'), JSON.stringify(CNJson, null, 2), err => {
      if (err) {
        console.log(err);
      }
    });
    fs.writeFile(path.resolve(__dirname, 'languageFiles/enUS/web-en.json'), JSON.stringify(ENJson, null, 2), err => {
      if (err) {
        console.log(err);
      }
    });
  });
});
