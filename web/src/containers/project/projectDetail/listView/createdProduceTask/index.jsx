import React, { Component } from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import auth from 'src/utils/auth';
import { Link, Table, Popconfirm, Row, Col, Badge, openModal, message } from 'src/components';
import authorityWrapper from 'src/components/authorityWrapper';
import { formatUnix, formatDateTime } from 'utils/time';
import { configHasSOP } from 'utils/organizationConfig';
import { updateQcTaskStatus } from 'src/services/qualityManagement/qcTask';
import { cancelProduceTask } from 'src/services/cooperate/prodTask';
import { replaceSign, QCTASK_STATUS } from 'constants';
import { CATEGORY_PRODTASK } from 'src/views/cooperate/prodTask/constant';
import { CHECK_TYPE } from 'src/views/qualityManagement/constants';
import QcTaskEditForm from 'src/views/qualityManagement/qcTask/page/qcTaskEditForm';
import { getWorkgroupDetail } from 'src/services/auth/workgroup';
import { toProdTaskDetail } from 'src/views/cooperate/prodTask/navigation';
import { thousandBitSeparator } from 'utils/number';
import FormattedMessage from 'src/components/intl/MyFormattedMessage';

import editProduceTask from '../../editTask';
import styles from './styles.scss';

const LinkGroup = Link.Group;
const LinkWithAuth = authorityWrapper(Link);
const MyBadge = Badge.MyBadge;

type Props = {
  task: any,
  style: {},
  detailClick: () => {},
  fetchData: () => {},
};
const contentStyle = {
  margin: '20px 0',
  padding: '0 20px',
  flexWrap: 'wrap',
};
class CreatedProduceTask extends Component {
  props: Props;
  state = {
    operatorGroupName: null,
    configHasSOP: configHasSOP(),
  };

  componentDidMount() {
    this.setOperatorGroupData(this.props);
  }

  componentWillReceiveProps(nextProps) {
    this.setOperatorGroupData(nextProps);
  }

  setOperatorGroupData = props => {
    const operatorGroupId = _.get(props, 'task.operatorGroupId');
    if (operatorGroupId) {
      getWorkgroupDetail(operatorGroupId).then(res => {
        const operatorGroupName = _.get(res, 'data.data.name');

        this.setState({
          operatorGroupName,
        });
      });
    }
  };

  getSubItem = task => {
    const { operatorGroupName } = this.state || {};

    return (
      <div>
        <span style={{ marginRight: 15 }}>{`编号: ${task.taskCode}`}</span>
        <span style={{ marginRight: 15 }}>{`负责人: ${operatorGroupName ||
          (task.operators ? task.operators.map(e => e.name).join(',') : replaceSign)}`}</span>
      </div>
    );
  };

  cancelQcTask = async code => {
    await updateQcTaskStatus(code, 3)
      .then(({ data }) => {
        if (data.message === '成功') {
          message.success('取消成功');
          this.props.fetchData();
        }
      })
      .catch(e => console.log(e));
  };

  getQcTasks = task => {
    if (!task.qcTasks) {
      return null;
    }
    const columns = [
      {
        title: '质检类型',
        key: 'checkType',
        dataIndex: 'checkType',
        render: checkType => {
          return CHECK_TYPE[checkType] || replaceSign;
        },
      },
      {
        title: '状态',
        key: 'status',
        dataIndex: 'status',
        render: _status => {
          const status = QCTASK_STATUS[_status];
          return status ? <MyBadge text={status.display} color={status.color} /> : replaceSign;
        },
      },
      {
        title: '编号',
        key: 'code',
        dataIndex: 'code',
        render: code => {
          return code || replaceSign;
        },
      },
      {
        title: '计划时间',
        key: 'time',
        render: (_, record) => {
          const { plannedStartTime, plannedEndTime } = record;
          return (
            <div>
              {plannedStartTime ? formatDateTime(plannedStartTime) : ''} -{' '}
              {plannedEndTime ? formatDateTime(plannedEndTime) : ''}
            </div>
          );
        },
      },
      {
        title: '执行人',
        dataIndex: 'operatorName',
        render: operatorName => {
          return operatorName || replaceSign;
        },
      },
      {
        title: '工位',
        dataIndex: 'workstation',
        render: workstation => {
          return <div>{(workstation && workstation.name) || replaceSign}</div>;
        },
      },
      {
        title: '操作',
        key: 'opetion',
        fixed: 'right',
        width: 120,
        render: (_, record) => {
          return (
            <LinkGroup>
              <LinkWithAuth
                auth={auth.WEB_VIEW_QUALITY_TESTING_TASK}
                onClick={() => this.context.router.history.push(`/qualityManagement/qcTask/detail/${record.code}`)}
              >
                查看
              </LinkWithAuth>
              <LinkWithAuth
                auth={auth.WEB_VIEW_QUALITY_TESTING_TASK}
                disabled={record.status !== 0}
                onClick={() =>
                  openModal({
                    title: '编辑质检任务',
                    footer: null,
                    width: 660,
                    height: 416,
                    children: (
                      <QcTaskEditForm
                        data={record}
                        onSuccess={() => {
                          this.props.fetchData();
                        }}
                      />
                    ),
                  })
                }
              >
                编辑
              </LinkWithAuth>
              <Popconfirm
                title="该质检任务取消后便无法再重启，确认要取消任务吗？"
                onConfirm={() => {
                  this.cancelQcTask(record.code);
                }}
                okText="确认"
                cancelText="还不要"
              >
                <LinkWithAuth auth={auth.WEB_VIEW_QUALITY_TESTING_TASK} disabled={record.status !== 0}>
                  取消
                </LinkWithAuth>
              </Popconfirm>
            </LinkGroup>
          );
        },
      },
    ];

    return (
      <Table
        style={{ width: '96%', margin: '20px auto' }}
        columns={columns}
        dataSource={task.qcTasks}
        pagination={false}
        scroll={{ x: 800 }}
      />
    );
  };

