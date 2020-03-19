// ebom的物料table。用在ebom的创建和编辑
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import { getOrganizationConfigFromLocalStorage, ORGANIZATION_CONFIG } from 'src/utils/organizationConfig';
import { amountValidator, requiredRule } from 'src/components/form';
import styles from 'src/views/bom/eBom/index.scss';
import { Select, FormItem, Input, Radio, Table, InputNumber, Link, Icon, FormattedMessage } from 'src/components';
import MaterialSelect from 'src/components/select/materialSelect';

const Option = Select.Option;
const RadioGroup = Radio.Group;

class MaterialSelectTable extends Component {
  state = {
    dataSource: [],
  };

  componentDidMount() {
    this.setState({
      OrganizationWeighingConfig: this.getOrganizationWeighConfig(),
      dataSource: this.props.dataSource,
    });
  }

  componentWillReceiveProps(nextProps) {
    if (!_.isEqual(nextProps.dataSource, this.props.dataSource)) {
      this.setState({ dataSource: nextProps.dataSource });
    }
  }

  getOrganizationWeighConfig = () => {
    const organizationConfig = getOrganizationConfigFromLocalStorage();
    return organizationConfig[ORGANIZATION_CONFIG.weighing]
      ? organizationConfig[ORGANIZATION_CONFIG.weighing].configValue === 'true'
      : false;
  };

  disableSelect = data => {
    const { productMaterialCode } = data;
    const arr = [];
    if (productMaterialCode) {
      arr.push(productMaterialCode.key);
    }
    return arr;
  };

