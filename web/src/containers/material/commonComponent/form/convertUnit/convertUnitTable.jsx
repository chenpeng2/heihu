import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import { Link, Select, FormItem, Table, Icon, InputNumber } from 'src/components';
import { amountValidator, requiredRule } from 'src/components/form';
import UnitSearchSelect from 'src/containers/unit/unitSearchSelect';

const Option = Select.Option;
const tableFormItem = { paddingTop: 12, height: 66 };

class ConvertUnit extends Component {
  state = {
    unitConversions: [],
    convertUnitsTotal: 0,
    keys: 0,
  };

  componentDidMount() {
    const { unitConversions } = this.props;

    if (Array.isArray(unitConversions) && unitConversions.length) {
      this.setState(
        {
          convertUnitsTotal: unitConversions && unitConversions.length,
        },
        () => {
          this.addConvertUnit(unitConversions, false);
        },
      );
    }
  }

  componentWillReceiveProps({ unitConversions, edit }) {
    const { unitConversions: oldData } = this.props;
    if (!_.isEqual(oldData, unitConversions) && edit) {
      this.addConvertUnit(unitConversions);
    }
  }

  getConvertUnitsColumns = () => {
    const { edit, form, cbForUnitChange } = this.props;
    const { getFieldDecorator } = form;
    const masterUnit = this.props.form.getFieldValue('unitId');

    const isDisabled = data => {
      const { isNew } = data || {};
      return edit && !isNew;
    };

    return [
      {
        key: 'operation',
        width: 15,
        render: (text, record, index) => {
          const disabled = isDisabled(record);
          return (
            <div style={tableFormItem}>
              {!disabled ? (
                <Icon
                  onClick={() => this.deleteConvertUnit(index)}
                  style={{ height: 40, lineHeight: '40px', margin: '0 10px', cursor: 'pointer' }}
                  type="minus-circle"
                />
              ) : null}
            </div>
          );
        },
      },
      {
        key: 'masterUnitCount',
        dataIndex: 'masterUnitCount',
        width: 150,
        render: (text, record) => {
          const { key } = record;
          const disabled = isDisabled(record);

          return (
            <div style={tableFormItem}>
              <FormItem style={{ width: 150 }}>
                {getFieldDecorator(`unitConversions[${key}].masterUnitCount`, {
                  initialValue: text || undefined,
                  rules: [
                    requiredRule('数量'),
                    {
                      validator: amountValidator(null, null, null, 6, '数量'),
                    },
                  ],
                })(<InputNumber disabled={disabled} min={0} />)}
              </FormItem>
            </div>
          );
        },
      },
      {
        key: 'masterUnit',
        width: 150,
        render: record => {
          return (
            <div style={tableFormItem}>
              <FormItem style={{ width: 150 }}>
                <UnitSearchSelect placeholder="请选择" style={{ width: 88 }} value={masterUnit} disabled />
              </FormItem>
            </div>
          );
        },
      },
      {
        key: 'equalSign',
        width: 150,
        render: () => (
          <div style={tableFormItem}>
            <FormItem style={{ width: 150 }}>=</FormItem>
          </div>
        ),
      },
      {
        key: 'slaveUnitCount',
        dataIndex: 'slaveUnitCount',
        width: 150,
        render: (text, record) => {
          const { key } = record;
          const disabled = isDisabled(record);

          return (
            <div style={tableFormItem}>
              <FormItem style={{ width: 150 }}>
                {getFieldDecorator(`unitConversions[${key}].slaveUnitCount`, {
                  initialValue: text || undefined,
                  rules: [
                    requiredRule('数量'),
                    {
                      validator: amountValidator(null, null, null, 6, '数量'),
                    },
                  ],
                })(<InputNumber min={0} disabled={disabled} />)}
              </FormItem>
            </div>
          );
        },
      },
      {
        key: 'slaveUnitId',
        dataIndex: 'slaveUnitId',
        render: (text, record) => {
          const { key } = record;
          const disabled = isDisabled(record);

          return (
            <div style={tableFormItem}>
              <FormItem style={{ width: 150 }}>
                {getFieldDecorator(`unitConversions[${key}].slaveUnitId`, {
                  initialValue: text || undefined,
                  rules: [requiredRule('单位')],
                  onChange: (value, option) => {
                    if (typeof cbForUnitChange === 'function') {
                      const unit = _.get(option, 'props.unit');
                      cbForUnitChange(key, unit);
                    }
                  },
                })(<UnitSearchSelect placeholder="请选择" style={{ width: 88 }} disabled={disabled} />)}
              </FormItem>
            </div>
          );
        },
      },
    ];
  };

  getConvertUnitsFooter = () => {
    return (
      <Link icon="plus-circle-o" onClick={() => this.addConvertUnit(null, true)}>
        添加转换项
      </Link>
    );
  };

  deleteConvertUnit = index => {
    const { cbForUnitsChange } = this.props;
    const { unitConversions } = this.state;
    const _unitConversions = _.difference(unitConversions, [unitConversions[index]]);
    this.setState(
      {
        unitConversions: _unitConversions,
      },
      () => {
        if (typeof cbForUnitsChange === 'function') cbForUnitsChange(_unitConversions);
      },
    );
  };

  addConvertUnit = (initialData, isNew) => {
    const { cbForUnitsChange } = this.props;
    const { unitConversions, keys } = this.state;
    const initialObj = {
      masterUnitCount: null,
      slaveUnitId: null,
      slaveUnitCount: null,
      isNew: !!isNew, // 编辑的时候不可以改变初始的值。
    };
    if (initialData) {
      initialData = initialData.map((x, i) => _.merge(x, { key: i }));
    }

    const _unitConversions =
      initialData ||
      unitConversions.concat({
        key: keys,
        ...initialObj,
      });
    this.setState(
      {
        unitConversions: _unitConversions,
        keys: initialData ? initialData.length : keys + 1,
      },
      () => {
        if (typeof cbForUnitsChange === 'function') cbForUnitsChange(_unitConversions);
      },
    );
  };

  render() {
    const { unitConversions } = this.state;
    const columns = this.getConvertUnitsColumns();

    const tProps = {
      showHeader: false,
      style: { marginLeft: 0, minWidth: 475 },
      scroll: { x: 600 },
      columns,
      dataSource: unitConversions,
      total: unitConversions,
      footer: () => this.getConvertUnitsFooter(),
      pagination: false,
      rowKey: record => record.key,
    };

    return <Table {...tProps} />;
  }
}

ConvertUnit.propTypes = {
  style: PropTypes.object,
  form: PropTypes.any,
  unitConversions: PropTypes.any,
  edit: PropTypes.any,
  cbForUnitsChange: PropTypes.func,
  cbForUnitChange: PropTypes.func,
};

export default ConvertUnit;
