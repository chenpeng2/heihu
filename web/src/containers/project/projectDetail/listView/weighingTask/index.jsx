import React, { Component } from 'react';
import _ from 'lodash';
import { withRouter } from 'react-router-dom';
import { Progress } from 'antd';

import auth from 'src/utils/auth';
import { primary } from 'src/styles/color';
import { Link, SimpleTable, Row, Col, Badge, openModal, message } from 'src/components';
import authorityWrapper from 'src/components/authorityWrapper';
import { formatUnix, formatDateTime } from 'utils/time';
import { replaceSign, WEIGHING_TASK_STATUS } from 'constants';
import { thousandBitSeparator } from 'src/utils/number';

import styles from './styles.scss';

const LinkGroup = Link.Group;
const LinkWithAuth = authorityWrapper(Link);
const MyBadge = Badge.MyBadge;

type Props = {
  task: any,
  style: {},
  projectCode: String,
};
const contentStyle = {
  margin: '20px 0',
  padding: '0 20px',
  width: 880,
  flexWrap: 'wrap',
};
class WeighingTask extends Component {
  props: Props;
  state = {
    operatorGroupName: null,
  };

  getSubItem = task => {
    const { operatorGroupName } = this.state || {};

    return (
      <div>
        <span style={{ marginRight: 15 }}>{`编号: ${task.code || replaceSign}`}</span>
        <span style={{ marginRight: 15 }}>{`执行人: ${task.executorName || replaceSign}`}</span>
      </div>
    );
  };

  renderWeighingProgress = task => {
    if (!task) return;
    const { instructions } = task;
    const columns = [
      {
        title: '物料编码／物料名称',
        dataIndex: 'materialCode',
        key: 'materialCode',
        width: 400,
        render: (materialCode, record) => `${materialCode}/${record.materialName}`,
      },
      {
        title: '进度',
        dataIndex: 'weighedNum',
        key: 'weighedNum',
        width: 400,
        render: (weighedNum, record) => {
          const { num, materialUnit } = record;
          const percent = (weighedNum / num) * 100;
          return (
            <div style={{ width: 400 }}>
              <Progress style={{ width: 300 }} percent={percent} showInfo={false} status="success" />
              <span style={{ marginLeft: 20 }}>
                <spnan style={{ color: primary }}>{thousandBitSeparator(weighedNum)}</spnan>
                {`/${thousandBitSeparator(num)} ${materialUnit || replaceSign}`}
              </span>
            </div>
          );
        },
      },
    ];
    return (
      <SimpleTable
        style={{ margin: 20 }}
        rowKey={record => record.id}
        dataSource={instructions}
        columns={columns}
        pagination={false}
      />
    );
  };

  render() {
    const { task, projectCode } = this.props;
    if (!task || !task.id) {
      return null;
    }

    const { id, workstationName, status, planBeginTime, planEndTime, projectCodes } = task;
    const otherProjectCodes = projectCodes && projectCodes.filter(o => o !== projectCode);
    const config = [
      {
        title: '状态',
        content: WEIGHING_TASK_STATUS[status] || replaceSign,
      },
      {
        title: '工位',
        content: workstationName || replaceSign,
      },
      {
        title: '时间',
        content: `${planBeginTime ? formatUnix(planBeginTime) : ''} - ${planEndTime ? formatUnix(planEndTime) : ''}`,
      },
      {
        title: '其他项目',
        content: _.isEmpty(otherProjectCodes) ? replaceSign : _.join(otherProjectCodes, ','),
      },
    ];

    return (
      <div className={styles.createdTaskContainer}>
        <div className={styles.header}>
          <span style={{ fontSize: 14 }}>称量任务</span>
          <div style={{ display: 'flex', position: 'absolute', right: 60 }}>
            <Link to={`/weighingManagement/weighingTask/detail/${id}`}>{'查看'}</Link>
          </div>
        </div>
        <div className={styles.subItemContainer}>{this.getSubItem(task)}</div>
        <div style={{ ...contentStyle, display: 'flex' }}>
          {config.map(n => (
            <Row style={{ marginRight: 40 }}>
              <Col type={'title'}>{n.title}</Col>
              <Col type={'content'}>{n.content}</Col>
            </Row>
          ))}
        </div>
        {this.renderWeighingProgress(task)}
      </div>
    );
  }
}

export default withRouter(WeighingTask);
