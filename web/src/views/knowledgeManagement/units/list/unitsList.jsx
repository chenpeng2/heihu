import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import _ from 'lodash';

import { setLocation, getParams } from 'src/utils/url';
import units from 'src/services/knowledgeBase/unit';
import { Badge, Spin, OpenModal, Button, Link, RestPagingTable, FormattedMessage } from 'src/components';
import { replaceSign } from 'src/constants';
import log from 'src/utils/log';
import { border } from 'src/styles/color';
import { findUnitStatus } from 'src/containers/unit/util';

import CreateUnit from '../create';
import EditUnit from '../edit';
import Filter, { formatFilterValue } from './filter';
import UpdateStatus from '../baseComponent/updateUnitStatus';

const MyBadge = Badge.MyBadge;

const knowledgeItem = {
  value: 'unit',
  display: '单位',
};

type Props = {
  loading: boolean,
  viewer: any,
  match: {},
};

class UnitsList extends Component {
  props: Props;
  state = {};

  fetchData = async (params = {}) => {
    this.setState({ loading: true });

    const { queryObj } = getParams();
    const { filter: lastFilter, ...lastRest } = queryObj || {};
    const { filter, ...rest } = params;

    const nextFilter = { ...lastFilter, ...filter };
    const nextQuery = { size: 10, ...lastRest, ...rest, ...formatFilterValue(nextFilter) };

    setLocation(this.props, {
      filter: nextFilter,
      ...lastRest,
      ...rest,
    });

    try {
      const res = await units(nextQuery);
      const { data, count } = _.get(res, 'data');
      this.setState({ dataSource: data, count });
    } catch (e) {
      log.error(e);
    } finally {
      this.setState({ loading: false });
    }
  };

  getColumns = () => {
    const columns = [
      {
        title: '名称',
        dataIndex: 'name',
        key: 'name',
        render: name => {
          return name || replaceSign;
        },
      },
      {
        title: '状态',
        dataIndex: 'status',
        render: data => {
          const { name, color } = findUnitStatus(data) || {};
          return <MyBadge text={name} color={color} />;
        },
      },
      {
        title: '备注',
        dataIndex: 'desc',
        key: 'desc',
        render: desc => desc || replaceSign,
      },
      {
        title: '操作',
        dataIndex: 'id',
        render: (id, record) => {
          const { status } = record || {};
          return (
            <div key={`action-${id}`}>
              <Link
                icon="edit"
                style={{ marginRight: 10 }}
                onClick={() => {
                  OpenModal(
                    {
                      title: `编辑${knowledgeItem.display}`,
                      children: <EditUnit id={id} />,
                      footer: null,
                      onCompeleted: () => {
                        this.fetchData();
                      },
                    },
                    this.context,
                  );
                }}
              />
              <UpdateStatus
                cbForUpdate={() => {
                  this.fetchData();
                }}
                style={{ marginLeft: 5, display: 'inline-block' }}
                id={id}
                statusNow={status}
              />
            </div>
          );
        },
      },
    ];
    return columns;
  };

  render() {
    const { dataSource, count, loading } = this.state;

    return (
      <Spin spinning={loading}>
        <div>
          <Filter style={{ margin: 20 }} fetchData={this.fetchData} />
          <div
            style={{
              display: 'flex',
              padding: '20px 20px',
              justifyContent: 'space-between',
              borderTop: `1px solid ${border}`,
            }}
          >
            <Button
              icon="plus"
              onClick={() => {
                OpenModal({
                  children: <CreateUnit />,
                  title: `创建${knowledgeItem.display}`,
                  footer: null,
                  onCompeleted: () => {
                    this.fetchData();
                  },
                });
              }}
            >
              <FormattedMessage defaultMessage={`创建${knowledgeItem.display}`} />
            </Button>
          </div>
          <RestPagingTable refetch={this.fetchData} dataSource={dataSource} columns={this.getColumns()} total={count} />
        </div>
      </Spin>
    );
  }
}

export default withRouter(UnitsList);
