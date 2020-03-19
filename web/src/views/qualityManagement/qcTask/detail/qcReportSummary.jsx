import React, { Component } from 'react';
import _ from 'lodash';
import { Row, Col, DetailPageItemContainer } from 'components';
import { replaceSign } from 'src/constants';
import { injectIntl } from 'react-intl';
import { changeChineseToLocale } from 'utils/locale/utils';
import { QUALITY_STATUS } from 'src/views/qualityManagement/constants';

type Props = {
  data: {},
  intl: any,
};

const colStyle = { width: 400 };

class QcReportSummary extends Component {
  props: Props;
  state = {};

  renderInfo = data => {
    const { intl } = this.props;
    const { qcTotal, countRecord, material, desc } = data;
    const { unitName } = material || {};
    const { qualifiedConcessionCount, qualifiedCount, checkCount, defectCount, status } = countRecord || {};
    return (
      <DetailPageItemContainer contentStyle={{ width: '100%', padding: '10px 0' }} itemHeaderTitle="质检报告概要">
        <Row>
          <Col type="title">总体数量</Col>
          <Col type="content" style={colStyle}>
            {typeof qcTotal === 'number' ? `${qcTotal}${unitName || replaceSign}` : replaceSign}
          </Col>
        </Row>
        <Row>
          <Col type="title">质检结果</Col>
          <Col type="content" style={colStyle}>
            {typeof status === 'number' ? (
              <div style={{ color: QUALITY_STATUS[status].color }}>
                {changeChineseToLocale(QUALITY_STATUS[status].name, intl)}
              </div>
            ) : (
              replaceSign
            )}
          </Col>
        </Row>
        <Row>
          <Col type="title">样本数量</Col>
          <Col type="content" style={colStyle}>
            {typeof checkCount === 'number' ? `${checkCount}${unitName || replaceSign}` : replaceSign}
          </Col>
        </Row>
        <Row>
          <Col type="title">样本合格数</Col>
          <Col type="content" style={colStyle}>
            {typeof qualifiedCount === 'number' ? (
              <div>
                {`${qualifiedCount}${unitName || replaceSign}`}
                <span style={{ marginLeft: 20 }}>{`${((qualifiedCount / checkCount) * 100).toFixed(1)}%`}</span>
              </div>
            ) : (
              replaceSign
            )}
          </Col>
        </Row>
        <Row>
          <Col type="title">样本不合格数</Col>
          <Col type="content" style={colStyle}>
            {typeof defectCount === 'number' ? (
              <div>
                {`${defectCount}${unitName || replaceSign}`}
                <span style={{ marginLeft: 20 }}>{`${((defectCount / checkCount) * 100).toFixed(1)}%`}</span>
              </div>
            ) : (
              replaceSign
            )}
          </Col>
        </Row>
        <Row>
          <Col type="title">样本让步合格率</Col>
          <Col type="content" style={colStyle}>
            {typeof qualifiedConcessionCount === 'number' ? (
              <div>
                {`${qualifiedConcessionCount}${unitName || replaceSign}`}
                <span style={{ marginLeft: 20 }}>{`${((qualifiedConcessionCount / checkCount) * 100).toFixed(
                  1,
                )}%`}</span>
              </div>
            ) : (
              replaceSign
            )}
          </Col>
        </Row>
        <Row>
          <Col type="title">备注</Col>
          <Col type="content" style={colStyle}>
            {desc || replaceSign}
          </Col>
        </Row>
      </DetailPageItemContainer>
    );
  };

  render() {
    const { data } = this.props;

    return <div>{this.renderInfo(data)}</div>;
  }
}

export default injectIntl(QcReportSummary);
