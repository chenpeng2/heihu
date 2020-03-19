import React, { Component } from 'react';
import { injectIntl } from 'react-intl';
import { changeChineseToLocale } from 'utils/locale/utils';
import { addDeviceMetric } from 'src/services/equipmentMaintenance/device';
import { withForm, FormItem, Input, Searchselect } from 'src/components';

type Props = {
  form: {},
  intl: any,
  fetchData: () => {},
};

class AddMetricModal extends Component {
  props: Props;

  submit = () => {
    const { form, fetchData } = this.props;
    const { validateFieldsAndScroll } = form;
    validateFieldsAndScroll((err, values) => {
      if (!err) {
        try {
          const params = {
            metricName: values.metricName,
            metricUnitId: values.metricUnit.key,
            deviceCategoryType: 1,
          };
          addDeviceMetric(params).then(() => {
            fetchData();
          });
        } catch (e) {
          console.error(e);
        }
      }
    });
  };

  render = () => {
    const { form, intl } = this.props;
    const { getFieldDecorator } = form;
    return (
      <div>
        <div style={{ display: 'inline-block', marginTop: 20 }}>
          <FormItem label="读数名称">
            {getFieldDecorator('metricName', {
              rules: [
                { required: true, message: changeChineseToLocale('读数名称必填', intl) },
                { max: 10, message: changeChineseToLocale('读数名称不可超过10个字符', intl) },
              ],
            })(<Input style={{ width: 300 }} placeholder="请填写读数名称" />)}
          </FormItem>
          <FormItem label="单位">
            {getFieldDecorator('metricUnit', {
              rules: [{ required: true, message: changeChineseToLocale('单位必填', intl) }],
            })(
              <Searchselect
                onChange={this.handleUnitChange}
                style={{ width: 300 }}
                placeholder="请选择单位"
                type={'unit'}
              />,
            )}
          </FormItem>
        </div>
      </div>
    );
  };
}

export default injectIntl(withForm({ showFooter: true }, AddMetricModal));
