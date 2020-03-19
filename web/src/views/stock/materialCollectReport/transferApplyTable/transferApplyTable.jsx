/**
 * @description: 占用信息table。主要展示当前物料的转移申请
 *
 * @date: 2019/5/5 上午10:30
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import { Table, Tooltip, withForm } from 'src/components/index';
import { getOccupyItems } from 'src/services/cooperate/materialRequest';
import log from 'src/utils/log';
import { replaceSign } from 'src/constants';
import { secondaryGrey } from 'src/styles/color';

import Filter from './filter';

class TransferApplyTable extends Component {
  state = {
    tableData: [],
    pagination: { current: 1, pageSize: 10, total: 0 },
    loading: false,
  };

  componentDidMount() {
    this.fetchData();
  }

  fetchData = async params => {
    const { data } = this.props;
    if (!data) return;

    const { filter, ...rest } = params || {};

    const { warehouseCode, materialInfo } = data;
    const { code: materialCode } = materialInfo || {};

    const nextParams = { materialCode, warehouseCode, ...rest };

    this.setState({ loading: true });
    try {
      const res = await getOccupyItems(nextParams);
      const { data, total } = _.get(res, 'data');
      this.setState({
        tableData: data,
        pagination: { current: nextParams.page || 1, pageSize: nextParams.size || 10, total },
      });
    } catch (e) {
      log.error(e);
    } finally {
      this.setState({ loading: false });
    }
  };

  getColumns = () => {
    const { data } = this.props;
    const unitName = _.get(data, 'materialInfo.unitName');

    return [
      {
        title: '转移申请编号',
        dataIndex: 'code',
        width: 200,
        render: data => <Tooltip text={data} length={20} />,
      },
      {
        title: '物料',
        key: 'material',
        width: 200,
        render: (__, data) => {
          const { materialCode, materialName } = data || {};
          const text = `${materialCode || replaceSign}/${materialName || replaceSign}`;
          return <Tooltip text={text} length={20} />;
        },
      },
      {
        title: '占用数量',
        dataIndex: 'amount',
        width: 200,
        render: data => {
          const text = typeof data === 'number' ? `${data} ${unitName}` : replaceSign;
          return <Tooltip text={text} length={10} />;
        },
      },
      {
        title: '备注',
        dataIndex: 'remark',
        width: 200,
        render: data => {
          return <Tooltip text={data || replaceSign} length={20} />;
        },
      },
    ];
  };

  render() {
    const { tableData, pagination, loading } = this.state;
    const { style, form, data } = this.props;
    const { changeChineseTemplateToLocale } = this.context;

    const { controlledAmount, materialInfo } = data || {};
    const unitName = _.get(materialInfo, 'unitName');
    const text = typeof controlledAmount === 'number' ? `${controlledAmount} ${unitName || replaceSign}` : replaceSign;

    return (
      <div style={{ paddingBottom: 50 }}>
        <Filter form={form} refetch={this.fetchData} />
        <div style={{ margin: '0px 20px 20px' }}>
          <span style={{ color: secondaryGrey }}>{changeChineseTemplateToLocale('占用数量：{amount}', { amount: text })}</span>
        </div>
        <Table
          scroll={{ y: 300 }}
          refetch={this.fetchData}
          loading={loading}
          style={style}
          columns={this.getColumns()}
          dataSource={tableData || []}
          pagination={pagination}
        />
      </div>
    );
  }
}

TransferApplyTable.propTypes = {
  style: PropTypes.object,
  form: PropTypes.any,
  data: PropTypes.any,
};

TransferApplyTable.contextTypes = {
  changeChineseTemplateToLocale: PropTypes.any,
};


export default withForm({}, TransferApplyTable);
