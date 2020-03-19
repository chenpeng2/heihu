/**
 * @description: zebra打印机模版选择model
 *
 * @date: 2019/7/4 上午10:27
 */

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import { addLabelPrintCount } from 'src/services/barCodeLabel';
import { FormattedMessage, message, Select, Button, FilterSortSearchBar } from 'src/components';
import withLodop from 'src/utils/LodopFuncs';
import { greyWhite, primary } from 'src/styles/color';
import TagTemplateSelect, { formatValue } from 'src/containers/tagTemplate/tagTemplateSelect';
import { wrapUrl, download } from 'src/utils/attachment';
import { arrayIsEmpty } from 'src/utils/array';
import moment from 'src/utils/time';

import { PRINT_TEMPLATE_TYPE } from '../../constant';

const SelectGroup = Select.SelectGroup;

const Item = FilterSortSearchBar.Item;
const buttonStyle = { width: 114, height: 32, marginLeft: 10 };

// lodop打印
const lodopPrint = (lodop, dataToWrite, selectedDeviceIndex) => {
  if (!lodop) return;
  if (lodop.SET_PRINTER_INDEX(selectedDeviceIndex)) {
    lodop.SET_PRINT_MODE('SEND_RAW_DATA_ENCODE', 'UTF-8');
    lodop.SEND_PRINT_RAWDATA(dataToWrite);
  }
};

// 将文件中需要替换的内容替换为数据的内容
const replaceTemplateFile = (templateFileStr, dataArray) => {
  if (typeof templateFileStr !== 'string') return;
  if (arrayIsEmpty(dataArray)) return;

  // 替换模版文件中$XXX$格式的字符为data中key为XXX的值
  const reg = /\$[\w0-9]+\$/gi;

  // 联排打印需要先找到模版中最大的序列值，来为data做chunk。然后根据chunk后的data来替代模版
  const seqs = templateFileStr
    .match(reg)
    .map(i => {
      const paramsName = i.slice(1, i.length - 1);
      const nameItems = paramsName.split('_');
      return arrayIsEmpty(nameItems) ? null : nameItems[nameItems.length - 1];
    })
    .filter(i => i && /^[0-9]$/g.test(i));

  // 根据chunk后的data，来替换字符串
  return _.chunk(dataArray, arrayIsEmpty(seqs) ? 1 : Math.max(...seqs))
    .map(templateData => {
      const i = templateData;
      return templateFileStr.replace(reg, replacement => {
        const paramsName = replacement.slice(1, replacement.length - 1);
        if (paramsName.indexOf('_') === -1 && i[0]) {
          return i[0][paramsName] || null;
        }

        const nameItems = paramsName.split('_');
        if (arrayIsEmpty(nameItems)) return null;

        let seq;
        if (/^[0-9]$/g.test(nameItems[nameItems.length - 1])) {
          // 联排打印时将最后的seq去除
          seq = nameItems.splice(nameItems.length - 1, 1)[0];
        }

        const name = nameItems.join('_');

        // 文档中的序号从1开始
        // 如果有seq可以说是双排打印
        if (seq && i[Number(seq) - 1]) {
          return i[Number(seq) - 1][name] || null;
        } else if (seq && !i[Number(seq) - 1]) {
          // 双排打印最后一个值可能为空
          return null;
        }

        return i[0] ? i[0][name] || null : null;
      });
    })
    .join();
};

// 将需要打印的数据的key改为对应的key
const formatData = data => {
  if (arrayIsEmpty(data)) return [];

  return data.map(i => {
    const { projectInfo, labelSeq, productSeq, productBatchSeq, productUnit, productInfo, projectCode, productAmount } =
      i || {};
    const { code, name, validTime, desc, materialCustomFields } = productInfo || {};
    const { endTimePlanned, purchaseOrder } = projectInfo || {};
    const { purchaseOrderCode } = purchaseOrder || {};

    const customFiles = {};
    if (!arrayIsEmpty(materialCustomFields)) {
      materialCustomFields.forEach(i => {
        const { keyName, keyValue } = i || {};
        customFiles[keyName] = keyValue;
      });
    }

    return Object.assign({}, customFiles, {
      material_name: name,
      material_code: code,
      storage_validity: validTime, // 存储有效期
      specification: desc, // 存储有效期
      project_code: projectCode,
      purchaseorder_code: purchaseOrderCode,
      amount: productAmount,
      unit: productUnit,
      product_batch: productBatchSeq,
      end_time: endTimePlanned ? moment(endTimePlanned).format('YYYY-MM-DD') : null,
      print_time: moment().format('YYYY-MM-DD'),
      validity: validTime
        ? moment()
            .add(validTime, 'days')
            .format('YYYY-MM-DD')
        : moment().format('YYYY-MM-DD'),
      label_seq: labelSeq,
      product_seq: productSeq,
    });
  });
};

