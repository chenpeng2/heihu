import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import { openModal, FormItem, Link, message, FormattedMessage } from 'src/components';
import { middleGrey } from 'src/styles/color';
import UnitSearchSelect from 'src/containers/unit/unitSearchSelect';
import { changeChineseToLocaleWithoutIntl } from 'utils/locale/utils';
import ConvertUnitTable from './convertUnitTable';
import UnitSettingModal from './unitSettingModal';

class Unit extends Component {
  state = {};

  render() {
    const {
      form,
      edit,
      unitsForSelect,
      unitConversions,
      cbForUnitsChange,
      cbForUnitChange,
      cbForMainUnitChange,
    } = this.props;
    const { getFieldDecorator } = form;
    getFieldDecorator('proUseUnitId');
    getFieldDecorator('proHoldUnitId');
    getFieldDecorator('inputFactoryUnitId');
    return (
      <div>
        <FormItem label="主单位">
          {getFieldDecorator('unitId', {
            rules: [{ required: true, message: <FormattedMessage defaultMessage={'主单位必选'} /> }],
            onChange: (__, option) => {
              const unit = _.get(option, 'props.unit');
              form.setFieldsValue({
                proUseUnitId: unit && unit.id,
                proHoldUnitId: unit && unit.id,
                inputFactoryUnitId: unit && unit.id,
              });
              if (typeof cbForMainUnitChange === 'function') cbForMainUnitChange('mainUnit', unit);
            },
          })(<UnitSearchSelect disabled={edit} style={{ width: 300, height: 32 }} />)}
          <Link
            style={{ paddingLeft: 10 }}
            onClick={() => {
              if (!form.getFieldValue('unitId')) {
                message.error('请先设置主单位!');
                return;
              }
              openModal({
                title: '单位设置',
                children: (
                  <UnitSettingModal
                    units={unitsForSelect}
                    proUseUnitId={form.getFieldValue('proUseUnitId')}
                    proHoldUnitId={form.getFieldValue('proHoldUnitId')}
                    inputFactoryUnitId={form.getFieldValue('inputFactoryUnitId')}
                  />
                ),
                footer: null,
                onOk: value => {
                  form.setFieldsValue(value);
                },
              });
            }}
          >
            单位设置
          </Link>
          <div style={{ color: middleGrey }}>
            {changeChineseToLocaleWithoutIntl('系统中计算物料时使用的单位，建议维护成最小单位')}
          </div>
        </FormItem>
        <FormItem label="转换单位">
          <ConvertUnitTable
            cbForUnitsChange={cbForUnitsChange}
            cbForUnitChange={cbForUnitChange}
            form={form}
            unitConversions={unitConversions}
            edit={edit}
          />
        </FormItem>
      </div>
    );
  }
}

Unit.propTypes = {
  style: PropTypes.object,
  form: PropTypes.any,
  unitConversions: PropTypes.any,
  edit: PropTypes.any,
  units: PropTypes.any,
  unitsForSelect: [],
  cbForUnitsChange: PropTypes.func,
  cbForUnitChange: PropTypes.func,
  cbForMainUnitChange: PropTypes.func,
};

export default Unit;
