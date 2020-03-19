//excelUtil.js
import XLSX from 'xlsx';
import React,{useState,useEffect} from 'react';
let fileData;
function importExcel(file){
    // 获取上传的文件对象
    const { files } = file.target;
    // 通过FileReader对象读取文件
    const fileReader = new FileReader();
    fileReader.onload = event => {
        try {
            const { result } = event.target;
            // 以二进制流方式读取得到整份excel表格对象
            const workbook = XLSX.read(result, { type: 'binary' });
            let data = []; // 存储获取到的数据
            // 遍历每张工作表进行读取（这里默认只读取第一张表）
            for (const sheet in workbook.Sheets) {
                if (workbook.Sheets.hasOwnProperty(sheet)) {
                    // 利用 sheet_to_json 方法将 excel 转成 json 数据
                    data = data.concat(XLSX.utils.sheet_to_json(workbook.Sheets[sheet]));
                    // break; // 如果只取第一张表，就取消注释这行
                }
            }
            fileData=data;
        } catch (e) {
            // 这里可以抛出文件类型错误不正确的相关提示
            console.log('文件类型不正确');
            return;
        }
    };
    // 以二进制方式打开文件
    fileReader.readAsBinaryString(files[0]);

}
function importFile() {
     return fileData
}
function switchText1(conditionTy){
    let condition;
    switch(conditionTy) {
        case 'e':
            condition = '等于'
            break;
        case 'ue':
            condition = '不等于'
            break;
        case 'g':
            condition = '大于'
            break;
        case 'ge':
            condition = '大于等于'
            break;
        case 'l':
            condition = '小于'
            break;
        case 'le':
            condition = '小于等于'
            break;
        default:
            condition = '范围内'
    } 
    return condition
}
function switchText2(conditionTy, otherData){
    let condition;
    if(conditionTy && conditionTy.length > 0){
        condition = conditionTy.map((item,index)=>{
            return otherData[item]
        })
    }
    return condition
}
function switchText3(conditionTy){
    let condition;
    switch(conditionTy) {
        case 1:
            condition = '处理中'
            break;
        case 2:
            condition = '已处理'
            break;
        default:
            condition = '未处理'
    } 
    return condition
}
function exportExcel(headers, data, fileName = '请假记录表.xlsx', otherData) {
    const _headers = headers
        .map((item, i) => Object.assign({}, { key: item.key, title: item.title, position: String.fromCharCode(65 + i) + 1 }))
        .reduce((prev, next) => Object.assign({}, prev, { [next.position]: { key: next.key, v: next.title } }), {});

    const _data = data
        .map((item, i) => headers.map((key, j) => Object.assign({}, { content: item[key.key], position: String.fromCharCode(65 + j) + (i + 2) })))
        // 对刚才的结果进行降维处理（二维数组变成一维数组）
        .reduce((prev, next) => prev.concat(next))
        // 转换成 worksheet 需要的结构
        .reduce((prev, next) => {
            let content;
            if(next.position.indexOf('J') > -1){
                content = switchText1(next.content)
            }
            if(next.position.indexOf('O') > -1){
                content = switchText2(next.content, otherData)
            }
            if(next.position.indexOf('F') > -1){
                content = switchText3(next.content)
            }
            if(next.position.indexOf('I') > -1){
                if(next.content){
                    content='正常'
                }else{
                    content='故障'
                }
            }
            return Object.assign({}, prev, { [next.position]: { v: content || next.content || '' } })
        }, {});

    // 合并 headers 和 data
    const output = Object.assign({}, _headers, _data);
    // 获取所有单元格的位置
    const outputPos = Object.keys(output);
    // 计算出范围 ,["A1",..., "H2"]
    const ref = `${outputPos[0]}:${outputPos[outputPos.length - 1]}`;

    // 构建 workbook 对象
    const wb = {
        SheetNames: ['mySheet'],
        Sheets: {
            mySheet: Object.assign(
                {},
                output,
                {
                    '!ref': ref,
                    // '!cols': [{ wpx: 45 }, { wpx: 100 }, { wpx: 200 }, { wpx: 80 }, { wpx: 150 }, { wpx: 100 }, { wpx: 300 }, { wpx: 300 }],
                    '!cols': [{ wpx: 120 }, { wpx: 120 }, { wpx: 80 }, { wpx: 100 }, { wpx: 80 }, 
                        { wpx: 80 }, { wpx: 120 }, { wpx: 120 }, { wpx: 80 }, { wpx: 60 }, { wpx: 60 }, 
                        { wpx: 80 }, { wpx: 120 }, { wpx: 140 }, { wpx: 140 }],
                },
            ),
        },
    };
    // 导出 Excel
    XLSX.writeFile(wb, fileName);
}
export default {importExcel,exportExcel,importFile};