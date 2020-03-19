import React, { Component } from 'react';
import _ from 'lodash';
import { RestPagingTable, withForm, Badge, Link } from 'components';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { formatUnix } from 'utils/time';
import { getQuery } from 'src/routes/getRouteParams';
import { setLocation } from 'utils/url';
import { replaceSign } from 'src/constants';
import { queryPurchaseOrderImportLog } from 'src/services/cooperate/purchaseOrder';
import FilterForLog from './filter';

type Props = {
  form: any,
  match: any,
};

class PurchaseOrderImportLog extends Component {
  props: Props;
  state = {
    pagination: {},
    dataSource: [],
  };

  componentDidMount = () => {
    this.fetchData();
  };

  getColumns = () => {
    const { changeChineseTemplateToLocale } = this.context;
    return [
      {
        title: '导入时间',
        dataIndex: 'createdAt',
        width: 200,
        render: text => formatUnix(text),
      },
      {
        title: '导入用户',
        dataIndex: 'userName',
        width: 160,
        render: text => (text ? decodeURIComponent(text) : replaceSign),
      },
      {
        title: '导入结果',
        width: 160,
        render: record => {
          if (record.failureAmount === 0) {
            return <Badge status="success" text="导入成功" />;
          } else if (record.successAmount === 0) {
            return <Badge status="error" text="导入失败" />;
          }
          return <Badge status="warning" text="部分导入成功" />;
        },
      },
      {
        title: '导入详情',
        render: record => (
          <div>
            {changeChineseTemplateToLocale('销售订单导入完成！成功数：{successAmount}，失败数：{failureAmount}。', {
              successAmount: record.successAmount,
              failureAmount: record.failureAmount,
            })}
          </div>
        ),
      },
      {
        title: '操作',
        dataIndex: 'importId',
        width: 120,
        render: (text, record) => (
          <div key={`code-${text}`}>
            <Link
              style={{ marginRight: 20 }}
              onClick={() => {
                this.context.router.history.push(`/cooperate/purchaseOrders/logs/import/${text}`);
              }}
            >
              查看
            </Link>
          </div>
        ),
      },
    ];
  };

  fetchData = async params => {
    this.setState({ loading: true });
    const { match } = this.props;
    const query = getQuery(match);
    const _params = { ...query, ...params };
    setLocation(this.props, p => ({ ...p, ...params }));
    const {
      data: { data, total },
    } = await queryPurchaseOrderImportLog({ size: 10, ..._params });
    this.setState({
      dataSource: data,
      loading: false,
      pagination: {
        total,
        pageSize: 10,
        current: (_params && _params.page) || 1,
      },
    });
  };

  render() {
    const { form } = this.props;
    const { dataSource, pagination } = this.state;
    const columns = this.getColumns();

    return (
      <div>
        <FilterForLog form={form} fetchData={this.fetchData} />
        <RestPagingTable
          bordered
          dataSource={dataSource}
          columns={columns}
          rowKey={record => record.id}
          pagination={pagination}
          refetch={this.fetchData}
          onChange={pagination => {
            const { pageSize, current } = pagination || {};
            this.fetchData({ size: pageSize, page: current });
          }}
        />
      </div>
    );
  }
}

PurchaseOrderImportLog.contextTypes = {
  router: PropTypes.object,
  changeChineseTemplateToLocale: () => {},
};

export default withForm({}, withRouter(PurchaseOrderImportLog));