const ZebraModel = (
  props: {
    labels: [],
    printAmount: number,
    onClose: () => {},
    getLodop: () => {},
    cbForPrint: () => {},
  },
  context,
) => {
  const { getLodop, printAmount, onClose, labels, cbForPrint } = props;
  const [lodop, setLodop] = useState(null);
  const [devices, setDevices] = useState([]);

  const { changeChineseToLocale } = context;

  // 模版文件
  const [templateFile, setTemplateFile] = useState(null);
  // 打印机
  const [printer, setPrinter] = useState(null);

  // 需要在useEffect中使用getLodop。getLodop的调用会造成组件的重新渲染
  useEffect(() => {
    // sleep1000ms来等待cLodop安装
    const sleep = () =>
      new Promise((resolve, reject) => {
        setTimeout(resolve, 1000);
      });

    sleep().then(() => {
      // lodop打印接口
      const lodop = getLodop();

      if (!lodop) {
        message.warning(changeChineseToLocale('请检查打印机是否连接'));
        return null;
      }

      setLodop(lodop);

      const printNum = lodop.GET_PRINTER_COUNT();
      const devices = new Array((printNum || 1) + 1)
        .join(0)
        .split('')
        .map((_, index) => ({
          label: lodop.GET_PRINTER_NAME(index),
          value: index,
        }));

      setDevices(devices);
    });
  }, []);

  return (
    <div style={{ margin: 20 }}>
      <div style={{ background: greyWhite, padding: 20, display: 'flex', justifyContent: 'center' }}>
        <div>
          <Item label={'标签模版'} wrapperStyle={{ width: 500 }}>
            <TagTemplateSelect value={templateFile} onChange={v => setTemplateFile(v)} style={{ width: '100%' }} />
          </Item>
          <Item label={'打印设备'} wrapperStyle={{ width: 500 }}>
            <SelectGroup
              placeholder={'选择打印设备'}
              value={printer}
              onChange={v => setPrinter(v)}
              groupData={devices}
            />
          </Item>
        </div>
      </div>
      <div>
        <FormattedMessage
          defaultMessage={'本次打印数量：{amount}个'}
          values={{
            amount: <span style={{ color: primary }}>{printAmount || 0}</span>,
          }}
        />
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Button
          type="default"
          style={buttonStyle}
          onClick={() => {
            if (typeof onClose === 'function') onClose();
          }}
        >
          取消
        </Button>
        <Button
          type="primary"
          style={buttonStyle}
          onClick={() => {
            const fileId = arrayIsEmpty(templateFile) ? null : formatValue(templateFile[templateFile.length - 1]);
            if (!fileId) {
              message.error('请选择模版文件');
              return;
            }
            // 下载文件
            download(
              wrapUrl(fileId),
              '',
              fileData => {
                const reader = new FileReader();
                reader.readAsText(fileData);
                reader.addEventListener('loadend', () => {
                  const dataStr = reader.result;
                  // 将需要打印的数据格式化。需要将数据的key替换为为wiki上定义的key
                  // http://wiki.blacklake.tech/pages/viewpage.action?pageId=12886191
                  const dataAfterFormat = formatData(labels);
                  // 将文件内容格式化
                  const dataAfterReplace = replaceTemplateFile(dataStr, dataAfterFormat);
                  console.log(dataAfterFormat, dataAfterReplace);
                  // 打印文件
                  lodopPrint(lodop, dataAfterReplace, printer);

                  // 打印回调
                  const labelIds = arrayIsEmpty(labels) ? [] : labels.map(i => i.labelId);
                  const _cbForPrint = () => {
                    addLabelPrintCount({
                      barcodeLabelIds: labelIds,
                      printTemplateType: PRINT_TEMPLATE_TYPE.tag.value,
                    }).then(() => {
                      if (typeof cbForPrint === 'function') cbForPrint();
                      if (typeof onClose === 'function') onClose();
                    });
                  };
                  _cbForPrint();
                });
              },
              true,
            );
          }}
        >
          打印
        </Button>
      </div>
    </div>
  );
};

ZebraModel.propTypes = {
  style: PropTypes.any,
};

ZebraModel.contextTypes = {
  changeChineseToLocale: PropTypes.any,
};

export default withLodop(ZebraModel);
