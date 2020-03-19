import React, { useState } from 'react';
import _ from 'lodash';
import { withRouter } from 'react-router-dom';
import { Link, Badge, Table, Spin, message } from 'src/components';
import { replaceSign } from 'src/constants';
import { getQuery } from 'src/routes/getRouteParams';
import { updatemoveTransactionStatus } from 'src/services/knowledgeBase/moveTransactions';
import log from 'src/utils/log';
import { error, primary } from 'src/styles/color';
import { getEditMoveTransactionsUrl, getDetailMoveTransactionsUrl } from './utils';
import { MOVE_TRANSACTIONS_STATUS, findModuleNameByValue } from './constants';

type Props = {
  data: any,
  history: any,
  match: any,
  refreshData: () => {},
};

const List = (props: Props) => {
  const { history, data = {}, refreshData, match } = props;
  const [loading, setLoading] = useState(false);
  const getColumns = () => {
    return [
      {
        title: '模块功能',
        width: 140,
        dataIndex: 'module',
        render: module => {
          const moduleName = findModuleNameByValue(`${module}`) || {};
          return moduleName.name || replaceSign;
        },
      },
      {
        title: '事务名称',
        width: 140,
        dataIndex: 'name',
        render: name => name || replaceSign,
      },
      {
        title: '事务编码',
        dataIndex: 'code',
        render: code => code || replaceSign,
      },
      {
        title: '状态',
        width: 140,
        dataIndex: 'enable',
        render: enable =>
          (typeof enable === 'number' && (
            <Badge.MyBadge
              color={MOVE_TRANSACTIONS_STATUS[enable].color}
              text={MOVE_TRANSACTIONS_STATUS[enable].label}
            />
          )) ||
          replaceSign,
      },
      {
        title: '操作',
        key: 'action',
        width: 240,
        render: (_, record) => {
          const { enable, code } = record;
          return (
            <Spin spinning={loading}>
              <React.Fragment>
                <Link
                  onClick={() => {
                    history.push(getDetailMoveTransactionsUrl(code));
                  }}
                >
                  查看
                </Link>
                <Link
                  style={{ marginLeft: 20, color: enable ? error : primary }}
                  onClick={() => {
                    setLoading(true);
                    const params = { code, enable: enable ? 0 : 1 };
                    updatemoveTransactionStatus(params)
                      .then(() => {
                        message.success(`${enable ? '停用' : '启用'}成功`);
                        record.enable = enable ? 0 : 1;
                        setLoading(false);
                      })
                      .catch(e => {
                        log.error(e);
                        setLoading(false);
                      });
                  }}
                >
                  {enable ? '停用' : '启用'}
                </Link>
                <Link
                  style={{ marginLeft: 20 }}
                  onClick={() => {
                    history.push(getEditMoveTransactionsUrl(code));
                  }}
                >
                  编辑
                </Link>
              </React.Fragment>
            </Spin>
          );
        },
      },
    ];
  };

  const columns = getColumns();
  const query = getQuery(match);
  return (
    <div style={{ marginTop: 20 }}>
      <Table
        columns={columns}
        dataSource={data && Array.isArray(data.data) ? data.data : []}
        total={data && data.total}
        refetch={refreshData}
        pagination={{ current: (query && query.page) || 1, pageSize: (query && query.size) || 10 }}
      />
    </div>
  );
};

export default withRouter(List);
