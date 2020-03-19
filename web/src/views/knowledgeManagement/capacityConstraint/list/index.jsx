import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import _ from 'lodash';
import { setLocation, getParams } from 'src/utils/url';
import { getCapacityConstraints } from 'src/services/knowledgeBase/capacityConstraint';
import { buttonAuthorityWrapper, Badge, Spin, OpenModal, Button, Tooltip, Link, Table } from 'src/components';
import { replaceSign } from 'src/constants';
import log from 'src/utils/log';
import { border } from 'src/styles/color';

import { knowledgeItem, findStatus } from '../constants';
// import CreateUnit from '../create';
// import EditUnit from '../edit';
import Filter, { formatFilterValue } from './filter';
import UpdateStatus from '../baseComponent/updateStatus';
// import ImportButton from './importButton';

const MyBadge = Badge.MyBadge;

type Props = {
  loading: boolean,
  viewer: any,
  match: {},
};

class CapacityConstraintList extends Component {
  props: Props;
  state = {};

  fetchData = async params => {
    this.setState({ loading: true });

    const { filter, ...rest } = params || {};
    const { filter: lastFilter, ...lastRest } = _.get(getParams(), 'queryObj');

    const nextFilter = { ...lastFilter, ...filter };
    const nextQuery = { size: 10, page: 1, ...lastRest, ...formatFilterValue(nextFilter), ...rest };
    const nextPage = nextQuery ? nextQuery.page : 1;

    setLocation(this.props, { size: 10, page: 1, ...lastRest, filter: nextFilter, ...rest });

    try {
      const res = await getCapacityConstraints(nextQuery);
      const { data, count } = _.get(res, 'data');
      this.setState({
        dataSource: data,
        pagination: {
          current: nextPage,
          total: count,
          pageSize: (nextQuery && nextQuery.size) || 10,
        },
      });
    } catch (e) {
      log.error(e);
    } finally {
      this.setState({ loading: false, page: nextPage });
    }
  };

  getColumns = () => {
    const columns = [
      {
        title: '工位',
        dataIndex: 'workstationName',
        render: data => data || replaceSign,
      },
      {
        title: '状态',
        dataIndex: 'status',
        render: data => {
          const { name, color } = findStatus(data) || {};
          return <MyBadge text={name} color={color} />;
        },
      },
      {
        title: '单位时间',
        dataIndex: 'workstationName',
        render: data => '1个自然日',
      },
      {
        title: '任务数量上限',
        dataIndex: 'taskLimit',
        render: data => data || replaceSign,
      },
      {
        title: '操作',
        dataIndex: 'workstationId',
        render: (id, record) => {
          const { status } = record || {};
          return (
            <div key={`action-${id}`}>
              <UpdateStatus
                cbForUpdate={() => {
                  this.fetchData();
                }}
                data={record}
                style={{ marginRight: 5, display: 'inline-block' }}
                id={id}
                statusNow={status}
              />
              <Link to={`/knowledgeManagement/capacityConstraint/${id}/edit`}>编辑</Link>
            </div>
          );
        },
      },
    ];
    return columns;
  };

  render() {
    const { dataSource, loading, pagination } = this.state;

    return (
      <Spin spinning={loading}>
        <div>
          <Filter style={{ margin: 20 }} fetchData={this.fetchData} />
          <div
            style={{
              padding: '20px 20px',
              borderTop: `1px solid ${border}`,
            }}
          >
            <Button
              icon="plus-circle-o"
              onClick={() => {
                this.context.router.history.push('/knowledgeManagement/capacityConstraint/create');
              }}
            >
              {`创建${knowledgeItem.display}`}
            </Button>
            {/* <ImportButton fetchData={this.fetchData} style={{ marginLeft: 10 }} /> */}
          </div>
          <Table dataSource={dataSource} columns={this.getColumns()} pagination={pagination} refetch={this.fetchData} />
        </div>
      </Spin>
    );
  }
}

CapacityConstraintList.contextTypes = {
  router: {},
};

export default withRouter(CapacityConstraintList);
