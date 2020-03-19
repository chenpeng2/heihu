import React, { Component, Fragment } from 'react';
import _ from 'lodash';

import { FormItem, Input, Link, Radio, Select, AlterableTable, InputNumber } from 'components';
import { replaceSign } from 'src/constants';
import { arrayIsEmpty } from 'utils/array';
import { changeChineseToLocaleWithoutIntl } from 'utils/locale/utils';

import {
  PRECISE_TYPE,
  WEIGHING_TYPE,
  PERIOD_UNIT,
  weighingModeMap,
  instructionLimitTypeMap,
  PERCENTAGE,
  WEIGHING_MODE_CUSTOM,
  WEIGHING_MODE_SEGMENT,
  WEIGHING_MODE_TOTAL,
} from '../../constants';
import { WorkstationSelect, ProductSelect, EbomSelect } from '../../base';
import { getUniqueEbomMaterialCode } from '../utils';

const Option = Select.Option;
const baseFormItemStyle = { width: 300 };
const NewTagLink = Link.NewTagLink;

const TableFormItemStyle = {
  height: 64,
  marginTop: 10,
  marginBottom: 0,
};

type Props = {
  form: any,
  initialData: {},
  inEdit: boolean,
};

class WeighingDefinitionBaseForm extends Component {
  props: Props;
  state = {
    dataSource: [],
    ebomMaterials: [],
    ebomId: null,
    initialData: {},
  };

  componentDidMount() {
    const { initialData } = this.props;
    if (initialData) {
      this.setInitialData(initialData);
    }
  }

  shouldComponentUpdate(nextProps, nextState, nextContent) {
    if (!_.isEqual(this.props.initialData, nextProps.initialData)) {
      this.setInitialData(nextProps.initialData);
    }
    return true;
  }

  setInitialData = async ({ ebomId, rawMaterialList, ...restData }) => {
    const { weighingObjects, workstation, ...rest } = restData || {};
    await this.formatEbomMaterials(rawMaterialList);
    this.setDataSource(weighingObjects);
    this.setState({ ebomId, initialData: { workstationIds: _.get(workstation, 'id'), ...rest } });
  };

  onProductMaterialChange = async v => {
    // 物料清单版本号需和成品物料进行匹配，否则无法定位一个具体的物料清单
    const {
      form: { resetFields },
    } = this.props;

    resetFields(['ebomVersion']);
    this.setState({ ebomId: null, dataSource: [], ebomMaterials: [] });
  };

  formatEbomMaterials = rawMaterialList => {
    if (rawMaterialList && rawMaterialList.length > 0) {
      const ebomMaterials = rawMaterialList.map(
        ({ material: { code, name, unitId, unitName, unitConversions }, amount, ...rest }, i) => {
          const masterUnit = { unitId, unitName };
          return {
            code,
            name,
            amount,
            units: _.isEmpty(unitConversions)
              ? [masterUnit]
              : [masterUnit].concat(unitConversions.map(e => ({ unitId: e.slaveUnitId, unitName: e.slaveUnitName }))),
            ...rest,
          };
        },
      );
      this.setState({
        ebomMaterials,
      });
    }
  };

  onEbomVersionChange = async (value, option) => {
    // 修改物料清单后，重置称量目标
    this.props.form.resetFields(['weighingObjects']);
    this.setState({ dataSource: [], ebomId: null, ebomMaterials: [] });
    const ebomId = _.get(option, 'props.id');

    // 当物料清单版本号改变时，会影响称量目标内能选的物料范围
    const rawMaterialList = _.get(option, 'props.rawMaterialList');
    await this.formatEbomMaterials(rawMaterialList);
    const needWeighing = this.state.ebomMaterials
      .filter(m => m.weight)
      .map(m => {
        const { seq, code } = m || {};
        const materialCode = seq ? getUniqueEbomMaterialCode(code, seq) : code;
        return { ...m, materialCode, preSelection: true, ebomMaterialSeq: seq };
      });
    this.setDataSource(needWeighing);
    this.setState({
      ebomId,
    });
  };

