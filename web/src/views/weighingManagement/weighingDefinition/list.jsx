import React, { Component } from 'react';
import _ from 'lodash';
import { withRouter } from 'react-router-dom';

import { setLocation } from 'utils/url';
import { getQuery } from 'src/routes/getRouteParams';
import { RestPagingTable, Badge, Link, message, Tooltip } from 'components';
import { queryWeighingDefinitionList, updateWeighingDefinitionStatus } from 'src/services/weighing/weighingDefinition';
import { formatDateTime } from 'utils/time';
import { arrayIsEmpty } from 'utils/array';
import { replaceSign } from 'src/constants';

import WeighingDefinitionFilter from './base/filterForList';
import WeighingDefinitionAction from './base/actionForList';

type Props = {
  match: any,
};

class WeighingDefinitionList extends Component {
  props: Props;
  state = {
    loading: false,
    dataSource: [],
    total: 0,
  };

  componentDidMount = () => {
    this.fetchData();
  };

  updateDefinitionStatus = async (id, status) => {
    const action = status === 1 ? 'disable' : 'enable';
    const actionName = status === 1 ? '停用' : '启用';

    await updateWeighingDefinitionStatus(id, action)
      .then(({ data }) => {
        const { statusCode } = data;
        if (statusCode === 200) {
          message.success(`${actionName}成功！`);
          this.fetchData();
        } else {
          message.success(`${actionName}失败！`);
        }
      })
      .catch(err => console.log(err));
  };

  getColumns = () => {
    return [
      {
        title: '定义编码',
        key: 'code',
        dataIndex: 'code',
      },
      {
        title: '成品物料',
        key: 'productCode',
        dataIndex: 'productCode',
        render: (productCode, record) => {
          const { productName } = record;
          return `${productCode || replaceSign}/${productName || replaceSign}`;
        },
      },
      {
        title: '物料清单',
        key: 'ebomVersion',
        dataIndex: 'ebomVersion',
      },
      {
        title: '称量工位',
        key: 'workstations',
        dataIndex: 'workstations',
        render: workstations => {
          if (arrayIsEmpty(workstations)) return replaceSign;
          const workstationNames = workstations.map(({ name }) => name).join(',');
          return <Tooltip text={workstationNames} length={15} />;
        },
      },
      {
        title: '更新时间',
        key: 'updatedAt',
        dataIndex: 'updatedAt',
        render: data => (data ? formatDateTime(data) : replaceSign),
      },
      {
        title: '启用状态',
        key: 'status',
        dataIndex: 'status',
        render: data => {
          if (!data) return replaceSign;

          return data === 1 ? <Badge text="启用中" status="success" /> : <Badge text="停用中" status="error" />;
        },
      },
      {
        title: '操作',
        key: 'operations',
        dataIndex: 'operations',
        render: (_, record) => {
          const { status, id } = record;
          const display = status === 1 ? '停用' : '启用';

          return (
            <div>
              <Link style={{ marginRight: 10 }} onClick={() => this.updateDefinitionStatus(id, status)}>
                {display}
              </Link>
              <Link to={`/weighingManagement/weighingDefinition/edit/${id}`}>编辑</Link>
            </div>
          );
        },
      },
    ];
  };

  formatData = values => {
    const { code, productCode } = values;

    values.code = code && code.trim();
    values.productCode = productCode && productCode.key;

    return _.omitBy(values, o => o === '');
  };

  fetchData = async params => {
    this.setState({ loading: true });
    const { match } = this.props;
    const query = getQuery(match);
    setLocation(this.props, p => ({ ...p, ...params }));
    const _params = this.formatData({ ...query, ...params });
    await queryWeighingDefinitionList(_params)
      .then(({ data: { data, count } }) => {
        this.setState({
          dataSource: data,
          total: count,
        });
      })
      .catch(err => console.log(err));
    this.setState({ loading: false });
  };

  render() {
    const { dataSource, loading, total } = this.state;

    return (
      <div>
        <WeighingDefinitionFilter fetchData={this.fetchData} />
        <WeighingDefinitionAction />
        <RestPagingTable
          style={dataSource.length ? null : { borderBottom: 'none' }}
          rowKey={record => record.id}
          columns={this.getColumns()}
          refetch={this.fetchData}
          dataSource={dataSource}
          loading={loading}
          total={total}
        />
      </div>
    );
  }
}

export default withRouter(WeighingDefinitionList);