  getMaterialTableColumns = () => {
    const { form } = this.props;
    const { dataSource, OrganizationWeighingConfig } = this.state;
    const { getFieldDecorator, getFieldsValue, setFields, getFieldValue } = form;

    return [
      {
        title: '序号',
        key: 'seq',
        render: (__, record, index) => {
          return (
            <div>
              {getFieldDecorator(`rawMaterialList[${record.key}].seq`)(
                <span style={{ display: 'block', marginBottom: 10, width: 50 }}>{index + 1}</span>,
              )}
            </div>
          );
        },
      },
      {
        title: '物料编号/名称',
        dataIndex: 'name',
        key: 'name',
        render: (text, record) => (
          <div className={styles.amountCell} style={{ height: 50 }}>
            <Icon
              style={{ display: dataSource && dataSource.length <= 1 ? 'none' : 'flex' }}
              type="minus-circle"
              className={styles.icon}
              onClick={() => {
                this.setState(
                  {
                    dataSource: dataSource ? dataSource.filter(({ key }) => key !== record.key) : [],
                  },
                  () => {
                    this.forceUpdate();
                  },
                );
              }}
            />
            <FormItem>
              {getFieldDecorator(`rawMaterialList[${record.key}].materialCode`, {
                rules: [requiredRule('物料编号/名称')],
              })(
                <MaterialSelect
                  useTooltipOption
                  params={{ status: 1 }}
                  disabledValues={this.disableSelect(getFieldsValue())}
                  onChange={value => {
                    if (!value) {
                      setFields({
                        [`rawMaterialList[${record.key}].unitId`]: {
                          value: undefined,
                        },
                        [`rawMaterialList[${record.key}].unitSelections`]: {
                          value: [],
                        },
                      });
                    }
                    const { material } = value;
                    const { unitId, unitName, unitConversions } = material;
                    const unitSelections = [{ id: unitId, name: unitName }].concat(
                      (unitConversions || []).map(({ slaveUnitId, slaveUnitName }) => ({
                        id: slaveUnitId,
                        name: slaveUnitName,
                      })),
                    );
                    setFields({
                      [`rawMaterialList[${record.key}].currentUnitId`]: {
                        value: unitId,
                      },
                      [`rawMaterialList[${record.key}].unitSelections`]: {
                        value: unitSelections,
                      },
                    });
                  }}
                />,
              )}
            </FormItem>
          </div>
        ),
      },
      {
        title: '单位',
        dataIndex: 'unit',
        key: 'unit',
        render: (text, record) => {
          getFieldDecorator(`rawMaterialList[${record.key}].unitSelections`, {
            initialValue: [],
          });
          const unitSelections = getFieldValue(`rawMaterialList[${record.key}].unitSelections`);
          return (
            <div style={{ height: 50 }}>
              <FormItem>
                {getFieldDecorator(`rawMaterialList[${record.key}].currentUnitId`)(
                  <Select style={{ width: 100 }} placeholder={null}>
                    {unitSelections.map(({ id, name }) => (
                      <Option id={id} value={id}>
                        {name}
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
        title: '数量',
        dataIndex: 'amount',
        key: 'amount',
        render: (text, record) => {
          return (
            <div style={{ height: 50, width: 100 }}>
              <FormItem>
                {getFieldDecorator(`rawMaterialList[${record.key}].amount`, {
                  rules: [requiredRule('数量'), { validator: amountValidator(10e5, null, 'fraction') }],
                })(<Input placeholder={'支持小数和分数'} />)}
              </FormItem>
            </div>
          );
        },
      },
      {
        title: '耗损率(%)',
        dataIndex: 'lossRate',
        key: 'lossRate',
        render: (text, { key }) => (
          <div style={{ height: 50 }}>
            <FormItem>
              {getFieldDecorator(`rawMaterialList[${key}].lossRate`, {
                rules: [
                  requiredRule('耗损率(%)'),
                  {
                    validator: (rule, value, cb) => {
                      if (value >= 100) {
                        cb('耗损率必须小于100');
                      }
                      cb();
                    },
                  },
                  { validator: amountValidator(100, 0) },
                ],
              })(<InputNumber />)}
            </FormItem>
          </div>
        ),
      },
      {
        title: '投料管控',
        dataIndex: 'regulatoryControl',
        key: 'regulatoryControl',
        render: (text, { key }) => (
          <div style={{ height: 50 }}>
            <FormItem>
              {getFieldDecorator(`rawMaterialList[${key}].regulatoryControl`, {
                rules: [requiredRule('投料管控')],
                initialValue: true,
              })(
                <RadioGroup style={{ width: 150 }}>
                  <Radio value>
                    <FormattedMessage defaultMessage={'是'} />
                  </Radio>
                  <Radio value={false}>
                    <FormattedMessage defaultMessage={'否'} />
                  </Radio>
                </RadioGroup>,
              )}
            </FormItem>
          </div>
        ),
      },
      OrganizationWeighingConfig
        ? {
            title: '需要称量',
            dataIndex: 'weighing',
            key: 'weighing',
            render: (text, { key }) => (
              <div style={{ height: 50 }}>
                <FormItem>
                  {getFieldDecorator(`rawMaterialList[${key}].weight`, {
                    rules: [requiredRule('需要称量')],
                    initialValue: false,
                  })(
                    <RadioGroup style={{ width: 150 }}>
                      <Radio value>
                        <FormattedMessage defaultMessage={'是'} />
                      </Radio>
                      <Radio value={false}>
                        <FormattedMessage defaultMessage={'否'} />
                      </Radio>
                    </RadioGroup>,
                  )}
                </FormItem>
              </div>
            ),
          }
        : null,
    ].filter(i => i);
  };

  render() {
    const { dataSource } = this.state;
    const columns = this.getMaterialTableColumns();

    return (
      <div>
        <Table
          pagination={false}
          locale={{
            emptyText: null,
          }}
          dataSource={dataSource}
          style={{ margin: 0, width: 800 }}
          scroll={{ x: 800 }}
          columns={columns}
          footer={() => (
            <Link
              icon="plus-circle-o"
              type="grey"
              onClick={() => {
                this.setState({
                  dataSource: [...dataSource, { key: dataSource[dataSource.length - 1].key + 1 }],
                });
              }}
            >
              添加一行
            </Link>
          )}
        />
      </div>
    );
  }
}

MaterialSelectTable.propTypes = {
  style: PropTypes.object,
  form: PropTypes.any,
  dataSource: PropTypes.any,
};

export default MaterialSelectTable;
