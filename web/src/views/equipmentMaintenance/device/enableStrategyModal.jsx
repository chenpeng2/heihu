import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'utils/time';
import { withForm, FormItem, Input, DatePicker } from 'src/components';
import { amountValidator } from 'src/components/form';
import {
  enableEquipProdStrategy,
  enableEquipModuleStrategy,
  enableToolingStrategy,
} from 'services/equipmentMaintenance/base';

type Props = {
  id: any,
  form: {},
  data: any,
  strategy: {},
  type: string,
  handleChangeStrategyStatus: () => {},
  fetchData: () => {},
};
const timeFormat = 'YYYY-MM-DD HH:mm';

class EnableStrategyModal extends Component {
  props: Props;

  submit = () => {
    const { data, form, handleChangeStrategyStatus, id, type, strategy } = this.props;
    const { strategyTriggerType, strategyCode, deviceMetric } = strategy;
    const { validateFieldsAndScroll } = form;
    let enableStrategy;
    switch (type) {
      case 'module':
        enableStrategy = enableEquipModuleStrategy;
        break;
      case 'device':
        enableStrategy = enableEquipProdStrategy;
        break;
      case 'tooling':
        enableStrategy = enableToolingStrategy;
        break;
      default:
        enableStrategy = () => {};
    }
    validateFieldsAndScroll((err, values) => {
      if (!err) {
        try {
          const params = {};
          if (strategyTriggerType === 1 || strategyTriggerType === 2) {
            params.strategyCode = strategyCode;
            params.lastExecutionTime = Date.parse(values.lastExecutionTime);
            params.updateStrategyBase = true;
          } else {
            params.strategyCode = strategyCode;
            params.metricBaseLineValue = values.metricBaseLineValue;
            params.updateStrategyBase = true;
          }
          handleChangeStrategyStatus(true);
          enableStrategy(id, params).then(() => {
            strategy.enabled = 1;
            if (strategyTriggerType === 1 || strategyTriggerType === 2) {
              strategy.lastExecutionTime = moment(Date.parse(values.lastExecutionTime)).format('YYYY/MM/DD HH:mm:ss');
            } else {
              data.deviceMetricValues.forEach(n => {
                if (deviceMetric.id === n.id || deviceMetric.id === n.metricId) {
                  n.metricValue = values.metricBaseLineValue;
                }
              });
            }
            handleChangeStrategyStatus(false);
          });
        } catch (e) {
          console.error(e);
        }
      }
    });
  };

  render = () => {
    const { form, strategy } = this.props;
    const { changeChineseTemplateToLocale } = this.context;
    const { strategyTriggerType, createAt, deviceMetric } = strategy;
    const { metricName, metricUnitName } = deviceMetric || {};
    const { getFieldDecorator } = form;
    return (
      <div>
        <div style={{ display: 'inline-block', marginTop: 20 }}>
          {strategyTriggerType === 1 || strategyTriggerType === 2 ? (
            <FormItem label="上次执行时间">
              {getFieldDecorator('lastExecutionTime', {
                rules: [{ required: true, message: '上次执行时间必填' }],
              })(<DatePicker showTime format={timeFormat} style={{ width: 300 }} placeholder="请选择上次执行时间" />)}
            </FormItem>
          ) : (
            <FormItem label={metricName}>
              {getFieldDecorator('metricBaseLineValue', {
                rules: [
                  { required: true, message: changeChineseTemplateToLocale('当前{metricName}必填', { metricName }) },
                  {
                    validator: amountValidator(
                      999999999,
                      { value: 0, equal: false, message: '数字必需大于0' },
                      null,
                      3,
                    ),
                  },
                ],
              })(
                <div>
                  <Input
                    style={{ width: 250 }}
                    placeholder={changeChineseTemplateToLocale('请输入当前{metricName}', { metricName })}
                  />
                  <span style={{ marginLeft: 10 }}>{metricUnitName}</span>
                </div>,
              )}
            </FormItem>
          )}
        </div>
      </div>
    );
  };
}

EnableStrategyModal.contextTypes = {
  changeChineseTemplateToLocale: PropTypes.any,
};

export default withForm({ showFooter: true }, EnableStrategyModal);
