import React, { Component } from 'react';
import _ from 'lodash';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import { withForm, Row, Col, Link, DetailPageItemContainer } from 'components';
import { formatUnix } from 'utils/time';
import { thousandBitSeparator } from 'utils/number';
import { injectIntl } from 'react-intl';
import { changeChineseToLocaleWithoutIntl } from 'utils/locale/utils';
import { CHECKCOUNT_TYPE, PRODUCE_QC, TASK_CREATE_TYPE } from 'src/views/qualityManagement/constants';
import { replaceSign } from 'src/constants';
import { getCheckTypeDisplay } from '../utils';
import { toQcConfigDetail } from '../../navigation';

type Props = {
  form: {
    getFieldDecorator: () => {},
    setFieldsValue: () => {},
    getFieldValue: () => {},
  },
  match: {},
  intl: any,
  data: {},
};
const colStyle = { width: 400 };

const convertInterval = ms => {
  const mins = ms / (1000 * 60);
  return mins > 60
    ? `${mins / 60}${changeChineseToLocaleWithoutIntl('小时')}`
    : `${mins}${changeChineseToLocaleWithoutIntl('分钟')}`;
};

export const getQcCycle = (data, changeChineseTemplateToLocale) => {
  const { qcConfig, material, checkType } = data;
  if (checkType === 2) return replaceSign;
  const { taskCreateType, taskCreateInterval, taskCreateCount } = qcConfig || {};
  const type = changeChineseToLocaleWithoutIntl(TASK_CREATE_TYPE[taskCreateType]);
  const interval = taskCreateType ? '' : convertInterval(taskCreateInterval);
  const unitName = _.get(material, 'unitName', replaceSign);
  switch (taskCreateType) {
    case 0:
      return changeChineseTemplateToLocale('{type} / 每生产「{interval}」质检一次', {
        type,
        interval: thousandBitSeparator(interval),
      });
    case 1:
      return taskCreateCount !== -1
        ? changeChineseTemplateToLocale('{type} / 每生产「{taskCreateCount} {unitName}」质检一次', {
            type,
            taskCreateCount,
            unitName,
          })
        : changeChineseTemplateToLocale('{type} / 全部数量', { type });
    case 2:
      return changeChineseTemplateToLocale('{type} / 「{taskCreateCount}」次', {
        type,
        taskCreateCount,
      });
    case 3:
      return changeChineseTemplateToLocale('{type} / 「{taskCreateCount}」个二维码', {
        type,
        taskCreateCount,
      });
    default:
      return replaceSign;
  }
};

class QcConfig extends Component {
  props: Props;
  state = {
    data: {},
  };

  getActualTime = (start, end) => {
    if (!start && !end) {
      return replaceSign;
    }
    const startTime = start ? formatUnix(start) : replaceSign;
    const endTime = end ? formatUnix(end) : replaceSign;
    return `${startTime} ~ ${endTime}`;
  };

  // 0.单体记录, 1.质检项记录, 2.仅记录次品
  render() {
    const { data, intl } = this.props;
    const { changeChineseTemplateToLocale } = this.context;
    const { qcConfig, qcTaskClassification } = data || {};
    const { id, name, checkType, checkCountType, autoCreateQcTask } = qcConfig || {};
    const checkTypeDisplay = getCheckTypeDisplay(qcTaskClassification, checkType);

    return (
      <DetailPageItemContainer contentStyle={{ width: '100%', padding: '10px 0' }} itemHeaderTitle="质检方案">
        <Row>
          <Row>
            <Col type="title">方案名称</Col>
            <Col type="content" style={colStyle}>
              {id ? <Link.NewTagLink href={toQcConfigDetail(id)}>{name || replaceSign}</Link.NewTagLink> : null}
            </Col>
          </Row>
          <Row>
            <Col type="title">质检类型</Col>
            <Col type="content" style={colStyle}>
              {checkTypeDisplay}
            </Col>
          </Row>
        </Row>
        <Row>
          <Row>
            <Col type="title">质检方式</Col>
            <Col type="content" style={colStyle}>
              {typeof checkCountType === 'number' ? CHECKCOUNT_TYPE[checkCountType] : replaceSign}
            </Col>
          </Row>
          {checkType === PRODUCE_QC && autoCreateQcTask ? (
            <Row>
              <Col type="title">质检频次</Col>
              <Col type="content" style={colStyle}>
                {getQcCycle(data, changeChineseTemplateToLocale, intl)}
              </Col>
            </Row>
          ) : null}
        </Row>
      </DetailPageItemContainer>
    );
  }
}

QcConfig.contextTypes = {
  router: PropTypes.object.isRequired,
  changeChineseTemplateToLocale: PropTypes.any,
};

export default withForm({}, withRouter(injectIntl(QcConfig)));
