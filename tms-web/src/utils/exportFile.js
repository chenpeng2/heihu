import XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import _ from 'lodash';

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
      // style.colsWidth = _colsWidth;
      ws['!cols'] = _colsWidth 
    }
    // ws['!cols'] = style.colsWidth;
  }
  return ws;
};


export const exportXlsxStyleFile = (data, filename = 'download', sheetNames, type = 'xlsx', style, mergeData) => {
  const wb = XLSX.utils.book_new();
  if (Array.isArray(sheetNames)) {
    // multiple sheet
    sheetNames.forEach((sheetName, index) => {
      const ws = getWs({ data: data[index], style });
      XLSX.utils.book_append_sheet(wb, ws, sheetNames[index] || `sheet${index}`);
      wb.Sheets[sheetName]["!merges"] = mergeData[index];
    });
  } else {
    const ws = getWs({ data, style });
    XLSX.utils.book_append_sheet(wb, ws, 'SheetJS');
    wb.Sheets.SheetJS["!merges"] = mergeData[0];
  }
  const wbout = XLSX.write(wb, { type: 'array', bookType: type });
  saveAs(new Blob([wbout], { type: 'application/octet-stream' }), `${filename}.${type}`);
};
