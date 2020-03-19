import React, { Component } from 'react';
import { Radio, Row, Col } from 'antd';
import { withForm, InputNumber, Icon, Select, Input, FormItem, FormattedMessage } from 'src/components';
import _ from 'lodash';
import { amountValidator } from 'src/components/form';
import { error, blacklakeGreen } from 'src/styles/color';
import MaterialSelect from 'components/select/materialSelect';
import { mathJs, isNumber, round } from 'src/utils/number';
import { findMaterial } from '../util';
import styles from './styles.scss';
import Form from '../../../../views/organizationConfig/customProperty/saleOrder/Edit/Form';

const RadioGroup = Radio.Group;
const Option = Select.Option;
class MaterialTable extends Component {
  props: {
    onChange?: () => {},
    materialList: [],
    disabled: boolean,
    hasPrimaryMaterial: boolean,
    processGroup: {},
    preProcessGroup: {
      outputMaterial?: {},
      nodes: [],
    },
    value: [],
    form: {
      getFieldDecorator: () => {},
      validateFieldsAndScroll: () => {},
    },
    outerForm: {
      setFieldsValue: () => {},
      getFieldValue: () => {},
      getFieldDecorator: () => {},
    },
    productMaterialCode: string,
    isAlwaysOneCode: boolean,
  };
  state = { value: [{}] };

  componentDidMount() {
    const { processGroup, value } = this.props;
    // 本身如果是并行工序那么不需要把前序工序组的输出填入投入物料
    if (this.isParallelProcessGroup(processGroup)) {
      return;
    }
    this.setState({
      value: value || [{}],
      usedMaterialList: [],
    });
  }

  componentWillReceiveProps(nextProps) {
    const { value: oldValue } = this.props;
    const { value } = nextProps;
    if (!_.isEqual(oldValue, value)) {
      this.setState({
        value: _.cloneDeep(value),
      });
    }
  }

  validateFormValue = () => {
    let result = true;
    this.props.form.validateFieldsAndScroll({ force: true }, err => {
      if (err) {
        result = false;
      }
    });
    return result;
  };

  disableSelect = data => {
    const arr = [];
    if (data && data.forEach) {
      data.forEach(({ material }) => {
        if (material) {
          const { code, name } = material;
          arr.push(JSON.stringify({ code, name }));
        }
      });
    }
    return arr;
  };

  isParallelProcessGroup = processGroup => processGroup && processGroup.nodes.length > 1;

