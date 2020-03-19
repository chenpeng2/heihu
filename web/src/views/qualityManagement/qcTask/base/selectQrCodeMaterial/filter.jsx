import React, { Fragment, useEffect } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import moment from 'utils/time';
import { Button, Input, withForm, DatePicker, Row, Col, Searchselect } from 'src/components';
import { renderQcStatusSelect } from 'src/containers/qrCodeQuery/list/filter';
import { INPUT_FACTORY_QC } from 'src/views/qualityManagement/constants';
import styles from '../../styles.scss';

type Props = {
  form: any,
  checkType: Number,
  onSearch: () => {},
};

const width = 260;
const titleWidth = 80;
const rowStyle = { alignItems: 'center' };

const Filter = (props: Props, context) => {
  const { checkType, form, onSearch } = props;
  const { changeChineseToLocale } = context;
  const { getFieldDecorator } = form;

  useEffect(() => {
    onSearch();
  }, []);

  return (
    <div className={styles.filter}>
      <div style={{ width: '100%' }}>
        {checkType === INPUT_FACTORY_QC ? (
          <Fragment>
            <Row>
              <Row style={rowStyle}>
                <Col type="title" style={{ width: titleWidth }}>
                  创建时间
                </Col>
                <Col type="content" style={{ width }}>
                  {getFieldDecorator('createdAt', {
                    rules: [{ required: true, message: changeChineseToLocale('请选择创建时间') }],
                    initialValue: [
                      moment()
                        .hours(0)
                        .minutes(0)
                        .seconds(0),
                      moment(),
                    ],
                  })(
                    <DatePicker.RangePicker
                      showTime={{ format: 'HH:mm' }}
                      format="YYYY-MM-DD HH:mm"
                      style={{ width }}
                    />,
                  )}
                </Col>
              </Row>
              <Row style={rowStyle}>
                <Col type="title" style={{ width: titleWidth }}>
                  质量状态
                </Col>
                <Col type="content" style={{ width }}>
                  {getFieldDecorator('qcStatus')(renderQcStatusSelect({ width }, { mode: 'multiple' }))}
                </Col>
              </Row>
            </Row>
            <Row>
              <Row style={rowStyle}>
                <Col type="title" style={{ width: titleWidth }}>
                  入厂批次
                </Col>
                <Col type="content" style={{ width }}>
                  {getFieldDecorator('inboundBatch')(<Input placeholder="请输入入厂批次" style={{ width }} />)}
                </Col>
              </Row>
              <Row style={rowStyle}>
                <Col type="title" style={{ width: titleWidth }}>
                  采购清单
                </Col>
                <Col type="content" style={{ width }}>
                  {getFieldDecorator('procureOrderNumber')(
                    <Searchselect type="procureOrder" placeholder="请选择采购清单" style={{ width }} />,
                  )}
                </Col>
              </Row>
            </Row>
          </Fragment>
        ) : null}
        <Row>
          <Row style={rowStyle}>
            <Col type="title" style={{ width: titleWidth }}>
              二维码
            </Col>
            <Col type="content" style={{ width }}>
              {getFieldDecorator('qrCode', {})(<Input placeholder="请输入二维码" style={{ width }} />)}
            </Col>
          </Row>
          {checkType === INPUT_FACTORY_QC ? (
            <Row style={rowStyle}>
              <Col type="title" style={{ width: titleWidth }}>
                供应商
              </Col>
              <Col type="content" style={{ width }}>
                {getFieldDecorator('supplierCode')(
                  <Searchselect type="supplier" placeholder="请选择供应商" style={{ width }} />,
                )}
              </Col>
            </Row>
          ) : null}
        </Row>
      </div>
      <Button style={{ marginTop: 10 }} type="primary" onClick={onSearch}>
        查询
      </Button>
    </div>
  );
};

Filter.contextTypes = {
  changeChineseToLocale: PropTypes.any,
};

export default withForm({}, Filter);
