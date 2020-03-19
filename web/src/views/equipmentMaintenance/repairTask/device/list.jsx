import React from 'react';
import { withRouter } from 'react-router-dom';
import _ from 'lodash';
import moment from 'utils/time';
import { Link, RestPagingTable, Badge, Tooltip } from 'src/components';
import { replaceSign } from 'src/constants';
import { getQuery } from 'src/routes/getRouteParams';
import { taskStatus } from '../../constants';
import { getRepairTaskDetailUrl } from '../utils';

const MyBadge = Badge.MyBadge;

type Props = {
  refetch: () => {},
  history: any,
  match: any,
  data: [],
};

const DeviceRepairTaskList = (props: Props) => {
  const { data, refetch, history, match } = props;

  const getColumns = () => {
    const columns = [
      {
        title: '任务号',
        dataIndex: 'taskCode',
        fixed: 'left',
        width: 130,
        key: 'taskCode',
      },
      {
        title: '任务标题',
        dataIndex: 'title',
        fixed: 'left',
        width: 180,
        key: 'title',
        render: title => <Tooltip text={title} width={160} />,
      },
      {
        title: '目标名称',
        dataIndex: 'target',
        width: 180,
        key: 'targetName',
        render: target => <Tooltip text={(target && target.name) || replaceSign} width={160} />,
      },
      {
        title: '目标编码',
        width: 180,
        dataIndex: 'target',
        key: 'targetCode',
        render: target => <Tooltip text={(target && target.code) || replaceSign} width={160} />,
      },
      {
        title: '目标类型',
        width: 180,
        dataIndex: 'target.category',
        key: 'targetCategory',
        render: targetCategory => <Tooltip text={(targetCategory && targetCategory.name) || replaceSign} width={160} />,
      },
      {
        title: '车间',
        width: 120,
        dataIndex: 'target.workshop',
        key: 'workshop',
        render: workshop => <Tooltip text={(workshop && workshop.name) || replaceSign} width={110} />,
      },
      {
        title: '任务状态',
        dataIndex: 'status',
        width: 90,
        key: 'status',
        render: status => {
          const { label, color } = taskStatus.filter(n => n.key === status)[0];
          return <MyBadge text={label} color={color} />;
        },
      },
      {
        title: '截止时间',
        dataIndex: 'deadline',
        width: 180,
        key: 'deadline',
        render: deadline => {
          const getFormatDate = timestamp => {
            if (!timestamp) {
              return '';
            }
            return moment(Number(timestamp)).format('YYYY/MM/DD HH:mm');
          };
          return <span>{getFormatDate(deadline)}</span>;
        },
      },
      {
        title: '创建人',
        width: 90,
        dataIndex: 'creator',
        key: 'creator',
        render: creator => <Tooltip text={(creator && creator.name) || replaceSign} width={80} />,
      },
      {
        title: '计划执行人',
        width: 200,
        dataIndex: 'executors',
        key: 'executors',
        render: executors => {
          return (
            <Tooltip
              text={executors && executors.length ? executors.map(n => n.executorName).join('，') : replaceSign}
              length={12}
            />
          );
        },
      },
      {
        title: '实际执行人',
        width: 200,
        dataIndex: 'currentOperators',
        key: 'currentOperators',
        render: currentOperators => {
          const currentOperatorsStr = currentOperators && currentOperators.map(n => n.name).join('，');
          return <Tooltip text={(currentOperators && currentOperatorsStr) || replaceSign} width={180} />;
        },
      },
      {
        title: '操作',
        key: 'action',
        fixed: 'right',
        width: 80,
        render: (_, record) => (
          <Link
            onClick={() => {
              history.push(getRepairTaskDetailUrl(record.taskCode));
            }}
          >
            {'详情'}
          </Link>
        ),
      },
    ];
    return columns;
  };

  const columns = getColumns();
  const deviceSearch = _.get(getQuery(match), 'deviceSearch', {});
  const pagination = {
    current: deviceSearch.page,
    total: data && data.total,
    pageSize: deviceSearch.pageSize,
  };

  return (
    <RestPagingTable
      bordered
      dataSource={(data && data.data) || []}
      total={data && data.total}
      rowKey={record => record.id}
      columns={columns}
      scroll={{ x: 1800 }}
      pagination={pagination}
      onChange={pagination => {
        if (typeof refetch === 'function') {
          refetch({ ...deviceSearch, page: pagination.current, pageSize: pagination.pageSize });
        }
      }}
    />
  );
};

export default withRouter(DeviceRepairTaskList);
