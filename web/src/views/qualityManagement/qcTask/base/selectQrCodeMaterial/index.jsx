import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { Table, Badge, Tooltip } from 'components';
import moment from 'utils/time';
import { thousandBitSeparator } from 'utils/number';
import { getMaterialLotList } from 'src/services/stock/material';
import { getAdmitMaterialList } from 'src/services/inventory/index';
import { replaceSign } from 'constants';
import { QUALITY_STATUS, INPUT_FACTORY_QC } from 'src/views/qualityManagement/constants';

import Filter from './filter';

type Props = {
  checkType: Number,
  storageId: String,
  materialCode: String,
  selectedRowKeys: [],
  selectedRows: [], // 当下选择的数据
  checkMaterials: [], // 上一次选择过的数据
  onSelectChange: () => {},
};

class SelectQrCodeMaterial extends Component {
  constructor(props: Props) {
    super(props);
    this.filterRef = React.createRef();
    this.state = {
      loading: false,
      dataSource: [],
    };
  }

  componentDidMount = () => {
    this.onSearch();
  };

  filterAndSetData = (data, selected) => {
    const difference = _.differenceWith(data, selected, _.isEqual);
    this.setState({ dataSource: difference });
  };

  onSearch = () => {
    const { storageId, materialCode, checkType } = this.props;
    const { getFieldsValue } = this.filterRef.current;
    const params = getFieldsValue();
    let { qrCode, supplierCode } = params || {};
    qrCode = qrCode !== '' ? qrCode : undefined;
    supplierCode = supplierCode && supplierCode.key;

    let _params;
    if (checkType === INPUT_FACTORY_QC) {
      let { procureOrderNumber } = params || {};
      const { qcStatus, inboundBatch, createdAt } = params || {};
      const createdAtBegin = Date.parse(createdAt[0]);
      const createdAtEnd = Date.parse(createdAt[1]);
      procureOrderNumber = procureOrderNumber && procureOrderNumber.key;
      _params = _.omitBy(
        {
          size: 300,
          qrCode,
          supplierCode,
          createdAtBegin,
          createdAtEnd,
          qcStatus: _.compact(qcStatus),
          inboundBatch,
          procureOrderNumber,
          secondStorageId: storageId,
          materialCode,
        },
        _.isUndefined,
      );
    } else {
      _params = _.omitBy(
        {
          size: 300,
          qrCode,
          supplierCode,
          secondStorageId: storageId,
          materialCode,
        },
        _.isUndefined,
      );
    }
    this.fetchQrCodeMaterials(_params);
  };

  fetchQrCodeMaterials = async params => {
    const { checkType } = this.props;
    const getMaterialList = checkType === INPUT_FACTORY_QC ? getAdmitMaterialList : getMaterialLotList;
    this.setState({ loading: true });
    await getMaterialList(params)
      .then(({ data: { data } }) => {
        this.filterAndSetData(data, this.props.checkMaterials);
        this.props.onSelectChange([], []);
      })
      .finally(() => this.setState({ loading: false }));
  };

  getColumns = () => {
    const { checkType } = this.props;

    const columns = [
      {
        title: '二维码',
        dataIndex: 'code',
        width: 130,
      },
      {
        title: '数量',
        dataIndex: 'amount',
        width: 100,
        render: amount => (typeof amount === 'number' ? thousandBitSeparator(amount) : replaceSign),
      },
      {
        title: '质量状态',
        dataIndex: 'qcStatus',
        width: 100,
        render: qcStatus => {
          const { name, color } = QUALITY_STATUS[qcStatus] || {};

          return name ? <Badge.MyBadge text={name || replaceSign} color={color} /> : replaceSign;
        },
      },
    ];

    if (checkType === INPUT_FACTORY_QC) {
      columns.push(
        {
          title: '供应商编号/名称',
          dataIndex: 'supplier',
          width: 200,
          render: supplier => {
            const { code, name } = supplier || {};
            return code ? `${code}/${name}` : replaceSign;
          },
        },
        {
          title: '供应商批次号',
          dataIndex: 'mfgBatches',
          width: 200,
          render: data => {
            const mfgBatchNos = [];
            if (Array.isArray(data)) {
              data.forEach(({ mfgBatchNo }) => mfgBatchNos.push(mfgBatchNo));
            }

            return (
              <Tooltip
                text={Array.isArray(mfgBatchNos) && mfgBatchNos.length ? mfgBatchNos.join(',') : replaceSign}
                length={20}
              />
            );
          },
        },
        {
          title: '创建时间',
          dataIndex: 'createdAt',
          width: 120,
          render: createdAt => moment(createdAt).format('YYYY-MM-DD HH:mm'),
        },
        {
          title: '入厂批次',
          dataIndex: 'inboundBatch',
          width: 120,
          render: inboundBatch => inboundBatch || replaceSign,
        },
        {
          title: '采购清单',
          dataIndex: 'procureOrder',
          width: 120,
          render: procureOrderNumber => procureOrderNumber || replaceSign,
        },
      );
    }

    columns.push({
      title: '仓位',
      width: 180,
      dataIndex: 'storageInfo.name',
    });

    return columns;
  };

  render() {
    const { checkType, selectedRowKeys, onSelectChange } = this.props;
    const { dataSource, loading } = this.state;
    const { changeChineseTemplateToLocale } = this.context;
    const columns = this.getColumns();
    const rowSelection = {
      selectedRowKeys,
      onChange: onSelectChange,
    };
    const hasSelected = selectedRowKeys.length > 0;

    return (
      <div>
        <Filter ref={this.filterRef} checkType={checkType} onSearch={this.onSearch} />
        <Table
          loading={loading}
          style={{ width: 820, margin: 0 }}
          scroll={{ y: 240, x: true }}
          rowSelection={rowSelection}
          pagination={false}
          rowKey={record => record.id}
          dataSource={dataSource}
          columns={columns}
          size="middle"
        />
        <div style={{ marginTop: 10 }}>
          {hasSelected
            ? changeChineseTemplateToLocale('已选 {selectedRow} 个，共 {total} 条', {
                selectedRow: selectedRowKeys.length,
                total: dataSource && dataSource.length,
              })
            : ''}
        </div>
      </div>
    );
  }
}

SelectQrCodeMaterial.contextTypes = {
  changeChineseTemplateToLocale: PropTypes.any,
};

export default SelectQrCodeMaterial;
