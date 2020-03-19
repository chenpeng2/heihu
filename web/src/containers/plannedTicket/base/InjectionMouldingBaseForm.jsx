import React from 'react';
import {
  FormItem,
  SimpleTable,
  SearchSelect,
  Icon,
  Link,
  InputNumber,
  Select,
  Input,
  Form,
  Searchselect,
  Tooltip,
} from 'components';
import { arrayIsEmpty } from 'utils/array';
import SelectWithIntl from 'components/select/selectWithIntl';
import _ from 'lodash';
import { getMboms } from 'services/bom/mbom';
import { amountValidator } from 'components/form';
import { PLAN_TICKET_INJECTION_MOULDING, replaceSign } from 'constants';
import BaitingWorkOrderBaseForm from './baitingWorkOrderBaseForm';

const Option = Select.Option;
const width = 300;

export const formatInjectionMouldingSubmitValue = value => {
  const {
    planners,
    managers,
    purchaseOrder,
    attachments: files,
    outMaterials,
    customFields,
    toolCode,
    ...rest
  } = value;
  const attachments = files && files.filter(n => n).map(({ id }) => id);
  const purchaseOrderCode = purchaseOrder && purchaseOrder.key;
  const plannerId = planners && planners.map(({ key }) => key);
  const managerId = managers && managers.map(({ key }) => key);

  return {
    ...rest,
    purchaseOrderCode,
    plannerId,
    managerId,
    attachments,
    toolCode: toolCode && toolCode.key,
    customFields: customFields
      ? _.map(customFields, (value, key) => ({
          name: key,
          content: value,
        }))
      : undefined,
    ...rest,
    outMaterials: outMaterials
      .filter(n => n)
      .map(node => ({
        ...node,
        code: node.code.key,
      })),
  };
};

class InjectionMouldingBaseForm extends React.PureComponent {
  state = {
    dataSource: [{ key: 0 }],
  };

  componentWillReceiveProps(nextProps) {
    if (!_.isEqual(this.props.dataSource, nextProps.dataSource)) {
      this.setState({ dataSource: nextProps.dataSource });
    }
  }

  onChangeForTooling = (value = {}, callback) => {
    const { form } = this.props;
    const { dataSource, materialOptions } = value;
    form.resetFields('outMaterials');
    this.setState({ dataSource, materialOptions }, callback);
  };

