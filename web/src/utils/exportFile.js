/* eslint-disable */
import XLSX from 'xlsx';
import * as xlsxStyle from 'gc-xlsx';
import { saveAs } from 'file-saver';
import _ from 'lodash';

export const exportXlsxFile = (data, filename = 'download', sheetNames, type = 'xlsx') => {
  // const data = originData[0] ? originData.splice(0, 1) : originData;
  // alert(data);
  const ws = XLSX.utils.aoa_to_sheet(data);
  const wb = XLSX.utils.book_new();
  if (Array.isArray(sheetNames)) {
    // multiple sheet
    sheetNames.forEach((sheetName, index) => {
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(data[index]), sheetNames[index] || `sheet${index}`);
    });
  } else {
    XLSX.utils.book_append_sheet(wb, ws, 'SheetJS');
  }
  const wbout = XLSX.write(wb, { type: 'array', bookType: type });
  saveAs(new Blob([wbout], { type: 'application/octet-stream' }), `${filename}.${type}`);
};

export const exportCsvFileByString = (csvString, fileName) => {
  if (!csvString) return;

  const blob = new Blob([`\uFEFF${csvString}`], { type: 'text/csv;charset=gb2312;' });
  const a = document.createElement('a');
  a.download = `${fileName || '导出文件'}.csv`;
  a.href = URL.createObjectURL(blob);
  a.click();
};

const s2ab = s => {
  const buf = new ArrayBuffer(s.length);
  const view = new Uint8Array(buf);
  for (let i = 0; i !== s.length; ++i) {
    view[i] = s.charCodeAt(i) & 0xff;
  }
  return buf;
};

// colsWidth分两种参数形式，值为number时所有列宽一样，值为数组时列宽每列分别定义
const getWs = ({ data, style = {} }) => {
  const ws = {};
  let maxColumnLength = 0;
  const maxRowLength = data.length;

  data.forEach((n, i) => {
    if (n.length > maxColumnLength) {
      maxColumnLength = n.length;
    }
    n.forEach((m, index) => {
      const cell = `${String.fromCharCode(65 + index)}${i + 1}`;
      ws[cell] = {
        t: 's',
        v: `${(m && m) || ''}`,
        s: {
          alignment: {
            wrapText: true,
          },
        },
      };
    });
  });
  ws['!ref'] = `A1:${String.fromCharCode(65 + (maxColumnLength - 1))}${maxRowLength}`;
  if (style.colsWidth) {
    if (typeof style.colsWidth === 'number') {
      const _colsWidth = _.fill(Array(maxColumnLength), { wpx: style.colsWidth });
      style.colsWidth = _colsWidth;
    }
    ws['!cols'] = style.colsWidth;
  }
  return ws;
};

export const exportXlsxStyleFile = (data, filename = 'download', sheetNames, type = 'xlsx', style) => {
  const wb = XLSX.utils.book_new();
  if (Array.isArray(sheetNames)) {
    // multiple sheet
    sheetNames.forEach((sheetName, index) => {
      const ws = getWs({ data: data[index], style });
      XLSX.utils.book_append_sheet(wb, ws, sheetNames[index] || `sheet${index}`);
    });
  } else {
    const ws = getWs({ data, style });
    XLSX.utils.book_append_sheet(wb, ws, 'SheetJS');
  }
  const wbout = xlsxStyle.write(wb, { type: 'binary', bookSST: true, bookType: type });
  saveAs(new Blob([s2ab(wbout)], { type: 'application/octet-stream' }), `${filename}.${type}`);
};

export default 'dummy';
