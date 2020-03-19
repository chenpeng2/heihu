/**
 * @description: 全选导出。
 *
 * 前提：只有全选所有数据的时候才使用这个组件。手选超过单次最大导出数量不调用这个组件。
 *
 * 行为：
 * 如果全选的数据没有达到单次最大的数量限制，不会出现批量导出的modal
 * 会根据传入的单次最大导出数量。来分割数据范围。
 * 多选数据范围，依次导出为xlsx文件。
 *
 * 如果不满足上述要求，请不要使用这个组件。另外实现一个组件。
 *
 * @date: 2019/5/21 上午11:10
 */
import React, { useState } from 'react';
import { injectIntl } from 'react-intl';

import { exportXlsxFile, exportXlsxStyleFile } from 'src/utils/exportFile';
import { isAsync, isPromise } from 'src/utils/promise';
import { changeChineseTemplateToLocale, changeChineseToLocaleWithoutIntl } from 'src/utils/locale/utils';
import log from 'src/utils/log';
import { arrayIsEmpty } from 'src/utils/array';

import FormattedMessage from '../intl/MyFormattedMessage';
import Spin from '../spin';
import Button from '../button/index';
import Checkbox from '../checkbox/index';
import openModal from '../modal/index';

const MAX_EXPORT_AMOUNT = 5000;
const DEFAULT_EXPORT_FILE_NAME = '数据导出文件';

const CheckboxGroup = Checkbox.Group;
const radioStyle = {
  display: 'block',
  height: '30px',
  lineHeight: '30px',
};

type Props = {
  getExportData: (params: { page: number, size: number }) => {}, // 拉取导出数据的接口。会传给page和pageSize参数。必须是promise。必须返回处理过后的数据。这个组件会将返回后的数据导出为excel文件
  onCancel: () => {}, // 取消回调函数
  selectedAmount: Number, // 选中的数量
  maxExportAmount: Number, // 一次导出多少数据
  onClose: () => {}, // 关闭的回调
  onOk: () => {}, // 成功的回调
  fileName: string, // 导出文件名
  getSheetNames: () => {}, // 一个文件导出多个sheet时传
  multiExport: Boolean, // 是否一次导出多个文件，为true时fileName为数组，getExportData返回的为List<List<...>>结构，数据与文件名顺序匹配
  isExportStyleFile: Boolean, // 是否导出自带样式的excel文件，如果为true导出方法为exportXlsxStyleFile
  exportFileStyle: Object, // excel文件的样式
};

// 将数据转换为xlsx文件
const dataExport = (data, fileName, multiExport = false, sheetNames, isExportStyleFile, exportFileStyle) => {
  const exportFunc = isExportStyleFile ? exportXlsxStyleFile : exportXlsxFile;
  if (multiExport) {
    data.forEach((node, index) => {
      if (!arrayIsEmpty(node) && !arrayIsEmpty(fileName)) {
        exportFunc(node, fileName[index] || DEFAULT_EXPORT_FILE_NAME, sheetNames, 'xlsx', exportFileStyle);
      }
    });
  } else {
    exportFunc(data, fileName || DEFAULT_EXPORT_FILE_NAME, sheetNames, 'xlsx', exportFileStyle);
  }
};

// 批量选择的组件
export const BatchExportSelect = (props: Props) => {
  const {
    onOk,
    onClose,
    fileName,
    maxExportAmount,
    getExportData,
    selectedAmount,
    onCancel,
    multiExport,
    getSheetNames,
    isExportStyleFile,
    exportFileStyle,
  } = props;
  const _maxExportAmount = typeof maxExportAmount === 'number' ? maxExportAmount : MAX_EXPORT_AMOUNT;

  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(false);

  // 多选
  const sectionNum = Math.ceil(selectedAmount / _maxExportAmount);
  const radios = [];
  for (let i = 1; i <= sectionNum; i += 1) {
    radios.push(
      <Checkbox style={radioStyle} value={i}>
        {`${_maxExportAmount * (i - 1) + 1}~${Math.min(_maxExportAmount * i, selectedAmount)}`}
      </Checkbox>,
    );
  }

  return (
    <Spin spinning={loading}>
      <div style={{ padding: 20 }}>
        <div style={{ marginBottom: 10 }}>
          <FormattedMessage
            defaultMessage={'本次选择了{amount}项，请选择欲导出的区段'}
            values={{ amount: selectedAmount }}
          />
        </div>
        <div style={{ maxHeight: 300, overflow: 'scroll' }}>
          <CheckboxGroup defaultValue={0} onChange={v => setPages(v)}>
            {radios}
          </CheckboxGroup>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 20 }}>
          <Button
            disabled={selectedAmount === 0 || arrayIsEmpty(pages)}
            style={{ width: 120, height: 28 }}
            onClick={async () => {
              try {
                let j;
                setLoading(true);
                for (j of pages) {
                  // params中只有page和size。其他的参数这个组件不负责
                  const params = { size: _maxExportAmount, page: j };
                  if (typeof getExportData === 'function') {
                    const res = await getExportData(params);
                    const sheetNames = typeof getSheetNames === 'function' ? getSheetNames(res) : null;
                    dataExport(res, fileName, multiExport, sheetNames, isExportStyleFile, exportFileStyle);
                  }

                  // 成功的回调
                  if (typeof onOk === 'function') onOk();
                  if (typeof onClose === 'function') onClose();
                }
              } catch (e) {
                log.error(e);
              } finally {
                setLoading(false);
              }
            }}
          >
            确定
          </Button>
          <Button
            style={{ width: 120, height: 28, marginLeft: 20 }}
            type={'default'}
            onClick={() => {
              if (typeof onCancel === 'function') onCancel();
              if (typeof onClose === 'function') onClose();
            }}
          >
            取消
          </Button>
        </div>
      </div>
    </Spin>
  );
};

/**
 * @description: 全选导出
 * 接受modal的props和批量导出的props
 *
 * @date: 2019/5/21 下午12:09
 */
const selectAllExport = (modalProps, batchExportSelectProps: Props) => {
  const {
    maxExportAmount,
    selectedAmount,
    getExportData,
    fileName,
    multiExport,
    getSheetNames,
    isExportStyleFile,
    exportFileStyle,
  } = batchExportSelectProps;

  const _maxExportAmount = typeof maxExportAmount === 'number' ? maxExportAmount : MAX_EXPORT_AMOUNT;
  // 选中的数据小于，等于最大的导出数量限制
  if (selectedAmount <= _maxExportAmount) {
    if (typeof getExportData === 'function') {
      getExportData({ size: _maxExportAmount, page: 1 }).then(res => {
        const sheetNames = typeof getSheetNames === 'function' ? getSheetNames(res) : null;
        dataExport(res, fileName, multiExport, sheetNames, isExportStyleFile, exportFileStyle);
      });
    }
    return;
  }

  // 选中的数据大于最大的导出数量限制，打开批量导出modal。
  openModal({
    children: <BatchExportSelect {...batchExportSelectProps || {}} />,
    title: <FormattedMessage defaultMessage={'单次导出不可超过{amount}条'} values={{ amount: _maxExportAmount }} />,
    footer: null,
    ...(modalProps || {}),
  });
};

export default selectAllExport;
