import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'utils/time';
import { Row, Col, withForm, FormattedMessage } from 'src/components';
import { replaceSign } from 'src/constants';
import { primary } from 'styles/color';
import { getTimeUnitName } from 'views/knowledgeManagement/equipmentModeling/equipmentType/base/formatValue';

type Props = {
  strategy: {},
};

class StrategyDetailModal extends Component {
  props: Props;

  state = {};

  renderStrategyConfig = strategy => {
    const {
      strategyCode,
      strategyTitle,
      strategyDescription,
      strategyGroup,
      strategyStartTime,
      strategyEndTime,
      strategyCategory,
      strategyTriggerType,
      deviceMetric,
      strategyTriggerSchema,
    } = strategy;
    const { changeChineseToLocale } = this.context;
    const { metricName, metricUnitName } = deviceMetric || {};
    const { metricBaseValue, metricCompareType, period, timeUnit } = strategyTriggerSchema || {};
    let strategyTriggerTypeDispaly = '';
    switch (strategyTriggerType) {
      case 1:
        strategyTriggerTypeDispaly = '固定周期';
        break;
      case 2:
        strategyTriggerTypeDispaly = '浮动周期';
        break;
      case 3:
        strategyTriggerTypeDispaly = '累计用度';
        break;
      case 4:
        strategyTriggerTypeDispaly = '固定用度';
        break;
      case 5:
        strategyTriggerTypeDispaly = '手动创建';
        break;
      default:
        strategyTriggerTypeDispaly = '手动创建';
        break;
    }
    const timeUnitName = getTimeUnitName(timeUnit);

    return (
      <div>
        <div style={{ fontWeight: 600, fontSize: 14, marginLeft: 40 }}>{changeChineseToLocale('策略设置')}</div>
        <Row>
          <Col type={'title'}>{'策略号'}</Col>
          <Col type={'content'} style={{ width: 200 }}>
            {strategyCode}
          </Col>
        </Row>
        <Row>
          <Col type={'title'}>{'策略名称'}</Col>
          <Col type={'content'} style={{ width: 200 }}>
            {strategyTitle}
          </Col>
        </Row>
        <Row>
          <Col type={'title'}>{'策略描述'}</Col>
          <Col type={'content'} style={{ width: 200 }}>
            {strategyDescription || replaceSign}
          </Col>
        </Row>
        <Row>
          <Col type={'title'}>{'策略组'}</Col>
          <Col type={'content'} style={{ width: 200 }}>
            {strategyGroup ? strategyGroup.title : replaceSign}
          </Col>
        </Row>
        <Row>
          <Col type={'title'}>{'策略开始时间'}</Col>
          <Col type={'content'} style={{ width: 200 }}>
            {strategyStartTime ? moment(strategyStartTime).format('YYYY/MM/DD HH:mm:ss') : replaceSign}
          </Col>
        </Row>
        <Row>
          <Col type={'title'}>{'策略结束时间'}</Col>
          <Col type={'content'} style={{ width: 200 }}>
            {strategyEndTime ? moment(strategyEndTime).format('YYYY/MM/DD HH:mm:ss') : replaceSign}
          </Col>
        </Row>
        <Row>
          <Col type={'title'}>{'策略类型'}</Col>
          <Col type={'content'} style={{ width: 200 }}>
            {strategyCategory === 2 ? '保养' : '点检'}
          </Col>
        </Row>
        <Row>
          <Col type={'title'}>{'策略方案'}</Col>
          <Col type={'content'} style={{ width: 200 }}>
            {strategyTriggerTypeDispaly}
          </Col>
        </Row>
        {strategyTriggerType === 3 || strategyTriggerType === 4 ? (
          <Row>
            <Col type={'title'}>
              <FormattedMessage defaultMessage={'{metricName}阈值'} values={{ metricName }} />
            </Col>
            <Col type={'content'} style={{ width: 200 }}>{`${
              metricCompareType === 1 ? '≤' : '≥'
            }${metricBaseValue}${metricUnitName}`}</Col>
          </Row>
        ) : strategyTriggerType === 1 || strategyTriggerType === 2 ? (
          <Row>
            <Col type={'title'}>周期</Col>
            <Col type={'content'} style={{ width: 200 }}>
              每{`${period}${timeUnitName}`}
            </Col>
          </Row>
        ) : null}
      </div>
    );
  };

  renderTaskConfig = strategy => {
    const {
      taskTitle,
      taskDescription,
      executors,
      taskPlanLaborTimeAmount,
      taskPlanLaborTimeUnit,
      taskReportTemplate,
      taskAttachmentFiles,
      taskScan,
      taskAcceptanceCheck,
    } = strategy;
    const { changeChineseToLocale } = this.context;
    const executorsName = executors && executors.length ? executors.map(n => n.executorName).join('，') : null;

    return (
      <div style={{ marginTop: 10 }}>
        <div style={{ fontWeight: 600, fontSize: 14, marginLeft: 40 }}>{changeChineseToLocale('任务设置')}</div>
        <Row>
          <Col type={'title'}>{'任务标题'}</Col>
          <Col type={'content'} style={{ width: 200 }}>
            {taskTitle}
          </Col>
        </Row>
        <Row>
          <Col type={'title'}>{'任务详情'}</Col>
          <Col type={'content'} style={{ width: 200 }}>
            {taskDescription || replaceSign}
          </Col>
        </Row>
        <Row>
          <Col type={'title'}>{'计划执行人'}</Col>
          <Col type={'content'} style={{ width: 200 }}>
            {executorsName || replaceSign}
          </Col>
        </Row>
        <Row>
          <Col type={'title'}>{'计划工时'}</Col>
          <Col type={'content'} style={{ width: 200 }}>{`${taskPlanLaborTimeAmount}${
            taskPlanLaborTimeUnit === 0 ? '小时' : '分钟'
          }`}</Col>
        </Row>
        <Row>
          <Col type={'title'}>{'报告模板'}</Col>
          <Col type={'content'} style={{ width: 200 }}>
            {taskReportTemplate.name}
          </Col>
        </Row>
        <Row>
          <Col type={'title'}>{'相关图片'}</Col>
          <Col type={'content'} style={{ width: 200 }}>
            {taskAttachmentFiles && taskAttachmentFiles.length
              ? taskAttachmentFiles.map(n => (
                  <a target="_blank" rel="noopener noreferrer" style={{ color: primary, marginRight: 8 }} href={n.uri}>
                    {n.original_filename}
                  </a>
                ))
              : replaceSign}
          </Col>
        </Row>
        <Row>
          <Col type={'title'}>{'扫码确认'}</Col>
          <Col type={'content'} style={{ width: 200 }}>
            {taskScan ? '是' : '否'}
          </Col>
        </Row>
        <Row>
          <Col type={'title'}>{'完成验收'}</Col>
          <Col type={'content'} style={{ width: 200 }}>
            {taskAcceptanceCheck ? '是' : '否'}
          </Col>
        </Row>
      </div>
    );
  };

  render = () => {
    const { strategy } = this.props;

    return (
      <div style={{ marginLeft: 20 }}>
        {this.renderStrategyConfig(strategy)}
        {this.renderTaskConfig(strategy)}
      </div>
    );
  };
}

StrategyDetailModal.contextTypes = {
  changeChineseToLocale: PropTypes.any,
};

export default withForm({ showFooter: false }, StrategyDetailModal);
