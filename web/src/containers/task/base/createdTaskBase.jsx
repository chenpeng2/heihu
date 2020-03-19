import React, { Component } from 'react';
import { blacklakeGreen, middleGrey, white, alertYellow, errorRed } from 'src/styles/color/index';
import { Popconfirm } from 'antd';
import { Link, ActionButton, Row, Col, TaskProgress } from 'components';
import { sectionStyle } from 'layouts/detailPageLayout';
import { formatDateHourNoYear, now } from 'utils/time';
import Styles from './styles.scss';

const contentStyle = {
  padding: '0 20px',
  width: 880,
  flexWrap: 'wrap',
};
const delayTabStyle = {
  width: 40,
  height: 16,
  borderRadius: 18,
  border: `1px solid ${alertYellow}`,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
};

type Props = {
  task: any,
  type: string,
  title: string,
  editClick: () => {},
  deleteConfirm: () => {},
  detailClick: () => {},
  itemConfig: [{}],
}

class CreatedTaskBasePage extends Component {
  props: Props

  state = {}

  getSubItem = (task) => {
    return (
      <div style={{ color: middleGrey }}>
        <span style={{ marginRight: 15 }}>{`任务号: ${task.taskNo}`}</span>
        <span style={{ marginRight: 15 }}>{`创建人: ${task.creator.name}`}</span>
        <span>{`创建时间: ${formatDateHourNoYear(task.createdAt)}`}</span>
      </div>
    );
  }

  render() {
    const { task, type, title, editClick, deleteConfirm, detailClick, itemConfig } = this.props;
    if (!task) {
      return null;
    }
    let completedRatio = 0;
    let text = '';
    let isDelay = false;
    let delayColor = '';
    if (type === 'task') {
      completedRatio = task.currentProduct / task.plannedProduct;
      text = `${task.currentProduct}/${task.plannedProduct}`;
      if (task.isStartDelay && now().isBefore(task.plannedEndTime)) {
        delayColor = alertYellow;
        isDelay = true;
      } else if (task.isEndDelay) {
        delayColor = errorRed;
        isDelay = true;
      }
    } else if (type === 'qcTask') {
      const { total, current } = task.completedProgress;
      completedRatio = current / total;
      text = `${current}/${total}`;
      if (task.isDelay) {
        delayColor = alertYellow;
        isDelay = true;
      }
    } else {
      completedRatio = task.finishedAmount / task.amount;
      text = `${task.finishedAmount}/${task.amount}`;
    }
    return (
      <div className={Styles.createdTaskContainer} >
        <div style={{ display: 'flex', paddingBottom: 20, alignItems: 'center' }}>
          <span style={{ fontSize: 15, marginRight: 14 }}>{title}</span>
          <div style={{ marginRight: 8 }}>
            <TaskProgress text={text} schedule={completedRatio} />
          </div>
          {
            isDelay
              ? <span style={{ ...delayTabStyle, color: delayColor, borderColor: delayColor }}>{'延迟'}</span> : null
          }
          <div style={{ display: 'flex', position: 'absolute', right: 0, marginRight: 40 }}>
            <ActionButton
              iconType="edit"
              location="left"
              click={editClick}
              style={{ backgroundColor: white, color: blacklakeGreen }}
            />
            <Popconfirm
              title="确认要删除吗？"
              onConfirm={deleteConfirm}
              okText="确认"
              cancelText="取消"
            >
              <ActionButton
                location="right"
                iconType="delete"
                style={{ backgroundColor: white, color: blacklakeGreen }}
              />
            </Popconfirm>
            <Link onClick={detailClick}>
              {'详情>'}
            </Link>
          </div>
        </div>
        {
          this.getSubItem(task)
        }
        <div style={{ ...contentStyle, ...sectionStyle, display: 'flex' }}>
          {
            itemConfig.map(
              n => (<Row style={{ marginRight: 40 }}>
                <Col type={'title'}>{n.title}</Col>
                <Col type={'content'}>{n.content}</Col>
              </Row>),
            )
          }
        </div>
      </div>
    );
  }
}

export default CreatedTaskBasePage;