  render() {
    const { onChange, materialList, disabled, form, outerForm, hasPrimaryMaterial, isAlwaysOneCode } = this.props;
    const { value } = this.state;

    const disabledValue = this.disableSelect(value);

    const renderMaterialRow = (material, index) => {
      const { amount } = this.state.value[index] || {};
      const value = this.state.value[index];
      const _rawMaterial = findMaterial(_.get(material, 'code'), materialList);
      let unitSelections = [];
      if (material) {
        const { unitId, unitName, unitConversions } = material;
        unitSelections = [{ id: unitId, name: unitName }].concat(
          (unitConversions || []).map(({ slaveUnitId, slaveUnitName }) => ({
            id: slaveUnitId,
            name: slaveUnitName,
          })),
        );
      }
      return (
        <Row gutter={24} key={index} className={styles.row}>
          <Col span={1}>
            <Icon
              type="minus-circle"
              style={{ cursor: 'pointer' }}
              onClick={() => {
                if (!disabled) {
                  const value = [...this.state.value];
                  value.splice(index, 1);
                  this.setState({ value: _.cloneDeep(value) }, () => {
                    if (onChange) {
                      onChange(value);
                    }
                  });
                }
              }}
            />
          </Col>
          <Col span={hasPrimaryMaterial ? 7 : 11}>
            {materialList && materialList.length ? (
              <Select
                allowClear
                value={
                  material
                    ? JSON.stringify({ code: _.get(material, 'code'), name: _.get(material, 'name') })
                    : undefined
                }
                disabled={disabled}
                disabledValues={disabledValue}
                onChange={v => {
                  const value = [...this.state.value];
                  if (!v) {
                    value[index] = { ...value[index], currentUnitId: null, material: null, amount: null };
                    form.resetFields([`amount${index}`, `currentUnitId${index}`]);
                  } else {
                    const rawMaterial = findMaterial(_.get(JSON.parse(v), 'code'), materialList);
                    // this.setState({ oldRawMaterialList: _.cloneDeep(materialList) });
                    const { material, amount, currentUnitId } = rawMaterial;
                    const { unitId } = material;
                    // rawMaterial.amount = 0;
                    form.setFieldsValue({
                      [`amount${index}`]: amount,
                      [`currentUnitId${index}`]: currentUnitId || unitId,
                    });
                    value[index] = { ...value[index], currentUnitId: currentUnitId || unitId, material, amount };
                  }
                  this.setState({ value }, () => {
                    if (onChange) {
                      onChange(value);
                    }
                  });
                }}
              >
                {materialList.map((node, index) => {
                  let disabled = false;
                  if (disabledValue && disabledValue.length) {
                    disabled = !!disabledValue.find(material => JSON.parse(material).code === node.material.code);
                  }
                  const {
                    material: { name, code },
                  } = node;
                  return (
                    <Option
                      key={index}
                      value={JSON.stringify({ code, name })}
                      disabled={
                        disabled || (isNumber(node.amount) ? mathJs.smallerEq(mathJs.fraction(node.amount), 0) : false)
                      }
                    >
                      {`${code} / ${name}`}
                    </Option>
                  );
                })}
              </Select>
            ) : (
              <MaterialSelect
                allowClear
                value={
                  material
                    ? {
                        key: JSON.stringify({ code: material.code, name: material.name, unitName: material.unitName }),
                        label: `${material.code}/${material.name}`,
                      }
                    : undefined
                }
                disabled={disabled}
                params={{ status: 1 }}
                disabledValues={disabledValue}
                onChange={materialString => {
                  const value = [...this.state.value];
                  if (!materialString) {
                    value[index] = { ...value[index], currentUnitId: null, material: null, amount: null };
                    form.resetFields([`amount${index}`, `currentUnitId${index}`]);
                  } else {
                    const material = JSON.parse(materialString.key);
                    form.setFieldsValue({ [`currentUnitId${index}`]: material.unitId });
                    value[index] = { ...value[index], currentUnitId: material.unitId, material };
                  }
                  this.setState({ value }, () => {
                    if (onChange) {
                      onChange(value);
                    }
                  });
                }}
              />
            )}
          </Col>
          <Col span={4}>
            <FormItem>
              {form.getFieldDecorator(`currentUnitId${index}`, {
                initialValue: value.currentUnitId || (value.material && value.material.unitId),
              })(
                <Select
                  value={(value || {}).currentUnitId}
                  disabled={materialList && materialList.length}
                  style={{ width: 100 }}
                  placeholder={null}
                  onChange={currentUnitId => {
                    const value = [...this.state.value];
                    value[index].currentUnitId = currentUnitId;
                    this.setState({ value }, () => {
                      if (onChange) {
                        onChange(value);
                      }
                    });
                  }}
                >
                  {unitSelections.map(({ id, name }) => (
                    <Option id={id} value={id}>
                      {name}
                    </Option>
                  ))}
                </Select>,
              )}
            </FormItem>
          </Col>
          <Col span={4}>
            <FormItem
              style={{ marginBottom: 0 }}
              validateStatus={form.getFieldError(`amount${index}`) ? 'error' : undefined}
              help=""
            >
              {form.getFieldDecorator(`amount${index}`, {
                rules: [
                  {
                    validator: amountValidator(_rawMaterial && _rawMaterial.amount, null, 'fraction', 6),
                  },
                ],
                initialValue: amount,
              })(
                <Input
                  placeholder={'支持小数和分数'}
                  disabled={disabled}
                  value={(value || {}).amount}
                  onChange={amount => {
                    const value = [...this.state.value];
                    value[index].amount = amount;
                    this.setState({ value }, () => {
                      if (onChange) {
                        onChange(value);
                      }
                    });
                  }}
                />,
              )}
            </FormItem>
            {form.getFieldError(`amount${index}`) ? (
              <div style={{ color: error, lineHeight: '20px' }}>{form.getFieldError(`amount${index}`)}</div>
            ) : null}
          </Col>
          {materialList && materialList.length ? (
            <Col span={4}>
              <Input disabled value={_rawMaterial && round(_rawMaterial.lossRate * 100)} placeholder="损耗率" />
            </Col>
          ) : null}
          {hasPrimaryMaterial && (
            <Col span={4}>
              <Radio value={(material && material.code) || index}>
                <FormattedMessage defaultMessage={'主物料'} />
              </Radio>
            </Col>
          )}
        </Row>
      );
    };

    const addRow = () => {
      if (!disabled) {
        if (!this.state.value) {
          this.setState({ value: [{}] });
        } else {
          const value = [...this.state.value];
          value.push({});
          this.setState({ value });
        }
      }
    };

    const renderColumn = (
      <React.Fragment>
        {value && value.map(({ material }, index) => renderMaterialRow(material, index))}
        <div style={{ color: blacklakeGreen }}>
          <span style={{ cursor: 'pointer' }} onClick={addRow}>
            <Icon type="plus-circle-o" style={{ paddingRight: 5 }} />
            <FormattedMessage defaultMessage={'添加一行'} />
          </span>
          {Array.isArray(materialList) && materialList.length ? (
            <span
              style={{ cursor: 'pointer', marginLeft: 15 }}
              onClick={() => {
                const _materialList = materialList.filter(e => e.amount);
                this.setState({ value: _materialList }, () => {
                  onChange(_materialList);
                });
              }}
            >
              <Icon type="plus-circle-o" style={{ paddingRight: 5 }} />
              <FormattedMessage defaultMessage={'添加全部物料'} />
            </span>
          ) : null}
        </div>
      </React.Fragment>
    );

    return (
      <div className={styles.materialTableContainer}>
        <Row gutter={24} className={styles.tableHeader}>
          <Col span={1} />
          <Col span={hasPrimaryMaterial ? 7 : 11}>
            <FormattedMessage defaultMessage={'物料编码/名称'} />
          </Col>
          <Col span={4}>
            <FormattedMessage defaultMessage={'单位'} />
          </Col>
          <Col span={4}>
            <FormattedMessage defaultMessage={'数量'} />
          </Col>
          {Array.isArray(materialList) && materialList.length ? (
            <Col span={4}>
              <FormattedMessage defaultMessage={'损耗率（％）'} />
            </Col>
          ) : null}
        </Row>
        {hasPrimaryMaterial ? (
          outerForm.getFieldDecorator('primaryMaterialCode')(
            <RadioGroup
              style={{ width: '100%' }}
              disabled={disabled}
              onChange={e => {
                if (isAlwaysOneCode) {
                  const code = e.target.value;
                  const formatValue =
                    Array.isArray(value) &&
                    value.map(({ material, materialProductionMode, ...rest }) => ({
                      material,
                      ...rest,
                      materialProductionMode: material && material.code === code ? 1 : materialProductionMode,
                    }));
                  this.setState(
                    {
                      value: formatValue,
                    },
                    () => {
                      onChange(formatValue);
                    },
                  );
                }
              }}
            >
              {renderColumn}
            </RadioGroup>,
          )
        ) : (
          <div>{renderColumn}</div>
        )}
      </div>
    );
  }
}

export default withForm({}, MaterialTable);
