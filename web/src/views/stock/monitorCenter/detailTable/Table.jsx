import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { withRouter } from 'react-router-dom';

import { Link, message, buttonAuthorityWrapper, Spin, Badge, Button, Table as BasicTable } from 'src/components';
import { replaceSign } from 'src/constants';
import { useFetch } from 'src/utils/hookUtils/fetchHooks';
import { getQrCodeListByMonitorCondition } from 'src/services/monitorCenter';
import { findQualityStatus } from 'src/views/qualityManagement/constants';
import { LOCATION_STATUS, findTrallyingStatus, calTimeDiff } from 'src/containers/qrCodeQuery/utils';
import moment from 'src/utils/time';
import { getValidityPeriodPrecision } from 'src/utils/organizationConfig';
import { error, title } from 'src/styles/color';
import { arrayIsEmpty } from 'src/utils/array';
import { setLocation, getParams } from 'src/utils/url';
import auth from 'src/utils/auth';

import { MONITOR_CONDITION, getQrCodeDetailPageUrl } from '../utils';
import RowSelectionHeader, { TYPE } from './RowSelectionHeader';

const ButtonWithAuth = buttonAuthorityWrapper(Button);

// 需要根据不同的type来决定显示那些columns
const getColumns = (type, { changeChineseToLocale }) => {
  if (!type) return null;
  const commonColumns = [
    {
      title: '二维码',
      dataIndex: 'code',
      width: 200,
      render: (data, record) => {
        const { id } = record || {};
        return data ? <Link to={getQrCodeDetailPageUrl(id)}> {data} </Link> : replaceSign;
      },
    },
    {
      title: '物料编码',
      dataIndex: 'material',
      key: 'materialCode',
      width: 200,
      render: data => {
        const { code } = data || {};
        return code || replaceSign;
      },
    },
    {
      title: '物料名称',
      dataIndex: 'material',
      key: 'materialName',
      width: 200,
      render: data => {
        const { name } = data || {};
        return name || replaceSign;
      },
    },
    {
      title: '规格描述',
      dataIndex: 'material',
      key: 'materialDesc',
      width: 200,
      render: data => {
        const { desc } = data || {};
        return desc || replaceSign;
      },
    },
    {
      title: '数量',
      dataIndex: 'amount',
      width: 200,
      render: data => {
        return <div style={{ textAlign: 'right' }}>{typeof data === 'number' ? data : replaceSign}</div>;
      },
    },
    {
      title: '单位',
      key: 'unit',
      width: 200,
      render: (__, record) => {
        const { material } = record;
        const { unit } = material || {};
        return unit || replaceSign;
      },
    },
    {
      title: '仓库',
      width: 200,
      key: 'warehouse',
      render: (__, record) => {
        const { warehouse } = record;
        const { code, name } = warehouse || {};
        return `${code || replaceSign}/${name || replaceSign}`;
      },
    },
    {
      title: '一级仓位',
      width: 200,
      render: (__, record) => {
        const { firstStorageInfo } = record;
        const { code, name } = firstStorageInfo || {};
        return `${code || replaceSign}/${name || replaceSign}`;
      },
    },
    {
      title: '二级仓位',
      width: 200,
      render: (__, record) => {
        const { storageInfo } = record;
        const { code, name } = storageInfo || {};
        return `${code || replaceSign}/${name || replaceSign}`;
      },
    },
  ];

  if (type === MONITOR_CONDITION.qcStatus.value) {
    commonColumns.push({
      title: '质量状态',
      width: 200,
      dataIndex: 'qcStatus',
      render: data => {
        const { name, color } = findQualityStatus(data) || {};

        if (!name) return replaceSign;
        return <Badge.MyBadge text={changeChineseToLocale(name) || replaceSign} color={color} />;
      },
    });
  }

  if (type === MONITOR_CONDITION.businessStatus.value) {
    commonColumns.push({
      title: '业务状态',
      width: 200,
      key: 'trallyStatus',
      render: (__, record) => {
        const { name, color } = findTrallyingStatus(record) || {};

        if (!name) return replaceSign;
        return <Badge.MyBadge text={changeChineseToLocale(name) || replaceSign} color={color} />;
      },
    });
  }

  if (type === MONITOR_CONDITION.createTime.value) {
    commonColumns.push({
      title: '创建时间',
      width: 200,
      dataIndex: 'createdAt',
      render: data => {
        if (!data) return replaceSign;
        return moment(data).format('YYYY/MM/DD HH:mm:ss');
      },
    });
    commonColumns.push({
      title: '库龄',
      width: 200,
      key: 'age',
      render: (__, record) => {
        const { createdAt } = record || {};
        if (!createdAt) return replaceSign;

        return calTimeDiff(createdAt, new Date());
      },
    });
  }

  if (type === MONITOR_CONDITION.validity.value) {
    commonColumns.push({
      title: '有效期',
      width: 200,
      key: 'validity',
      render: (__, record) => {
        const { validityPeriod } = record || {};
        if (!validityPeriod) return replaceSign;

        const { showFormat, momentFormat } = getValidityPeriodPrecision();

        return (
          <span
            style={{
              color: moment(moment(validityPeriod).format(momentFormat)).isBefore(moment().format(momentFormat))
                ? error
                : title,
            }}
          >
            {moment(validityPeriod).format(showFormat)}
          </span>
        );
      },
    });
  }

  if (type === MONITOR_CONDITION.lastTimeCheckTime.value) {
    commonColumns.push({
      title: '盘点时间',
      dataIndex: 'trallyingAt',
      width: 200,
      render: data => {
        if (!data) return replaceSign;

        return <span>{moment(data).format('YYYY/MM/DD HH:mm')}</span>;
      },
    });
  }

  return commonColumns;
};

