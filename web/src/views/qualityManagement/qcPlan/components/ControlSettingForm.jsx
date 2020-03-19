import React from 'react';
import PropTypes from 'prop-types';
import { withForm, FormItem, Radio, Checkbox } from 'components';

import {
  firstQcTaskControlLevelMap,
  unqualifiedQualityStatusMap,
  QUALITY_STATUS_UNQUALIFIED,
  QUALITY_STATUS_AWAIT_CHECK,
  QUALITY_STATUS_DEVIATION_QUALIFIED,
  QUALITY_STATUS_ON_HOLD,
} from '../../constants';
import styles from '../styles.scss';

class ControlSettingForm extends React.Component {
  state = {};
  render() {
    const { form, data } = this.props;
    const { changeChineseToLocale } = this.context;
    const { getFieldDecorator } = form;
    const { noPassStatuses, controlLevel } = data || {};
    return (
      <div>
        <FormItem label={changeChineseToLocale('管控程度')}>
          {getFieldDecorator('controlLevel', {
            initialValue: controlLevel,
            rules: [
              {
                required: true,
                message: changeChineseToLocale('管控程度必填'),
              },
            ],
          })(
            <Radio.Group>
              {Object.keys(firstQcTaskControlLevelMap).map(key => (
                <Radio className={styles.qcPlan_formItem_radio} value={Number(key)}>
                  {changeChineseToLocale(firstQcTaskControlLevelMap[key])}
                </Radio>
              ))}
            </Radio.Group>,
          )}
        </FormItem>
        <FormItem label={changeChineseToLocale('不通过状态集')} required>
          <div className={styles.qcPlan_formItem_checkGroup}>
            {getFieldDecorator('noPassStatuses.unStandardStatus', {
              initialValue: noPassStatuses.unStandardStatus,
              valuePropName: 'checked',
            })(
              <Checkbox className={styles.qcPlan_formItem_checkbox}>
                {unqualifiedQualityStatusMap[QUALITY_STATUS_UNQUALIFIED].name}
              </Checkbox>,
            )}
            {getFieldDecorator('noPassStatuses.waitStatus', {
              initialValue: noPassStatuses.waitStatus,
              valuePropName: 'checked',
            })(
              <Checkbox className={styles.qcPlan_formItem_checkbox}>
                {unqualifiedQualityStatusMap[QUALITY_STATUS_AWAIT_CHECK].name}
              </Checkbox>,
            )}
            {getFieldDecorator('noPassStatuses.temporaryControlStatus', {
              initialValue: noPassStatuses.temporaryControlStatus,
              valuePropName: 'checked',
            })(
              <Checkbox className={styles.qcPlan_formItem_checkbox}>
                {unqualifiedQualityStatusMap[QUALITY_STATUS_ON_HOLD].name}
              </Checkbox>,
            )}
            {getFieldDecorator('noPassStatuses.asStandardStatus', {
              initialValue: noPassStatuses.asStandardStatus,
              valuePropName: 'checked',
            })(
              <Checkbox className={styles.qcPlan_formItem_checkbox}>
                {unqualifiedQualityStatusMap[QUALITY_STATUS_DEVIATION_QUALIFIED].name}
              </Checkbox>,
            )}
          </div>
        </FormItem>
      </div>
    );
  }
}

ControlSettingForm.contextTypes = {
  changeChineseToLocale: PropTypes.func,
};

ControlSettingForm.propTypes = {
  checkTypes: PropTypes.array,
  form: PropTypes.any,
  data: PropTypes.object,
};

export default withForm({}, ControlSettingForm);
