/**
 * @description: 退料记录列表
 *
 * @date: 2019/5/21 上午10:03
 */
import React, { useState, useEffect } from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';

import { selectAllExport, Spin, Checkbox, Button, Icon } from 'src/components';
import log from 'src/utils/log';
import { getParams, setLocation } from 'src/utils/url';
import { formatTodayUnderline } from 'src/utils/time';
import { exportXlsxFile } from 'utils/exportFile';
import { arrayIsEmpty } from 'src/utils/array';

import Filter, { formatFilterFormValue } from './filter';
import Table from './table';
import { formatExportData, fetchWithdrawRecord } from '../utils';

const buttonStyle = {
  width: 80,
  marginLeft: 10,
};
const FILE_NAME = `退料记录数据_${formatTodayUnderline()}`;

const getNextParams = params => {
  const { filter: lastFilter, ...lastRest } = _.get(getParams(), 'queryObj');
  const { filter, ...rest } = params || {};

  const nextFilter = { ...lastFilter, ...filter };
  return { size: 10, page: 1, ...lastRest, ...formatFilterFormValue(nextFilter), ...rest };
};

const WithdrawRecordList = (props, context) => {
  const { changeChineseToLocale, changeChineseTemplateToLocale } = context;
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  // fetch 参数
  const [params, setParams] = useState({});
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  // rowSelection
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  // 批量导出的时候显示全选和rowSelection
  const [isBatchExport, setIsBatchExport] = useState(false);
  // 是否全选
  const [isSelectAll, setIsSelectAll] = useState(false);

  useEffect(
    () => {
      // 离开页面后不在setState
      let mounted = true;

      (async () => {
        setLoading(true);

        const { filter: lastFilter, ...lastRest } = _.get(getParams(), 'queryObj');
        const { filter, ...rest } = params || {};

        const nextFilter = { ...lastFilter, ...filter };
        const nextParams = { size: 10, page: 1, ...lastRest, ...formatFilterFormValue(nextFilter), ...rest };

        try {
          // 没有操作时间不拉数据
          if (nextParams.createdBegin && nextParams.createdEnd) {
            setLocation(props, { size: 10, page: 1, filter: nextFilter, ...lastRest, ...rest });
            const data = await fetchWithdrawRecord(nextParams);

            const pagination = {
              current: nextParams ? nextParams.page : 1,
              pageSize: nextParams ? nextParams.size : 10,
              total: data ? data.total : 0,
            };

            if (mounted) {
              setData(data);
              setPagination(pagination);
            }
          }
        } catch (e) {
          log.error(e);
        }

        setLoading(false);
      })();

      const cleanUp = () => {
        mounted = false;
      };
      return cleanUp;
    },
    [params],
  );

  // 获取选中的数量
  const getSelectAmount = () => {
    if (isSelectAll) return _.get(data, 'total');
    return Array.isArray(selectedRows) ? selectedRows.length : 0;
  };
  const selectedAmount = getSelectAmount();

  const { data: tableData } = data || {};
  const _tableData = arrayIsEmpty(tableData)
    ? []
    : tableData.map(i => {
        const { id } = i || {};
        i.key = id;
        return i;
      });

  return (
    <Spin spinning={loading}>
      <Filter
        refetch={params => {
          setParams(params);
          setSelectedRows([]);
          setSelectedRowKeys([]);
          setIsSelectAll(false);
          setIsBatchExport(false);
        }}
      />
      <div style={{ margin: '0px 20px 20px' }}>
        {isBatchExport ? (
          <div>
            <Checkbox
              checked={isSelectAll}
              style={{ display: 'inline-block' }}
              onClick={e => {
                setIsSelectAll(e.target.checked);
                setSelectedRowKeys([]);
                setSelectedRows([]);
              }}
            >
              全选
            </Checkbox>
            <Button
              style={buttonStyle}
              ghost
              disabled={selectedAmount <= 0}
              onClick={() => {
                // 全选的时候批量导出
                if (isSelectAll) {
                  selectAllExport(
                    {
                      width: '30%',
                    },
                    {
                      selectedAmount: data ? data.total : 0,
                      getExportData: async _params => {
                        const res = await fetchWithdrawRecord({ ...getNextParams(params), ..._params });
                        const exportData = _.get(res, 'data') || {};
                        return formatExportData(exportData || []);
                      },
                      fileName: FILE_NAME,
                    },
                  );
                  return null;
                }

                // 选择行导出
                const values = formatExportData(selectedRows || []);
                exportXlsxFile(values, FILE_NAME);
              }}
            >
              确定
            </Button>
            <Button
              style={buttonStyle}
              type={'default'}
              onClick={() => {
                setSelectedRows([]);
                setSelectedRowKeys([]);
                setIsSelectAll(false);
                setIsBatchExport(false);
              }}
            >
              取消
            </Button>
            <span style={{ marginLeft: 10 }}>
              {changeChineseTemplateToLocale('已选{amount}条', { amount: selectedAmount })}
            </span>
          </div>
        ) : (
          <Button
            style={{ margin: '0 5px' }}
            onClick={() => {
              setIsBatchExport(true);
            }}
          >
            <Icon type={'upload'} />
            {changeChineseToLocale('批量导出')}
          </Button>
        )}
      </div>
      <Table
        style={{ marginTop: 20 }}
        rowSelection={
          isBatchExport
            ? {
                selectedRowKeys,
                onChange: (selectedRowKeys, _selectedRows) => {
                  setSelectedRowKeys(selectedRowKeys);
                  setSelectedRows(_.pullAllBy(selectedRows, tableData, 'id').concat(_selectedRows));
                },
                getCheckboxProps: () => ({ disabled: isSelectAll }), // 全选的时候disable
              }
            : null
        }
        pagination={pagination}
        refetch={params => setParams(params)}
        tableData={_tableData}
      />
    </Spin>
  );
};

WithdrawRecordList.contextTypes = {
  changeChineseToLocale: PropTypes.any,
  changeChineseTemplateToLocale: PropTypes.any,
};

export default WithdrawRecordList;