  render() {
    const {
      form: { getFieldDecorator, getFieldValue, resetFields, setFields },
      editing,
      disabledList,
    } = this.props;
    const { changeChineseToLocale } = this.context;
    const { dataSource, materialOptions, showPurchaseOrderSelect, listData, bindEBomToProcessRouting } = this.state;
    const columns = [
      {
        title: '序号',
        key: 'no',
        dataIndex: 'key',
        width: 60,
        render: (key, record, index) => (
          <span>
            {dataSource.length > 2 && (
              <Icon
                type="minus-circle"
                style={{ marginRight: 10, cursor: 'pointer' }}
                onClick={() => {
                  this.setState({
                    dataSource: dataSource.filter(k => k.key !== key),
                  });
                }}
              />
            )}
            {index + 1}
          </span>
        ),
      },
      {
        title: '物料编码/物料名称',
        key: 'code',
        dataIndex: 'key',
        render: (key, record) => {
          const currentMaterialCode = getFieldValue(`outMaterials[${key}].code`);
          const materialCodes = getFieldValue('outMaterials')
            .filter(e => e)
            .map(e => e.code);
          const disabledOptions = currentMaterialCode
            ? _.filter(materialCodes, e => e && e.key !== currentMaterialCode.key).map(e => e.key)
            : [];
          return (
            <FormItem>
              {getFieldDecorator(`outMaterials[${key}].code`, {
                rules: [{ required: true, message: '物料必填' }],
                onChange: async (value, option) => {
                  resetFields([`outMaterials[${key}].mbomVersion`]);
                  if (!value) {
                    return;
                  }
                  const {
                    data: { data: mboms },
                  } = await getMboms({ materialCode: value.key, status: 1 });
                  const { desc, unitName } = option.props.data;
                  this.setState(
                    {
                      dataSource: dataSource.map(node => {
                        if (node.key === key) {
                          return { ...node, desc, unitName, mboms };
                        }
                        return node;
                      }),
                    },
                    () => {
                      if (mboms.length === 1) {
                        setFields({
                          [`outMaterials[${key}].mbomVersion`]: { value: mboms[0].version },
                        });
                      }
                    },
                  );
                },
              })(
                arrayIsEmpty(materialOptions) ? (
                  <SearchSelect allowClear disabled={editing} type="materialBySearch" />
                ) : (
                  <Select style={{ width: 120 }} allowClear labelInValue>
                    {materialOptions.map(o => (
                      <Option disabled={disabledOptions.find(e => e === o.code)} value={o.code}>
                        {o.code}/{o.name}
                      </Option>
                    ))}
                  </Select>
                ),
              )}
            </FormItem>
          );
        },
      },
      {
        title: '规格',
        key: 'desc',
        dataIndex: 'desc',
        render: desc => (desc ? <Tooltip length={7} text={desc} /> : replaceSign),
      },
      { title: '单位', key: 'unit', dataIndex: 'unitName', render: unitName => unitName || replaceSign },
      {
        title: '总数量',
        key: 'totalAmount',
        dataIndex: 'key',
        render: key => (
          <FormItem>
            {getFieldDecorator(`outMaterials[${key}].totalAmount`, {
              rules: [
                { required: true, message: '总数量必填' },
                {
                  validator: amountValidator(
                    { value: 1e9, message: '数量必须小于1000000000' },
                    {
                      value: 0,
                      message: '数量必须大于0',
                      equal: false,
                    },
                    undefined,
                    6,
                  ),
                },
              ],
            })(<InputNumber disabled />)}
          </FormItem>
        ),
      },
      {
        title: (
          <div>
            <span style={{ marginRight: 5 }}>{changeChineseToLocale('单模产出数量')}</span>
            <Tooltip.AntTooltip
              title={changeChineseToLocale('指模具一次成型可产出的物料数量。所有产出物料(总数量/单模产出数量)比值相等')}
            >
              <Icon type="exclamation-circle-o" style={{ opacity: 0.4 }} />
            </Tooltip.AntTooltip>
          </div>
        ),
        key: 'perAmount',
        dataIndex: 'key',
        render: (key, record) => (
          <FormItem>
            {getFieldDecorator(`outMaterials[${key}].perAmount`, {
              rules: [
                { required: true, message: '单模数量必填' },
                {
                  validator: amountValidator(
                    record.maxPerAmount
                      ? {
                          value: record.maxPerAmount,
                          message: '单模产出数量不可大于模具处维护的“产出数量”',
                          equal: true,
                        }
                      : {
                          value: 1e8,
                          message: `数量必须小于${1e8}`,
                          equal: false,
                        },
                    {
                      value: 0,
                      message: '数量必须大于0',
                      equal: false,
                    },
                    undefined,
                    6,
                  ),
                },
              ],
              onChange: value => {
                const outAmount = getFieldValue('outAmount');
                setFields({ [`outMaterials[${key}].totalAmount`]: { value: outAmount * value || undefined } });
              },
            })(<InputNumber disabled={editing} />)}
          </FormItem>
        ),
      },
      {
        title: (
          <div>
            <span style={{ marginRight: 5 }}>{changeChineseToLocale('工艺')}</span>
            <Tooltip.AntTooltip
              title={changeChineseToLocale(
                '工艺仅支持选择生产BOM。所有物料所选生产BOM的工艺路线（工艺路线编号）、准备时间需一致，最后一道工序的工位（工位编号）需一致。所有工序的「单次扫码」必须为「否」',
              )}
            >
              <Icon type="exclamation-circle-o" style={{ opacity: 0.4 }} />
            </Tooltip.AntTooltip>
          </div>
        ),
        key: 'mbom',
        dataIndex: 'key',
        render: (key, record) => {
          return (
            <div style={{ display: 'flex' }}>
              <FormItem>
                <SelectWithIntl value="生产BOM" disabled style={{ width: 100, marginRight: 6 }} />
                {getFieldDecorator(`outMaterials[${key}].mbomVersion`, {
                  rules: [{ required: true, message: '工艺必填' }],
                })(
                  <Select style={{ width: 120 }} placeholder="生产BOM版本号" disabled={editing}>
                    {record.mboms &&
                      record.mboms
                        .filter(({ status }) => status === 1)
                        .map(({ version }) => <Option value={version}>{version}</Option>)}
                  </Select>,
                )}
              </FormItem>
            </div>
          );
        },
      },
    ];

    const outputMaterialsFormItem = (
      <FormItem label="产出物料">
        <SimpleTable
          style={{ width: 850, margin: 0 }}
          columns={columns}
          dataSource={dataSource}
          pagination={false}
          footer={() => (
            <Link
              disabled={editing}
              icon="plus-circle-o"
              onClick={() => {
                this.setState({
                  dataSource: arrayIsEmpty(dataSource)
                    ? [{ key: 0 }]
                    : [...dataSource, { key: dataSource[dataSource.length - 1].key + 1 }],
                });
              }}
            >
              添加一行
            </Link>
          )}
        />
      </FormItem>
    );

    return (
      <div>
        <BaitingWorkOrderBaseForm
          data={this.props.data}
          disabledList={{
            purchaseOrder: editing,
          }}
          onChangeForTooling={this.onChangeForTooling}
          type={'inject'}
          editing={editing}
          outputMaterialsFormItem={outputMaterialsFormItem}
          form={this.props.form}
          inputMaterialsFormItem={<div />}
          processRoutingFormItem={<div />}
          category={PLAN_TICKET_INJECTION_MOULDING}
        />
      </div>
    );
  }
}
InjectionMouldingBaseForm.contextTypes = {
  changeChineseToLocale: () => {},
};

export default InjectionMouldingBaseForm;