// table选择行
const getRowSelection = ({
  selectedRowKeys,
  setSelectedRowKeys,
  setSelectedRows,
  allSelectedRows,
  tableData,
  type,
}) => {
  return {
    selectedRowKeys,
    getCheckboxProps: record => {
      if (type === TYPE.clear) {
        const { status, inQC, inTrallying, inWeighing, key } = record || {};

        // 是否可以选择
        let disabled = false;

        // 转运中、发料中的二维码不可以置空
        if (status === LOCATION_STATUS.transfer.value || status === LOCATION_STATUS.allocation.value) {
          disabled = true;
        }

        // 业务状态不为空 的行不能被选择
        if (inQC || inTrallying || inWeighing) {
          disabled = true;
        }

        // 置空的二维码数量限制为100
        // 当这一行还没有被选中而且已选中的数量等于100的时候。disabeld
        if (Array.isArray(selectedRowKeys) && selectedRowKeys.length >= 100 && !selectedRowKeys.includes(key)) {
          disabled = true;
        }

        return { disabled };
      }
      return {};
    },
    onChange: (selectedRowKeys, selectedRows) => {
      setSelectedRowKeys(selectedRowKeys);
      setSelectedRows(_.pullAllBy(allSelectedRows, tableData, 'id').concat(selectedRows));
    },
    onSelectAll: (selected, selectedRows, changeRows) => {
      const changeRowsLen = arrayIsEmpty(changeRows) ? 0 : changeRows.length;
      const selectedRowKeysLen = arrayIsEmpty(selectedRowKeys) ? 0 : selectedRowKeys.length;

      if (selected && changeRowsLen + selectedRowKeysLen > 100) {
        message.error('一次最多置空100条二维码');
        // 当选中全选，但是数量超过100的时候。这次需要将加的数据删除
        setSelectedRowKeys({ selectedRowKeys: _.pullAllBy(selectedRowKeys, changeRows, 'key') });
      }
    },
  };
};

