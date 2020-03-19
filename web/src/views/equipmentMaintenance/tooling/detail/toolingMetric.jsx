import React from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { DetailPageItemContainer, Row, Col } from 'src/components';
import { replaceSign } from 'src/constants';
import styles from './styles.scss';

type Props = {
  data: any,
};

const colStyle = { width: '80%' };

const ToolingMetric = (props: Props, context) => {
  const { data } = props;
  const { changeChineseTemplateToLocale } = context;
  if (!data) {
    return null;
  }

  return (
    <div className={styles.itemContainerStyle}>
      <DetailPageItemContainer contentStyle={{ width: '100%', display: 'block' }} itemHeaderTitle={'模具读数'}>
        {_.get(data, 'deviceMetricValues', []).map(n => (
          <Row style={{ marginRight: 20 }}>
            <Col type={'title'}>{changeChineseTemplateToLocale('当前{metricName}', { metricName: n.metricName })}</Col>
            <Col style={colStyle} type={'content'}>
              {n.metricValue ? `${n.metricValue}${n.metricUnitName}` : replaceSign}
            </Col>
          </Row>
        ))}
      </DetailPageItemContainer>
    </div>
  );
};

ToolingMetric.contextTypes = {
  changeChineseTemplateToLocale: PropTypes.any,
};

export default ToolingMetric;
