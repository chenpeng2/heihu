import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { connect } from 'react-redux';

import { getQuery } from 'src/routes/getRouteParams';
import { Tooltip, RestPagingTable } from 'src/components';
import { replaceSign } from 'src/constants';
import { primary } from 'src/styles/color';

import { TAG_TYPE, EXPORT_SIGN, PRINT_SIGN } from '../../../constant';
import { ELECTRONIC_TAG_MODEL, findElectronicTagModel } from '../../utils';

type Props = {
  style: {},
  match: {},
  data: [],
  fetchData: () => {},
  totalAmount: number,
  selectedAll: boolean,
  selectedLabelIds: [],
  saveSelectedTagIds: any,
};

export const getColumns = () => {
  return [
    {
      title: '条码标签编号',
      fixed: 'left',
      dataIndex: 'labelSeq',
      width: 200,
      render: data => {
        return <Tooltip text={data} length={20} />;
      },
    },
    {
      title: '条码标签类型',
      width: 100,
      dataIndex: 'labelType',
      render: data => {
        const value = TAG_TYPE[data] ? TAG_TYPE[data].name : replaceSign;

        return <Tooltip text={value} length={20} />;
      },
    },
    {
      title: '条码标签规则',
      dataIndex: 'ruleName',
      width: 150,
      render: data => {
        return <Tooltip text={data || replaceSign} length={20} />;
      },
    },
    {
      title: '产品批次号',
      dataIndex: 'productBatchSeq',
      render: data => {
        return <Tooltip text={data || replaceSign} length={20} />;
      },
    },
    {
      title: '产品序列号',
      width: 200,
      dataIndex: 'productSeq',
      render: data => {
        return <Tooltip text={data || replaceSign} length={20} />;
      },
    },
    {
      title: '包含产品数量',
      width: 100,
      dataIndex: 'productAmount',
      render: (data, record) => {
        const unit = _.get(record, 'productUnit');
        const text = data ? `${data} ${unit}` : replaceSign;
        return <Tooltip text={text} length={20} />;
      },
    },
    {
      title: '导出次数',
      width: 100,
      dataIndex: 'exportCount',
      render: data => {
        const text = typeof data === 'number' ? data.toString() : replaceSign;
        return <Tooltip text={text} length={20} />;
      },
    },
    {
      title: '打印次数',
      width: 100,
      dataIndex: 'printCount',
      render: data => {
        const text = typeof data === 'number' ? data.toString() : replaceSign;
        return <Tooltip text={text} length={20} />;
      },
    },
    {
      title: '导出标识',
      width: 120,
      key: 'exportSign',
      render: (__, record) => {
        const { exportCount } = record;

        if (exportCount > 0) return <span>{EXPORT_SIGN.export.name}</span>;
        return <span>{EXPORT_SIGN.unExport.name}</span>;
      },
    },
    {
      title: '打印标识',
      key: 'printSign',
      width: 120,
      render: (__, record) => {
        const { printCount } = record;

        if (printCount > 0) return <span>{PRINT_SIGN.print.name}</span>;
        return <span>{PRINT_SIGN.unPrint.name}</span>;
      },
    },
    {
      title: '标签模式',
      dataIndex: 'type',
      width: 120,
      render: data => {
        const { name } = findElectronicTagModel(data) || {};
        return name || replaceSign;
      },
    },
  ];
};

class Table extends Component {
  state = {
    selectedRowKeys: [],
    pagination: {},
    total: 0,
  };
  props: Props;

  componentDidMount() {
    this.setSelectedRowKeys(this.props);
  }

  componentWillReceiveProps(nextProps) {
    if (!_.isEqual(nextProps.selectedLabelIds, this.props.selectedLabelIds)) {
      this.setSelectedRowKeys(nextProps);
    }
    const { match } = this.props;
    const { totalAmount, match: nextMatch } = nextProps;
    const { tagPage } = getQuery(match);
    const { tagPage: nextPage } = getQuery(nextMatch);
    const { total: oldTotal, pagination } = this.state;
    if (totalAmount !== oldTotal || nextPage !== tagPage) {
      this.setState({
        total: totalAmount,
        pagination: {
          ...pagination,
          current: nextPage || 1,
          total: totalAmount,
        },
      });
    }
  }

  setSelectedRowKeys = props => {
    const { selectedLabelIds } = props || this.props;

    this.setState({ selectedRowKeys: selectedLabelIds });
  };

  getColumns = () => {
    const { changeChineseToLocale } = this.context;
    const columns = getColumns();
    const operation = {
      title: '操作',
      width: 120,
      fixed: 'right',
      render: (__, record) => {
        const { router } = this.context;
        const { labelId } = record || {};

        return (
          <span
            style={{ color: primary, cursor: 'pointer' }}
            onClick={() => {
              if (labelId) {
                router.history.push(`/electronicTag/print/${labelId}/operationHistory`);
              }
            }}
          >
            {changeChineseToLocale('操作记录')}
          </span>
        );
      },
    };
    columns.push(operation);

    return columns;
  };

  handleTableChange = async (pagination, filters, sorter) => {
    this.setState({ loading: true });
    await this.props.fetchData({ page: pagination.current, tagPage: pagination.current });
    this.setState({ loading: false, pagination });
  };

  getRowSelection = () => {
    const { saveSelectedTagIds } = this.props;
    const { selectedRowKeys } = this.state;

    const onSelectChange = selectedRowKeys => {
      this.setState({ selectedRowKeys });
      if (typeof saveSelectedTagIds === 'function') saveSelectedTagIds(selectedRowKeys);
    };

    return {
      hideDefaultSelections: true,
      selectedRowKeys,
      onChange: onSelectChange,
      fixed: true,
    };
  };

  render() {
    const { data, selectedAll } = this.props;
    const { pagination } = this.state;
    const columns = this.getColumns();
    const rowSelection = this.getRowSelection();

    const _data = data.map(i => {
      i.key = i.labelId;
      return i;
    });

    return (
      <RestPagingTable
        rowSelection={selectedAll ? null : rowSelection}
        style={{ margin: 0 }}
        dataSource={_data || []}
        columns={columns}
        pagination={pagination}
        onChange={this.handleTableChange}
        scroll={{ x: 1600 }}
      />
    );
  }
}

Table.contextTypes = {
  router: PropTypes.any,
  changeChineseToLocale: PropTypes.any,
};

export default Table;
