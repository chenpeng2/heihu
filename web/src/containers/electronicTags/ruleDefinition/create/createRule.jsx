import React, { Component } from 'react';
import _ from 'lodash';
import { Modal } from 'antd';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import { withForm, Button, message as AntMessage } from 'components';
import { createBarcodeLabelRule, enableBarcodeLabelRule } from 'src/services/barCodeLabel';
import RuleBaseForm from '../base/baseForm';
import styles from '../styles.scss';

const buttonStyle = { width: 114, height: 32, marginRight: 40 };
const basePath = '/electronicTag/ruleDefinition';

type Props = {
  form: any,
};

class CreateRule extends Component {
  props: Props;
  state = {};

  formatItems = ({ itemType, valueFormat, valueLength, valueSeqType, valueSource, valueStep, ...items }) => {
    itemType = _.toNumber(itemType);
    valueFormat = _.toNumber(valueFormat);
    valueLength = _.toNumber(valueLength);
    valueSeqType = _.toNumber(valueSeqType);
    valueSource = _.toNumber(valueSource);
    valueStep = _.toNumber(valueStep);
    return _.omitBy({ itemType, valueFormat, valueLength, valueSeqType, valueSource, valueStep, ...items }, _.isNaN);
  };

  onSubmit = () => {
    this.props.form.validateFieldsAndScroll(async (err, values) => {
      if (!err) {
        const { items: formItems } = values;
        const items = Object.values(formItems || {});
        if (!items.length) {
          AntMessage.error('条码规则明细列表没有设置流水号作为编码元素，请重新设置！');
          return;
        }
        values.items = items.map(x => this.formatItems(x));
        const {
          data: { data, statusCode, message },
        } = await createBarcodeLabelRule(values);
        if (statusCode === 200) {
          this.context.router.history.push(`${basePath}/detail/${data}`);
        } else if (statusCode === 202) {
          Modal.confirm({
            iconType: 'exclamation-circle',
            className: `${styles.enableModal}`,
            title: '',
            content: `已配置默认编码规则${data.ruleName}，是否确定替代原编码规则？`,
            okText: '确认',
            cancelText: '取消',
            onOk: () => {
              createBarcodeLabelRule({ ...values, forceDefault: true })
                .then(({ data: { statusCode, data } }) => {
                  if (statusCode === 200) {
                    this.context.router.history.push(`${basePath}/detail/${data}`);
                  }
                })
                .catch(console.log);
            },
          });
        } else {
          AntMessage.error(message);
        }
      }
    });
  };

  render() {
    const { form } = this.props;
    const { changeChineseToLocale } = this.context;

    return (
      <div className={styles.pageStyle}>
        <div className={styles.pageHeader}>
          <p>{changeChineseToLocale('创建规则')}</p>
        </div>
        <RuleBaseForm form={form} />
        <div style={{ paddingLeft: 120, marginTop: 30 }}>
          <Button
            type="default"
            style={buttonStyle}
            onClick={() => {
              const { router } = this.context;
              if (router) {
                router.history.go(-1);
              }
            }}
          >
            取消
          </Button>
          <Button type="primary" style={buttonStyle} onClick={this.onSubmit}>
            保存
          </Button>
        </div>
      </div>
    );
  }
}

CreateRule.contextTypes = {
  router: PropTypes.object,
  changeChineseToLocale: PropTypes.any,
};

export default withForm({}, CreateRule);