const Table = (props, context) => {
  const { conditionData, conditionId, warehouseCode, style } = props;
  const { changeChineseToLocale } = context;

  // rowSelection开关
  const [showRowSelectionHeader, setShowRowSelectionHeader] = useState(false);
  const [showRowSelection, setShowRowSelection] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);

  // headerType
  const [headerType, setHeaderType] = useState();

  // url中的初始值
  const { queryObj } = getParams() || {};
  const { page, size } = queryObj || {};

  // 分页
  const [pagination, setPagination] = useState({ total: 0, current: page || 1, pageSize: size || 10 });

  // 拉取对应的table数据
  const [{ data: qrCodeData, isLoading }, setParams] = useFetch(getQrCodeListByMonitorCondition, {
    initialParams: { conditionId, warehouseCode, page: 1, size: 10, ...(queryObj || {}) },
  });
  const { data: tableData, total } = _.get(qrCodeData, 'data') || {};
  const _tableData = arrayIsEmpty(tableData) ? [] : tableData.map(i => ({ ...i, key: i && i.id }));

  // 分页
  useEffect(() => {
    setPagination({ ...pagination, total });
  }, total);

  // 获取columns
  const { rules } = conditionData || {};
  const { type } = arrayIsEmpty(rules) ? {} : rules[0];
  const columns = getColumns(type, { changeChineseToLocale }) || [];

  // refetch函数
  const refetch = params => {
    const { page, size, ...rest } = params || {};
    setParams({ conditionId, warehouseCode, page, size, ...rest });
    setLocation(props, { conditionId, warehouseCode, page, size, ...rest });
    setPagination({ ...pagination, current: page, pageSize: size });
  };

  return (
    <Spin spinning={isLoading}>
      <div style={style}>
        <div style={{ display: 'flex', justifyContent: 'space-between', margin: '20px 0px' }}>
          <div>
            <Button
              onClick={() => {
                setHeaderType(TYPE.export);
                setShowRowSelectionHeader(true);
                setShowRowSelection(true);
              }}
              icon={'upload'}
              disabled={headerType === TYPE.export}
              fetchData={params => refetch({ conditionId, warehouseCode, ...params })}
            >
              批量导出
            </Button>
            <ButtonWithAuth
              auth={auth.WEB_EMPTY_MATERIAL_LOT}
              onClick={() => {
                setHeaderType(TYPE.clear);
                setShowRowSelectionHeader(true);
                setShowRowSelection(true);
              }}
              disabled={headerType === TYPE.clear}
              style={{ marginLeft: 10 }}
              iconType={'gc'}
              icon={'shuaxin'}
            >
              批量置空
            </ButtonWithAuth>
          </div>
          {showRowSelectionHeader ? (
            <div>
              <RowSelectionHeader
                conditionData={conditionData}
                type={headerType}
                cbForClearQrCode={() => {
                  setShowRowSelectionHeader(false);
                  setShowRowSelection(false);
                  setSelectedRowKeys([]);
                  setSelectedRows([]);
                  setHeaderType(null);
                  if (typeof refetch === 'function') refetch({ conditionId, warehouseCode });
                }}
                cbForCancel={() => {
                  setShowRowSelectionHeader(false);
                  setShowRowSelection(false);
                  setSelectedRowKeys([]);
                  setSelectedRows([]);
                  setHeaderType(null);
                }}
                cbForAllChecked={value => {
                  if (value) {
                    setSelectedRowKeys([]);
                    setSelectedRows([]);
                    setShowRowSelection(false);
                  } else {
                    setShowRowSelection(true);
                  }
                }}
                selectedRowKeys={selectedRowKeys}
                selectedRows={selectedRows}
                fetchData={async params => {
                  return await getQrCodeListByMonitorCondition({ ...params, conditionId, warehouseCode });
                }}
                total={total}
              />
            </div>
          ) : null}
        </div>
        <BasicTable
          pagination={pagination}
          rowSelection={
            showRowSelectionHeader && showRowSelection
              ? getRowSelection({
                  selectedRowKeys,
                  setSelectedRowKeys,
                  allSelectedRows: selectedRows,
                  setSelectedRows,
                  tableData: _tableData,
                  type: headerType,
                })
              : null
          }
          dragable
          refetch={refetch}
          dataSource={_tableData}
          style={{ margin: 0 }}
          columns={columns}
        />
      </div>
    </Spin>
  );
};

Table.propTypes = {
  style: PropTypes.any,
  conditionData: PropTypes.any,
  warehouseCode: PropTypes.any,
  conditionId: PropTypes.any,
};
Table.contextTypes = {
  changeChineseToLocale: PropTypes.any,
};

export default withRouter(Table);
