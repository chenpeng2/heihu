import XLSX from 'xlsx';
import _ from 'lodash';

function xlsxtoArray(workbook) {
  let result = [];
  workbook.SheetNames.forEach(sheetName => {
    const roa = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {
      header: 1,
      blankrows: false, // 为了不生成空行 https://github.com/SheetJS/js-xlsx
    });
    if (roa.length) {
      result = [...result, ...roa];
    }
  });
  return result;
}

function xlsxToJson(workbook) {
  let result = [];
  workbook.SheetNames.forEach(sheetName => {
    const roa = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {
      header: 2,
    });
    if (roa.length) {
      result = [...result, ...roa];
    }
  });
  return result;
}

export function parseXlsxfile({ file, filelist, type, callback }) {
  const reader = new FileReader();
  reader.onload = e => {
    const data = e.target.result;
    const workbook = XLSX.read(data, { type: 'binary', dateNF: 'YYYY/MM/DD', cellDates: true });
    if (callback) {
      callback(xlsxtoArray(workbook));
    }
  };
  reader.readAsBinaryString(file);
}

/*eslint-disable */
function CSVToArray(strData, strDelimiter) {
  // Check to see if the delimiter is defined. If not,
  // then default to comma.
  strDelimiter = strDelimiter || ',';
  // Create a regular expression to parse the CSV values.
  const objPattern = new RegExp(
    // Delimiters.
    '(\\' +
      strDelimiter +
      '|\\r?\\n|\\r|^)' +
      // Quoted fields.
      '(?:"([^"]*(?:""[^"]*)*)"|' +
      // Standard fields.
      '([^"\\' +
      strDelimiter +
      '\\r\\n]*))',
    'gi',
  );
  // Create an array to hold our data. Give the array
  // a default empty first row.
  const arrData = [[]];
  // Create an array to hold our individual pattern
  // matching groups.
  let arrMatches = null;
  // Keep looping over the regular expression matches
  // until we can no longer find a match.
  while ((arrMatches = objPattern.exec(strData))) {
    // Get the delimiter that was found.
    const strMatchedDelimiter = arrMatches[1];
    // Check to see if the given delimiter has a length
    // (is not the start of string) and if it matches
    // field delimiter. If id does not, then we know
    // that this delimiter is a row delimiter.
    if (strMatchedDelimiter.length && strMatchedDelimiter !== strDelimiter) {
      // Since we have reached a new row of data,
      // add an empty row to our data array.
      arrData.push([]);
    }
    // Now that we have our delimiter out of the way,let's check to see which kind of value we
    // captured (quoted or unquoted).
    let strMatchedValue;
    if (arrMatches[2]) {
      // We found a quoted value. When we capture
      // this value, unescape any double quotes.
      strMatchedValue = arrMatches[2].replace(new RegExp('""', 'g'), '"');
    } else {
      // We found a non-quoted value.
      strMatchedValue = arrMatches[3];
    }
    // Now that we have our value string, let's add
    // it to the data array.
    arrData[arrData.length - 1].push(strMatchedValue);
  }
  // 有时csv文件会出现删除一行再保存，一行全为空值的情况
  const _arrData = arrData.filter(item => _.compact(item).length !== 0);
  return _arrData;
}

/*eslint-enable */

function parseCsv(file, callback, type: 'array') {
  const reader = new FileReader();
  reader.onload = e => {
    const data = e.target.result;
    callback(CSVToArray(data));
  };
  reader.readAsText(file, 'gb2312');
}

function parseFile({ file, callback }) {
  const originFileObj = file.originFileObj || file;
  const extName = originFileObj.name.split('.').pop();
  if (extName === 'csv') {
    parseCsv(originFileObj, callback);
  }
}
// 将二维数组转成 keys 对应的对象
function keysToObj(data, keys) {
  const rs = [];
  keys.forEach((key, outIndex) => {
    let title;
    let formatter;
    if (typeof key === 'string') {
      title = key;
    } else if (typeof key === 'object') {
      title = key.title;
      formatter = key.formatter;
    }
    data.forEach((node, index) => {
      if (index !== 0) {
        rs[index - 1] = {
          ...rs[index - 1],
          [title]: typeof formatter === 'function' ? formatter(node[outIndex]) : node[outIndex],
        };
      }
    });
  });
  return rs;
}

export default parseFile;

export { keysToObj };