  render() {
    const { task, detailClick, fetchData } = this.props;
    const { configHasSOP } = this.state;
    const { changeChineseToLocale } = this.context;
    if (!task || !task.id) {
      return null;
    }

    const { id, workstation, startTimePlanned, endTimePlanned } = task;
    const config = [
      {
        title: '进度',
        content: `${thousandBitSeparator(task.amountProductQualified)}/${thousandBitSeparator(
          task.amountProductPlanned,
        )}`,
      },
      {
        title: '状态',
        content: task.statusDisplay,
      },
      {
        title: '工位',
        content: workstation ? workstation.name : replaceSign,
      },
      {
        title: '时间',
        content: `${startTimePlanned ? formatUnix(startTimePlanned) : ''} - ${
          endTimePlanned ? formatUnix(endTimePlanned) : ''
        }`,
      },
    ];

    const title = task.category === CATEGORY_PRODTASK ? '生产任务' : '下料任务';

    return (
      <div className={styles.createdTaskContainer}>
        <div className={styles.header}>
          <span style={{ fontSize: 14 }}>
            <FormattedMessage defaultMessage="生产任务" />
          </span>
          <div className={styles.headerActions}>
            <Link
              to={
                configHasSOP
                  ? `/cooperate/SOPTask/detail/${task.id}`
                  : task.category === CATEGORY_PRODTASK
                  ? toProdTaskDetail({ id: task.id, category: task.category })
                  : `/cooperate/blankingTasks/detail/${task.id}?category=${task.category}`
              }
            >
              {'查看'}
            </Link>
            {!configHasSOP && [1, 2, 3].indexOf(task.status) >= 0 ? (
              <Link
                auth={auth.WEB_EDIT_PRODUCE_TASK}
                onClick={() =>
                  editProduceTask(
                    { id: task.id, category: task.category, isModal: true, prodTaskStatus: task.status },
                    {
                      onSuccess: () => {
                        this.setState({ operatorGroupName: null }, () => {
                          if (typeof fetchData === 'function') fetchData();
                        });
                      },
                    },
                    { title: '编辑生产任务' },
                  )
                }
              >
                {'编辑'}
              </Link>
            ) : null}
            {!configHasSOP && task.status === 1 ? (
              <Popconfirm
                title="确认要取消该任务吗？"
                onConfirm={async () => {
                  await cancelProduceTask({ id: task.id });
                  fetchData();
                }}
                okText="确认"
                cancelText="取消"
              >
                <Link>取消</Link>
              </Popconfirm>
            ) : null}
          </div>
        </div>
        <div className={styles.subItemContainer}>{this.getSubItem(task)}</div>
        <div style={{ ...contentStyle, display: 'flex' }}>
          {config.map(n => (
            <Row>
              <Col type={'title'}>{n.title}</Col>
              <Col type={'content'}>{n.content}</Col>
            </Row>
          ))}
        </div>
        {this.getQcTasks(task)}
      </div>
    );
  }
}

CreatedProduceTask.contextTypes = {
  router: {},
  changeChineseToLocale: PropTypes.func,
};

export default CreatedProduceTask;
