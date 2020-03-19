import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import _ from 'lodash';

import { setLocation, getParams } from 'src/utils/url';
import auth from 'src/utils/auth';
import { getPreparationTimeList } from 'src/services/knowledgeBase/preparationTime';
import { Badge, Spin, openModal, Button, Tooltip, Link, buttonAuthorityWrapper, Table } from 'components';
import { convertTimeAndUnit } from 'utils/string';
import { replaceSign } from 'src/constants';
import log from 'src/utils/log';
import { border } from 'src/styles/color';
import { findUnitStatus } from 'src/containers/unit/util';

import Create from '../create';
import Edit from '../edit';
import Filter, { formatFilterValue } from './filter';
import UpdateStatus from '../baseComponent/updateStatus';
import { knowledgeItem, TYPES, getDetailPath } from '../utils';

const TYPES_MAP = _.keyBy(TYPES, 'value');

const MyBadge = Badge.MyBadge;
const LinkWithAuth = buttonAuthorityWrapper(Link);
const ButtonWithAuth = buttonAuthorityWrapper(Button);

type Props = {
  loading: boolean,
  viewer: any,
  match: {},
};

class PreparationTimeList extends Component {
  props: Props;
  state = {};

  fetchData = async (params = {}) => {
    this.setState({ loading: true });

    const { queryObj } = getParams();
    const { query, filter } = queryObj || {};

    const nextQuery = { size: 10, page: 1, ...formatFilterValue({ ...query, ...params }) };
    const nextFilter = { ...filter, ...params };
    const nextPage = nextQuery ? nextQuery.page : 1;

    setLocation(this.props, p => {
      return { ...p, filter: nextFilter, query: nextQuery };
    });

    try {
      const res = await getPreparationTimeList(nextQuery);
      const { data, count } = _.get(res, 'data');
      this.setState({ dataSource: data, count });
    } catch (e) {
      log.error(e);
    } finally {
      this.setState({ loading: false, page: nextPage });
    }
  };

  getColumns = () => {
    const columns = [
      {
        title: '编号',
        dataIndex: 'code',
        key: 'code',
        width: 240,
        render: code => {
          return <Tooltip text={code || replaceSign} length={20} />;
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
        title: '工位',
        dataIndex: 'workstationName',
        key: 'workstationName',
        render: data => data || replaceSign,
      },
      {
        title: '规则',
        dataIndex: 'type',
        key: 'type',
        render: data => {
          const { display } = TYPES_MAP[data] || {};
          return display || replaceSign;
        },
      },
      {
        title: '准备时间',
        dataIndex: 'time',
        key: 'time',
        render: (time, { unit }) => {
          return convertTimeAndUnit({ time, targetUnit: unit }) || replaceSign;
        },
      },
      {
        title: '操作',
        dataIndex: 'id',
        render: (id, record) => {
          const { status } = record || {};
          return (
            <div key={`action-${id}`}>
              <LinkWithAuth
                auth={auth.WEB_EDIT_PREPARETION_TIME}
                style={{ marginRight: 10 }}
                onClick={() => {
                  openModal(
                    {
                      title: `编辑${knowledgeItem.display}`,
                      children: <Edit id={id} />,
                      footer: null,
                      onCompeleted: () => {
                        this.fetchData();
                      },
                    },
                    this.context,
                  );
                }}
              >
                编辑
              </LinkWithAuth>
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
    const { dataSource, count, loading, page } = this.state;

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
            <ButtonWithAuth
              icon="plus"
              auth={auth.WEB_VIEW_PREPARETION_TIME}
              onClick={() => {
                openModal({
                  children: <Create />,
                  title: `创建${knowledgeItem.display}`,
                  footer: null,
                  onCompeleted: () => {
                    this.fetchData();
                  },
                });
              }}
            >
              {`创建${knowledgeItem.display}`}
            </ButtonWithAuth>
          </div>
          <Table
            dataSource={dataSource}
            columns={this.getColumns()}
            pagination={{ total: count, current: page || 1 }}
            onChange={pagination => {
              this.fetchData({ page: pagination.current, size: pagination.pageSize });
            }}
          />
        </div>
      </Spin>
    );
  }
}

PreparationTimeList.contextTypes = {
  router: {},
};

export default withRouter(PreparationTimeList);
