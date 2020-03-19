import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import { Select, InputNumber, FormattedMessage } from 'src/components';
import { amountValidator } from 'src/components/form/index';
import { error } from 'src/styles/color';
import { QUALITY_STATUS } from 'src/views/qualityManagement/constants';
import { TRALLYING_STATUS } from 'src/containers/qrCodeQuery/utils';
import { VALIDITY_PERIOD_PRECISION, getOrganizationValidityPeriodConfig } from 'src/utils/organizationConfig';

import { TIME_PRECISION, MONITOR_CONDITION, findMonitorCondition } from '../../utils';

const SelectGroup = Select.SelectGroup;
const ITEM_WIDTH = 100;
const BASE_ITEM_STYLE = { width: ITEM_WIDTH, margin: '0px 10px' };

// 将condition格式化为后端需要的格式
export const formatConditionToSubmit = value => {
  if (!value) return null;
  const { qaStatus, businessStatus, monitorCondition, sign, time, timeUnit } = value || {};

  let rules = {};
  if (monitorCondition === MONITOR_CONDITION.qcStatus.value) {
    rules = {
      status: [qaStatus],
    };
  }

  if (monitorCondition === MONITOR_CONDITION.businessStatus.value) {
    rules = {
      status: businessStatus,
    };
  }

  if (
    monitorCondition === MONITOR_CONDITION.validity.value ||
    monitorCondition === MONITOR_CONDITION.lastTimeCheckTime.value ||
    monitorCondition === MONITOR_CONDITION.createTime.value
  ) {
    rules = {
      span: time,
      compare: sign,
      timeScale: timeUnit,
    };
  }

  return {
    field: monitorCondition,
    variables: rules,
  };
};

const getInitialValueForTimeUnit = initialValue => {
  if (initialValue) return initialValue;
  const configValue = getOrganizationValidityPeriodConfig();
  if (configValue === VALIDITY_PERIOD_PRECISION.hour.value) {
    return TIME_PRECISION.hour.value;
  }
  if (configValue === VALIDITY_PERIOD_PRECISION.day.value) {
    return TIME_PRECISION.day.value;
  }
  return undefined;
};

const MonitorConditionSelect = props => {
  const { form, initialData } = props;
  const { getFieldDecorator, getFieldError, getFieldValue } = form;
  const [signs, setSigns] = useState(null);

  // 初始值改变的时候需要设置
  useEffect(() => {
    if (!initialData) return;
    const { monitorCondition } = initialData;
    const { signs } = findMonitorCondition(monitorCondition) || {};
    setSigns(signs);
  }, [JSON.stringify(initialData)]);

  return (
    <div>
      {getFieldDecorator('monitorCondition', {
        onChange: value => {
          const { signs } = findMonitorCondition(value) || {};
          setSigns(signs);
        },
        rules: [
          {
            required: true,
            message: '监控条件必选',
          },
        ],
        initialValue: initialData ? initialData.monitorCondition : undefined,
      })(
        <SelectGroup
          style={{ ...BASE_ITEM_STYLE, marginLeft: 0, width: ITEM_WIDTH + 30 }}
          groupData={Object.values(MONITOR_CONDITION).map(i => {
            const { name, value } = i;
            return { label: name, value };
          })}
        />,
      )}
      {Array.isArray(signs) && signs.length === 1
        ? getFieldDecorator('sign', {
            initialValue: signs[0].value,
          })(<span>{signs[0].name}</span>)
        : null}
      {Array.isArray(signs) && signs.length === 2
        ? getFieldDecorator('sign', {
            rules: [
              {
                required: true,
                message: '符号必选',
              },
            ],
            initialValue: initialData ? initialData.sign : undefined,
          })(
            <SelectGroup
              style={{ ...BASE_ITEM_STYLE, width: ITEM_WIDTH - 30 }}
              groupData={signs.map(i => ({ label: i.name, value: i.value }))}
            />,
          )
        : null}
      {[
        MONITOR_CONDITION.createTime.value,
        MONITOR_CONDITION.lastTimeCheckTime.value,
        MONITOR_CONDITION.validity.value,
      ].indexOf(getFieldValue('monitorCondition')) !== -1 ? (
        <React.Fragment>
          <span>{'（'}</span>
          <FormattedMessage defaultMessage={'监控时间'} />
          <span style={{ margin: '0px 10px' }}>
            {getFieldValue('monitorCondition') === MONITOR_CONDITION.validity.value ? '+' : '-'}
          </span>
          {getFieldDecorator('time', {
            rules: [
              { validator: amountValidator(null, 0, 'integer') },
              {
                required: true,
                message: '监控时间必选',
              },
            ],
            initialValue: initialData ? initialData.time || 0 : 0,
          })(<InputNumber style={{ ...BASE_ITEM_STYLE, width: ITEM_WIDTH - 30 }} />)}
          {getFieldDecorator('timeUnit', {
            rules: [
              {
                required: true,
                message: '时间单位必选',
              },
            ],
            initialValue: getInitialValueForTimeUnit(initialData ? initialData.timeUnit : undefined),
          })(
            <SelectGroup
              disabled={getFieldValue('monitorCondition') === MONITOR_CONDITION.validity.value}
              style={{ ...BASE_ITEM_STYLE, width: ITEM_WIDTH - 30 }}
              groupData={Object.values(TIME_PRECISION).map(i => ({ label: i.name, value: i.value }))}
            />,
          )}
          <span>{'）'}</span>
        </React.Fragment>
      ) : null}
      {MONITOR_CONDITION.qcStatus.value === getFieldValue('monitorCondition') ? (
        <React.Fragment>
          {getFieldDecorator('qaStatus', {
            rules: [
              {
                required: true,
                message: '质量状态必选',
              },
            ],
            initialValue: initialData ? initialData.qaStatus : undefined,
          })(
            <SelectGroup
              style={BASE_ITEM_STYLE}
              groupData={Object.values(QUALITY_STATUS).map(i => ({ label: i.name, value: i.value }))}
            />,
          )}
        </React.Fragment>
      ) : null}
      {MONITOR_CONDITION.businessStatus.value === getFieldValue('monitorCondition') ? (
        <React.Fragment>
          {getFieldDecorator('businessStatus', {
            rules: [
              {
                required: true,
                message: '业务类型必须',
              },
            ],
            initialValue: initialData ? initialData.businessStatus : undefined,
          })(
            <SelectGroup
              style={BASE_ITEM_STYLE}
              groupData={Object.values(TRALLYING_STATUS).map(i => ({ label: i.name, value: i.enumValue }))}
            />,
          )}
        </React.Fragment>
      ) : null}
      {['time', 'timeUnit', 'sign', 'qaStatus', 'businessStatus', 'monitorCondition'].map(i => (
        <div style={{ color: error }}>{getFieldError(i)}</div>
      ))}
    </div>
  );
};

MonitorConditionSelect.propTypes = {
  style: PropTypes.any,
  form: PropTypes.any,
  initialData: PropTypes.any,
};

export default MonitorConditionSelect;
