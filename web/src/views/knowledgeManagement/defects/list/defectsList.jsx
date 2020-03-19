import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import _ from 'lodash';
import { getTablePageSizeFromLocalStorage } from 'utils/localStorage';
import { setLocation, getParams } from 'src/utils/url';
import getDefects from 'src/services/knowledgeBase/defect';
import { buttonAuthorityWrapper, Badge, Spin, OpenModal, Button, Tooltip, Link, Table } from 'src/components';
import { replaceSign } from 'src/constants';
import log from 'src/utils/log';
import { border } from 'src/styles/color';
import auth from 'src/utils/auth';

import { knowledgeItem, findStatus } from '../constants';
import CreateUnit from '../create';
import EditUnit from '../edit';
import Filter, { formatFilterValue } from './filter';
import UpdateStatus from '../baseComponent/updateStatus';
import ImportButton from './importButton';

const MyBadge = Badge.MyBadge;
const ButtonWithAuth = buttonAuthorityWrapper(Button);
const tableUniqueKey = 'defect-list-table';

type Props = {
  loading: boolean,
  viewer: any,
  match: {},
};

class UnitsList extends Component {
  props: Props;
  state = {};

  fetchData = async params => {
    const pageSize = getTablePageSizeFromLocalStorage(tableUniqueKey);
    this.setState({ loading: true });

    const { filter, ...rest } = params || {};
    const { filter: lastFilter, ...lastRest } = _.get(getParams(), 'queryObj');

    const nextFilter = { ...lastFilter, ...filter };
    const nextQuery = { size: pageSize, page: 1, ...lastRest, ...formatFilterValue(nextFilter), ...rest };
    const nextPage = nextQuery ? nextQuery.page : 1;

    setLocation(this.props, { size: pageSize, page: 1, ...lastRest, filter: nextFilter, ...rest });

    try {
      const res = await getDefects(nextQuery);
      const { data, count } = _.get(res, 'data');
      this.setState({
        dataSource: data,
        pagination: {
          current: nextPage,
          total: count,
          pageSize: (nextQuery && nextQuery.size) || pageSize,
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
        title: '编号',
        dataIndex: 'code',
        render: data => data || replaceSign,
      },
      {
        title: '名称',
        dataIndex: 'name',
        key: 'name',
        render: name => {
          return name || replaceSign;
        },
      },
      {
        title: '分类',
        dataIndex: 'defectGroupName',
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
        title: '备注',
        dataIndex: 'remark',
        key: 'remark',
        render: remark => <Tooltip text={remark || replaceSign} length={20} />,
      },
      {
        title: '操作',
        dataIndex: 'id',
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
              <Link
                auth={auth.WEB_DEFECT_EDIT}
                onClick={() => {
                  OpenModal(
                    {
                      title: `编辑${knowledgeItem.display}`,
                      children: <EditUnit id={id} />,
                      footer: null,
                      width: 550,
                      onCompeleted: () => {
                        this.fetchData();
                      },
                    },
                    this.context,
                  );
                }}
              >
                编辑
              </Link>
            </div>
          );
        },
      },
    ];
    return columns.map(node => ({
      width: 130,
      ...node,
    }));
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
            <ButtonWithAuth
              auth={auth.WEB_DEFECT_CREATE}
              icon="plus-circle-o"
              onClick={() => {
                OpenModal({
                  children: <CreateUnit />,
                  title: `创建${knowledgeItem.display}`,
                  footer: null,
                  width: 550,
                  onCompeleted: () => {
                    this.fetchData();
                  },
                });
              }}
            >
              {`创建${knowledgeItem.display}`}
            </ButtonWithAuth>
            <ImportButton fetchData={this.fetchData} style={{ marginLeft: 10 }} />
          </div>
          <Table
            scroll={{ x: true }}
            tableUniqueKey={tableUniqueKey}
            dragable
            dataSource={dataSource}
            columns={this.getColumns()}
            pagination={pagination}
            refetch={this.fetchData}
          />
        </div>
      </Spin>
    );
  }
}

export default withRouter(UnitsList);