  handleWeighingModeChange = (v, key) => {
    if (v === WEIGHING_MODE_CUSTOM) {
      this.props.form.resetFields([
        `weighingObjects[${key}].perSegmentWeight`,
        `weighingObjects[${key}].segmentUpperLimit`,
        `weighingObjects[${key}].segmentLowerLimit`,
      ]);
    }
  };

  getColumns = () => {
    const {
      form: { getFieldDecorator, getFieldValue },
      inEdit,
    } = this.props;

    return [
      {
        title: '称量顺序',
        key: 'ebomMaterialSeq',
        dataIndex: 'ebomMaterialSeq',
        fixed: 'left',
        width: 80,
        render: (data, { key }, i) => {
          return (
            <React.Fragment>
              <FormItem style={TableFormItemStyle}>
                <span className="ant-form-text">{i + 1}</span>
              </FormItem>
              <FormItem style={{ display: 'none' }}>
                {getFieldDecorator(`weighingObjects[${key}].ebomMaterialSeq`, {
                  initialValue: data,
                })(<Input />)}
              </FormItem>
            </React.Fragment>
          );
        },
      },
      {
        title: '物料编号 | 物料名称',
        key: 'materialCode',
        dataIndex: 'materialCode',
        fixed: 'left',
        width: 220,
        render: (data, { key, preSelection }, i) => {
          return (
            <FormItem style={TableFormItemStyle}>
              {getFieldDecorator(`weighingObjects[${key}].materialCode`, {
                initialValue: data,
                rules: [
                  {
                    required: true,
                    message: '物料必填',
                  },
                ],
              })(
                <Select
                  style={{ width: 200 }}
                  placeholder="请选择物料"
                  disabled={preSelection}
                  onChange={(val, option, i) => {
                    const dataSource = this.state.dataSource.map(data => {
                      const seq = _.get(option, 'props.seq', null);
                      if (data.key === key) {
                        return {
                          ...data,
                          materialCode: val,
                          units: _.get(option, 'props.units', null),
                          ebomMaterialSeq: seq,
                        };
                      }
                      return data;
                    });
                    this.setDataSource(dataSource);
                  }}
                >
                  {this.state.ebomMaterials.map(({ seq, code, name, ...rest }, i) => (
                    // 若出现value相同的option，select会默认拿第二个，故先用@分隔
                    <Option
                      seq={seq}
                      value={getUniqueEbomMaterialCode(code, seq)}
                      title={`${code}/${name}`}
                      {...rest}
                    >{`${code}/${name}`}</Option>
                  ))}
                </Select>,
              )}
            </FormItem>
          );
        },
      },
      {
        title: '称量方法',
        key: 'weighingType',
        dataIndex: 'weighingType',
        width: 110,
        render: (data, record, i) => {
          return (
            <FormItem style={TableFormItemStyle}>
              {getFieldDecorator(`weighingObjects[${record.key}].weighingType`, {
                initialValue: data,
                rules: [
                  {
                    required: true,
                    message: '称量方法必填',
                  },
                ],
              })(
                <Select placeholder="称量方法" style={{ width: 100 }}>
                  {Object.keys(WEIGHING_TYPE).map(key => (
                    <Option key={key} value={Number(key)}>
                      {changeChineseToLocaleWithoutIntl(WEIGHING_TYPE[key])}
                    </Option>
                  ))}
                </Select>,
              )}
            </FormItem>
          );
        },
      },
      {
        title: '称量规则',
        key: 'weighingMode',
        dataIndex: 'weighingMode',
        width: 110,
        render: (data, record, i) => {
          return (
            <FormItem style={TableFormItemStyle}>
              {getFieldDecorator(`weighingObjects[${record.key}].weighingMode`, {
                initialValue: data,
                rules: [
                  {
                    required: true,
                    message: '称量规则必填',
                  },
                ],
                onChange: v => this.handleWeighingModeChange(v, record.key),
              })(
                <Select placeholder="称量规则" style={{ width: 100 }}>
                  {Object.keys(weighingModeMap).map(key => (
                    <Option key={key} value={Number(key)}>
                      {changeChineseToLocaleWithoutIntl(weighingModeMap[key])}
                    </Option>
                  ))}
                </Select>,
              )}
            </FormItem>
          );
        },
      },
      {
        title: '细分重量',
        key: 'perSegmentWeight',
        dataIndex: 'perSegmentWeight',
        width: 110,
        render: (data, record, i) => {
          const disabled = getFieldValue(`weighingObjects[${record.key}].weighingMode`) === WEIGHING_MODE_CUSTOM;
          return (
            <FormItem style={TableFormItemStyle}>
              {getFieldDecorator(`weighingObjects[${record.key}].perSegmentWeight`, {
                initialValue: disabled ? 0 : data || 0,
                rules: [
                  {
                    required: !disabled,
                    message: '细分重量必填',
                  },
                ],
                onChange: v => {
                  if (typeof v === 'number' && !inEdit) {
                    const { dataSource } = this.state;
                    const key = _.get(dataSource, `[${i}].key`);
                    const { weighingObjects } = this.props.form.getFieldsValue();
                    const _weighingObjects =
                      weighingObjects &&
                      weighingObjects.map((x, idx) => {
                        if (idx === key) {
                          return {
                            ...x,
                            segmentUpperLimit: null,
                            segmentLowerLimit: null,
                          };
                        }
                        return x;
                      });
                    this.props.form.setFieldsValue({ weighingObjects: _weighingObjects });
                  }
                },
              })(<InputNumber disabled={disabled} style={{ width: 100 }} min={0} placeholder="细分重量" />)}
            </FormItem>
          );
        },
      },
      {
        title: '单位',
        key: 'useUnit',
        dataIndex: 'useUnit',
        width: 110,
        render: (data, { key, units }, i) => {
          return (
            <React.Fragment>
              {Array.isArray(units) ? (
                <FormItem style={TableFormItemStyle}>
                  {getFieldDecorator(`weighingObjects[${key}].useUnit`, {
                    initialValue: data,
                    rules: [
                      {
                        required: true,
                        message: '单位不能为空',
                      },
                    ],
                  })(
                    <Select style={{ width: 100 }}>
                      {units.map(({ unitName, unitId }) => (
                        <Option key={unitId} value={unitId}>
                          {unitName}
                        </Option>
                      ))}
                    </Select>,
                  )}
                </FormItem>
              ) : (
                <FormItem style={TableFormItemStyle}>{replaceSign}</FormItem>
              )}
            </React.Fragment>
          );
        },
      },
      {
        title: '小数位数',
        key: 'reservedBits',
        dataIndex: 'reservedBits',
        width: 110,
        render: (data, record, i) => {
          return (
            <FormItem style={TableFormItemStyle}>
              {getFieldDecorator(`weighingObjects[${record.key}].reservedBits`, {
                initialValue: data,
                rules: [
                  {
                    required: true,
                    message: '小数位数必填',
                  },
                  {
                    validator: (rule, value, cb) => {
                      if (value > 6) cb('小数位数支持0~6');
                      cb();
                    },
                  },
                ],
              })(<InputNumber style={{ width: 100 }} placeholder="小数位数" min={0} step={1} precision={0} />)}
            </FormItem>
          );
        },
      },
      {
        title: '称量效期',
        key: 'period',
        dataIndex: 'period',
        width: 180,
        render: (data, { periodUnit, key }, i) => {
          return (
            <React.Fragment>
              <FormItem style={{ ...TableFormItemStyle, display: 'inline-block', marginRight: 10 }}>
                {getFieldDecorator(`weighingObjects[${key}].period`, {
                  initialValue: data || 0,
                  rules: [
                    {
                      required: true,
                      message: '称量效期必填',
                    },
                  ],
                })(<InputNumber style={{ width: 80 }} placeholder="称量效期" min={0} step={1} precision={0} />)}
              </FormItem>
              <FormItem style={{ ...TableFormItemStyle, display: 'inline-block', marginRight: -10 }}>
                {getFieldDecorator(`weighingObjects[${key}].periodUnit`, {
                  initialValue: periodUnit || '2',
                  rules: [
                    {
                      required: true,
                      message: '效期单位必填',
                    },
                  ],
                })(
                  <Select placeholder="效期单位" style={{ width: 80 }}>
                    {Object.keys(PERIOD_UNIT).map(key => (
                      <Option key={key} value={key}>
                        {changeChineseToLocaleWithoutIntl(PERIOD_UNIT[key])}
                      </Option>
                    ))}
                  </Select>,
                )}
              </FormItem>
            </React.Fragment>
          );
        },
      },
      {
        title: '修改有效期',
        key: 'alterPeriod',
        dataIndex: 'alterPeriod',
        width: 130,
        render: (data, record, i) => {
          return (
            <FormItem style={TableFormItemStyle}>
              {getFieldDecorator(`weighingObjects[${record.key}].alterPeriod`, {
                initialValue: typeof data === 'number' ? data : 0,
              })(
                <Radio.Group style={{ display: 'flex', alignItems: 'center', height: 40 }}>
                  <Radio key="alterPeriod-yes" value={1}>
                    {changeChineseToLocaleWithoutIntl('是')}
                  </Radio>
                  <Radio key="alterPeriod-no" value={0}>
                    {changeChineseToLocaleWithoutIntl('否')}
                  </Radio>
                </Radio.Group>,
              )}
            </FormItem>
          );
        },
      },
      {
        title: '细分上限',
        key: 'segmentUpperLimit',
        dataIndex: 'segmentUpperLimit',
        width: 110,
        render: (data, record, i) => {
          const disabled = getFieldValue(`weighingObjects[${record.key}].weighingMode`) === WEIGHING_MODE_CUSTOM;
          return (
            <FormItem style={TableFormItemStyle}>
              {getFieldDecorator(`weighingObjects[${record.key}].segmentUpperLimit`, {
                initialValue: disabled ? undefined : data || 0,
                rules: [
                  {
                    required: !disabled,
                    message: '细分上限必填',
                  },
                  {
                    validator: (rule, value, cb) => {
                      const decimalPart = value && value.toString().split('.')[1];
                      if (value && decimalPart && decimalPart.length > 6) {
                        cb('最多支持6位小数');
                      }
                      const segmentWeight = this.props.form.getFieldValue(
                        `weighingObjects[${record.key}].perSegmentWeight`,
                      );
                      if (value && segmentWeight === 0 && value !== 0) {
                        cb('细分重量为0，细分上限也为0');
                      }
                      if (value && value >= segmentWeight) {
                        cb('细分上限必须小于细分重量');
                      }
                      cb();
                    },
                  },
                ],
              })(<InputNumber disabled={disabled} style={{ width: 100 }} placeholder="细分上限" min={0} step={1} />)}
            </FormItem>
          );
        },
      },
      {
        title: '细分下限',
        key: 'segmentLowerLimit',
        dataIndex: 'segmentLowerLimit',
        width: 110,
        render: (data, record, i) => {
          const disabled = getFieldValue(`weighingObjects[${record.key}].weighingMode`) === WEIGHING_MODE_CUSTOM;
          return (
            <FormItem style={TableFormItemStyle}>
              {getFieldDecorator(`weighingObjects[${record.key}].segmentLowerLimit`, {
                initialValue: disabled ? undefined : data || 0,
                rules: [
                  {
                    required: !disabled,
                    message: '细分下限必填',
                  },
                  {
                    validator: (rule, value, cb) => {
                      const decimalPart = value && value.toString().split('.')[1];
                      if (value && decimalPart && decimalPart.length > 6) {
                        cb('最多支持6位小数');
                      }
                      const segmentWeight = this.props.form.getFieldValue(
                        `weighingObjects[${record.key}].perSegmentWeight`,
                      );
                      if (value && segmentWeight === 0 && value !== 0) {
                        cb('细分重量为0，细分下限也为0');
                      }
                      if (value && value >= segmentWeight) {
                        cb('细分下限必须小于细分重量');
                      }
                      cb();
                    },
                  },
                ],
              })(<InputNumber disabled={disabled} style={{ width: 100 }} placeholder="细分下限" min={0} step={1} />)}
            </FormItem>
          );
        },
      },
      {
        title: '指令上限',
        key: 'instructionUpperLimit',
        dataIndex: 'instructionUpperLimit',
        width: 150,
        render: (data, record, i) => {
          const { instructionLimitType } = record;
          const disabled = getFieldValue(`weighingObjects[${record.key}].weighingMode`) === WEIGHING_MODE_SEGMENT;

          return (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <FormItem style={TableFormItemStyle}>
                {getFieldDecorator(`weighingObjects[${record.key}].instructionUpperLimit`, {
                  initialValue: disabled ? null : data,
                  rules: [
                    {
                      required: !disabled,
                      message: '指令上限必填',
                    },
                    {
                      validator: (rule, value, cb) => {
                        const decimalPart = value && value.toString().split('.')[1];
                        if (value && decimalPart && decimalPart.length > 6) {
                          cb('最多支持6位小数');
                        }
                        cb();
                      },
                    },
                  ],
                })(
                  <InputNumber
                    style={{ width: 70 }}
                    placeholder={
                      getFieldValue(`weighingObjects[${record.key}].instructionLimitType`) === PERCENTAGE
                        ? '0 ~ 100'
                        : '数字'
                    }
                    disabled={disabled}
                    min={0}
                    step={1}
                  />,
                )}
              </FormItem>
              <FormItem>
                {getFieldDecorator(`weighingObjects[${record.key}].instructionLimitType`, {
                  initialValue: instructionLimitType || PERCENTAGE,
                })(
                  <Select disabled={disabled} style={{ width: 60, marginLeft: 10 }}>
                    {Object.keys(instructionLimitTypeMap).map(key => (
                      <Option value={Number(key)} key={key}>
                        {instructionLimitTypeMap[key]}
                      </Option>
                    ))}
                  </Select>,
                )}
              </FormItem>
            </div>
          );
        },
      },
      {
        title: '指令下限',
        key: 'instructionLowerLimit',
        dataIndex: 'instructionLowerLimit',
        width: 150,
        render: (data, record, i) => {
          const disabled = getFieldValue(`weighingObjects[${record.key}].weighingMode`) === WEIGHING_MODE_SEGMENT;
          const limitType = getFieldValue(`weighingObjects[${record.key}].instructionLimitType`);

          return (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <FormItem style={TableFormItemStyle}>
                {getFieldDecorator(`weighingObjects[${record.key}].instructionLowerLimit`, {
                  initialValue: disabled ? null : data,
                  rules: [
                    {
                      required: !disabled,
                      message: '指令下限必填',
                    },
                    {
                      validator: (rule, value, cb) => {
                        const decimalPart = value && value.toString().split('.')[1];
                        if (value && decimalPart && decimalPart.length > 6) {
                          cb('最多支持6位小数');
                        }
                        cb();
                      },
                    },
                  ],
                })(<InputNumber style={{ width: 70 }} disabled={disabled} placeholder="指令下限" min={0} step={1} />)}
              </FormItem>
              <FormItem>
                <Select value={limitType} disabled style={{ width: 60, marginLeft: 10 }}>
                  {Object.keys(instructionLimitTypeMap).map(key => (
                    <Option value={Number(key)} key={key}>
                      {instructionLimitTypeMap[key]}
                    </Option>
                  ))}
                </Select>
              </FormItem>
            </div>
          );
        },
      },
      {
        title: '先进先出',
        key: 'fifo',
        dataIndex: 'fifo',
        width: 130,
        render: (data, record, i) => {
          return (
            <FormItem style={TableFormItemStyle}>
              {getFieldDecorator(`weighingObjects[${record.key}].fifo`, {
                initialValue: data || 0,
              })(
                <Radio.Group style={{ display: 'flex', alignItems: 'center', height: 40 }}>
                  <Radio value={1}>{changeChineseToLocaleWithoutIntl('是')}</Radio>
                  <Radio value={0}>{changeChineseToLocaleWithoutIntl('否')}</Radio>
                </Radio.Group>,
              )}
            </FormItem>
          );
        },
      },
    ].filter(x => x && !x.hidden);
  };

