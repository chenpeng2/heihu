import React from 'react';
import _ from 'lodash';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import moment from 'utils/time';
import { injectIntl } from 'react-intl';
import { changeChineseToLocale } from 'src/utils/locale/utils';
import { getQuery } from 'src/routes/getRouteParams';
import { Link, RestPagingTable, Badge, Tooltip } from 'src/components';
import { replaceSign } from 'src/constants';
import { taskStatus } from '../../constants';
import { getCheckTaskDetailUrl } from '../utils';

const MyBadge = Badge.MyBadge;

type Props = {
  refetch: () => {},
  history: any,
  data: [],
  intl: any,
  match: any,
};

const CheckTaskList = (props: Props, context) => {
  const { data, refetch, match, intl } = props;

  const getColumns = () => {
    const { router } = context;
    const columns = [
      {
        title: '策略号',
        dataIndex: 'strategyCode',
        fixed: 'left',
        width: 110,
        key: 'strategyCode',
        render: strategyCode => <Tooltip text={strategyCode || replaceSign} width={100} />,
      },
      {
        title: '策略名称',
        dataIndex: 'strategyTitle',
        fixed: 'left',
        width: 150,
        key: 'strategyTitle',
        render: strategyTitle => <Tooltip text={strategyTitle || replaceSign} width={130} />,
      },
      {
        title: '任务号',
        dataIndex: 'taskCode',
        width: 120,
        key: 'taskCode',
      },
      {
        title: '任务标题',
        dataIndex: 'title',
        width: 150,
        key: 'tile',
        render: title => <Tooltip text={title} width={130} />,
      },
      {
        title: '目标名称',
        dataIndex: 'deviceName',
        width: 150,
        key: 'targetName',
        render: deviceName => <Tooltip text={deviceName || replaceSign} width={130} />,
      },
      {
        title: '目标编码',
        dataIndex: 'deviceCode',
        width: 150,
        key: 'targetCode',
        render: deviceCode => <Tooltip text={deviceCode || replaceSign} width={130} />,
      },
      {
        title: '目标类型',
        width: 180,
        dataIndex: 'deviceCategoryName',
        key: 'deviceCategoryName',
        render: deviceCategoryName => <Tooltip text={deviceCategoryName || replaceSign} width={160} />,
      },
      {
        title: '车间',
        width: 120,
        dataIndex: 'target.workshop',
        key: 'workshop',
        render: workshop => <Tooltip text={(workshop && workshop.name) || replaceSign} width={100} />,
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
        title: '策略方案',
        dataIndex: 'strategyTriggerType',
        width: 110,
        render: data => {
          let display = '';
          if (!data) {
            return replaceSign;
          }
          switch (data) {
            case 1:
              display = '固定周期';
              break;
            case 2:
              display = '浮动周期';
              break;
            case 3:
              display = '累计用度';
              break;
            case 4:
              display = '固定用度';
              break;
            case 5:
              display = '手动创建';
              break;
            default:
              display = '手动创建';
              break;
          }
          return changeChineseToLocale(display, intl);
        },
      },
      {
        title: '计划开始时间',
        dataIndex: 'startTime',
        width: 150,
        render: startTime => {
          const getFormatDate = timestamp => {
            if (!timestamp) {
              return replaceSign;
            }
            return moment(Number(timestamp)).format('YYYY/MM/DD HH:mm');
          };
          return <Tooltip text={getFormatDate(startTime)} width={130} />;
        },
      },
      {
        title: '计划结束时间',
        dataIndex: 'deadline',
        width: 150,
        render: deadline => {
          const getFormatDate = timestamp => {
            if (!timestamp) {
              return replaceSign;
            }
            return moment(Number(timestamp)).format('YYYY/MM/DD HH:mm');
          };
          return <Tooltip text={getFormatDate(deadline)} width={130} />;
        },
      },
      {
        title: '计划执行人',
        width: 150,
        dataIndex: 'executors',
        render: executors => {
          const executorsName =
            executors && executors.length ? executors.map(n => n.executorName).join('，') : replaceSign;
          return <Tooltip text={executorsName} width={130} />;
        },
      },
      {
        title: '实际执行人',
        dataIndex: 'currentOperators',
        width: 150,
        key: 'currentOperators',
        render: currentOperators => {
          const currentOperatorsStr = currentOperators && currentOperators.map(n => n.name).join('，');
          return <Tooltip text={(currentOperators && currentOperatorsStr) || replaceSign} width={130} />;
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
              router.history.push(getCheckTaskDetailUrl(record.taskCode));
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
    <div style={{ marginTop: 20 }}>
      <RestPagingTable
        bordered
        dataSource={(data && data.data) || []}
        total={data && data.total}
        rowKey={record => record.id}
        columns={columns}
        scroll={{ x: true }}
        refetch={refetch}
        pagination={pagination}
        onChange={pagination => {
          if (typeof refetch === 'function') {
            refetch({ ...deviceSearch, page: pagination.current, pageSize: pagination.pageSize });
          }
        }}
      />
    </div>
  );
};

CheckTaskList.contextTypes = {
  router: PropTypes.object.isRequired,
};

export default withRouter(injectIntl(CheckTaskList));