  setDataSource = weighingObjects => {
    const ebomMaterials = this.state.ebomMaterials.map(m => {
      return {
        ...m,
        disabled: !_.isUndefined(_.find(weighingObjects, o => o.ebomMaterialSeq === m.seq)),
      };
    });
    this.setState({ ebomMaterials }, () => {
      if (Array.isArray(weighingObjects)) {
        // 若dataSource长度为0，则包裹在table中的formItem不会出现在getFieldsValue的结果中
        const dataSource = weighingObjects.map(({ weighingMode, ...rest }, i) => {
          const target = _.find(this.state.ebomMaterials, o => o.seq === rest.ebomMaterialSeq);
          return {
            key: i,
            weighingMode: weighingMode || WEIGHING_MODE_TOTAL,
            units: target ? target.units : [],
            ebomMaterialSeq: target ? target.seq : null,
            ...rest,
          };
        });
        this.setState({ dataSource });
      }
    });
  };

  render() {
    const {
      form: { getFieldDecorator, getFieldValue },
      inEdit,
      form,
    } = this.props;
    const { dataSource, ebomMaterials, initialData } = this.state;
    const { workstationIds, code, productCode, preciseType, ebomVersion } = initialData || {};

    return (
      <div>
        {inEdit ? (
          <FormItem label="定义编码">
            {getFieldDecorator('code', {
              initialValue: code,
            })(<Input style={baseFormItemStyle} disabled={inEdit} />)}
          </FormItem>
        ) : null}
        <FormItem label="成品物料">
          {getFieldDecorator('productCode', {
            initialValue: productCode,
            rules: [
              {
                required: true,
                message: '成品物料必填',
              },
            ],
          })(
            <ProductSelect
              loadOnFocus
              style={baseFormItemStyle}
              onChange={this.onProductMaterialChange}
              disabled={inEdit}
            />,
          )}
        </FormItem>
        <FormItem label="称量工位">
          {getFieldDecorator('workstationIds', {
            initialValue: workstationIds,
            rules: [
              {
                required: true,
                message: '称量工位必填',
              },
              {
                validator: (rules, v, cb) => {
                  if (!arrayIsEmpty(v) && v.length > 20) {
                    cb('最多支持20个称量工位');
                  }
                  cb();
                },
              },
            ],
          })(<WorkstationSelect mode="multiple" placeholder="请选择称量工位" style={baseFormItemStyle} />)}
        </FormItem>
        <div style={{ display: 'flex' }}>
          <FormItem label="物料清单">
            {getFieldDecorator('ebomVersion', {
              initialValue: ebomVersion,
              rules: [
                {
                  required: true,
                  message: '物料清单必填',
                },
              ],
            })(
              <EbomSelect
                placeholder="请选择物料清单版本号"
                params={{ productMaterialCode: _.get(getFieldValue('productCode'), 'key'), status: 1 }}
                style={baseFormItemStyle}
                onChange={this.onEbomVersionChange}
                disabled={!_.get(getFieldValue('productCode'), 'key') || inEdit}
              />,
            )}
          </FormItem>
          <NewTagLink
            href={`/bom/eBom/ebomdetail/${this.state.ebomId}`}
            style={{ display: this.state.ebomId ? 'inline-block' : 'none', marginLeft: 10, marginTop: 10 }}
          >
            查看物料清单
          </NewTagLink>
        </div>
        <FormItem label="数值修约">
          {getFieldDecorator('preciseType', {
            initialValue: preciseType,
            rules: [
              {
                required: true,
                message: '数值修约必填',
              },
            ],
          })(
            <Select placeholder="请选择数值修约" style={baseFormItemStyle}>
              {Object.keys(PRECISE_TYPE).map(key => (
                <Option key={key} value={Number(key)}>
                  {changeChineseToLocaleWithoutIntl(PRECISE_TYPE[key])}
                </Option>
              ))}
            </Select>,
          )}
        </FormItem>
        <FormItem label="称量目标" required>
          <AlterableTable
            style={{ maxWidth: 1000, margin: '0 20px' }}
            fieldName="weighingObjects"
            form={form}
            scroll={{ x: true, y: 400 }}
            columns={this.getColumns()}
            maxNum={ebomMaterials && ebomMaterials.length}
            dataSource={dataSource}
            setDataSource={this.setDataSource}
            pagination={false}
            orderable
          />
        </FormItem>
      </div>
    );
  }
}

export default WeighingDefinitionBaseForm;
