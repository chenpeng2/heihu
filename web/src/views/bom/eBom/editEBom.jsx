import * as React from 'react';
import PropTypes from 'prop-types';
import { Modal } from 'antd';

import {
  Select,
  Form,
  FormItem,
  withForm,
  Input,
  Radio,
  Table,
  InputNumber,
  Link,
  Icon,
  Button,
  message,
  Tooltip,
  Spin,
  SearchSelect,
  Text,
  FormattedMessage,
} from 'src/components';
import { getEbomDetail, updateEbom, getMbomByEbom, stopMbomByEbom } from 'src/services/bom/ebom';
import { amountValidator } from 'src/components/form';
import MaterialSelect from 'src/components/select/materialSelect';
import { Big, isFraction, getFractionCompose } from 'src/utils/number';
import MaterialSelectTable from 'src/containers/eBom/base/materialSelectTable';

import styles from './index.scss';

const RadioGroup = Radio.Group;
const InputWidth = 300;
const Option = Select.Option;

type CreateEBomType = {
  form: any,
  viewer: any,
  match: {
    params: { id: string },
  },
  history: any,
};

type stateType = {
  dataSource: Array<mixed>,
};

class EditEBom extends React.Component<CreateEBomType, stateType> {
  state = {
    dataSource: [{ key: 0 }],
    visible: false,
    mboms: [],
  };

  componentDidMount() {
    this.setInitDataSource();
  }

  setInitDataSource = async () => {
    const {
      match: {
        params: { id },
      },
    } = this.props;
    const {
      data: { data },
    } = await getEbomDetail(id);
    const {
      form: { setFieldsValue },
    } = this.props;
    const {
      rawMaterialList,
      productMaterialCode,
      productMaterialName,
      status,
      version,
      defNum,
      currentUnitId,
      unitId,
      unit,
      unitConversions,
      processRoutingCode,
      processRoutingName,
    } = data;
    const { name: unitName } = unit || {};
    const unitSelections = [{ id: unitId, name: unitName }].concat(
      (unitConversions || []).map(({ slaveUnitId, slaveUnitName }) => ({
        id: slaveUnitId,
        name: slaveUnitName,
      })),
    );
    this.setState({ dataSource: rawMaterialList.map((node, index) => ({ key: index })) }, () => {
      const raw = rawMaterialList.map(
        ({ seq, amountFraction, currentUnitId, material, amount, lossRate, regulatoryControl, weight }) => {
          const { unitId, unitName, unitConversions } = material;
          const unitSelections = [{ id: unitId, name: unitName }].concat(
            (unitConversions || []).map(({ slaveUnitId, slaveUnitName }) => ({
              id: slaveUnitId,
              name: slaveUnitName,
            })),
          );
          const x = new Big(lossRate || 0);
          const _lossRate = x.times(100).valueOf();

          // 处理分数和小数的区别
          let _amount = amount;
          if (amountFraction && amountFraction.numerator && amountFraction.denominator) {
            const { numerator, denominator } = amountFraction || {};
            _amount = `${numerator}/${denominator}`;
          }

          return {
            materialCode: {
              key: JSON.stringify({
                id: material.code,
                code: material.code,
              }),
              label: `${material.code}/${material.name}`,
            },
            unitSelections,
            currentUnitId: currentUnitId || unitId,
            amount: _amount,
            lossRate: _lossRate,
            regulatoryControl,
            weight: weight || false, // 历史数据为false
            seq,
          };
        },
      );
      setFieldsValue({
        productMaterialCode: {
          key: JSON.stringify({ code: productMaterialCode, name: productMaterialName }),
          label: `${productMaterialCode}/${productMaterialName}`,
        },
        defNum,
        status,
        version,
        unitSelections,
        currentUnitId: currentUnitId || unitId,
        rawMaterialList: raw,
        processRoutingCode: processRoutingCode && {
          key: processRoutingCode,
          label: `${processRoutingCode}/${processRoutingName}`,
        },
      });
    });
  };

  submit() {
    const {
      form,
      history,
      match: {
        params: { id },
      },
    } = this.props;
    form.validateFieldsAndScroll((err, value) => {
      if (!err) {
        const { unitConversions, processRoutingCode, ...rest } = value;
        const submitValue = {
          ...rest,
          processRoutingCode: processRoutingCode && processRoutingCode.key,
          productMaterialCode: MaterialSelect.convert(value.productMaterialCode).code,
          rawMaterialList: value.rawMaterialList
            .filter(i => i && i.materialCode)
            .map(material => {
              const { materialCode, amount, unitSelections, ...rest } = material || {};

              const _material = materialCode ? MaterialSelect.convert(materialCode) : null;
              const res = {
                ...rest,
                amount,
                materialCode: _material ? _material.code : null,
              };

              if (isFraction(amount)) {
                const fractionCompose = getFractionCompose(amount);
                delete res.amount;
                return {
                  ...res,
                  amountFraction: fractionCompose,
                };
              }

              return res;
            })
            .filter(i => i),
        };
        updateEbom(id, submitValue).then(() => {
          if (sensors) {
            sensors.track('web_bom_ebom_edit', {});
          }
          message.success('编辑成功');
          getMbomByEbom(id).then(({ data: { data } }) => {
            if (data.length > 0) {
              this.setState({ mboms: data, visible: true });
              this.renderSaveModal();
            } else {
              history.push(`/bom/eBom/ebomdetail/${id}`);
            }
          });
        });
      }
    });
  }

  disableSelect = data => {
    const { productMaterialCode } = data;
    const arr = [];
    if (productMaterialCode) {
      arr.push(productMaterialCode.key);
    }
    return arr;
  };

  renderSaveModal() {
    const { visible, mboms } = this.state;
    const {
      match: {
        params: { id },
      },
      history: { push },
    } = this.props;
    const columns = [
      {
        title: '成品编号/名称',
        key: 'materialCode',
        dataIndex: 'materialCode',
        render: (materialCode, { materialName }) => <Tooltip text={`${materialCode}/${materialName}`} length={30} />,
      },
      { title: '版本号', key: 'version', dataIndex: 'version', maxWidth: { C: 4 } },
    ];
    return (
      <Modal
        closable={false}
        visible={visible}
        onCancel={() => this.setState({ visible: false })}
        width={580}
        footer={null}
      >
        <div className={styles.tips}>
          <Icon type="check-circle" className={styles.icon} />
          <div className={styles.msg}>
            <div className={styles.save}>
              <FormattedMessage defaultMessage={'保存成功！'} />
            </div>
            <p>
              <FormattedMessage
                defaultMessage={'以下{number}个生产BOM同步该物料清单最新信息'}
                values={{ number: mboms.length }}
              />
            </p>
          </div>
        </div>
        <Table
          columns={columns}
          style={{ margin: 0 }}
          tableStyle={{ minWidth: 'auto' }}
          pagination={false}
          dataSource={mboms}
          locale={{ emptyText: '' }}
        />
        <div className={styles.modalFooter}>
          <Button
            style={{ width: 114 }}
            onClick={() => {
              push(`/bom/eBom/ebomdetail/${id}`);
            }}
          >
            确认
          </Button>
        </div>
      </Modal>
    );
  }

  render() {
    const { form } = this.props;
    const { dataSource } = this.state;
    const { getFieldDecorator, getFieldsValue, setFields, getFieldValue } = form;
    const { changeChineseToLocale } = this.context;
    getFieldDecorator('unitSelections', {
      initialValue: [],
    });
    const unitSelections = getFieldValue('unitSelections');

    return (
      <Spin spinning={false}>
        <div className={styles.createEBom}>
          <div className={styles.title}>{changeChineseToLocale('编辑物料清单')}</div>
          <div className={styles.container}>
            <Form>
              <FormItem label="成品物料编号/名称">
                {getFieldDecorator('productMaterialCode', {
                  rules: [{ required: true, message: '成品物料编号/名称为必填' }],
                })(
                  <MaterialSelect
                    disabled
                    disabledValues={this.disableSelect(getFieldsValue())}
                    style={{ width: InputWidth }}
                    onChange={value => {
                      if (!value) {
                        setFields({
                          currentUnitId: {
                            value: undefined,
                          },
                          unitSelections: {
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
                        currentUnitId: {
                          value: unitId,
                        },
                        unitSelections: {
                          value: unitSelections,
                        },
                      });
                    }}
                  />,
                )}
              </FormItem>
              <FormItem label="数量">
                {getFieldDecorator('defNum', {
                  initialValue: 1,
                  rules: [
                    { required: true, message: '量不能为空' },
                    { validator: amountValidator(1e6, { value: 0, equal: false, message: '数量必须大于0' }) },
                  ],
                })(<InputNumber />)}
              </FormItem>
              <FormItem label="单位">
                {getFieldDecorator('currentUnitId', {
                  rules: [{ required: true, message: '单位为必填' }],
                })(
                  <Select disabled style={{ width: InputWidth }} placeholder={null}>
                    {unitSelections.map(({ id, name }) => (
                      <Option id={id} value={id}>
                        {name}
                      </Option>
                    ))}
                  </Select>,
                )}
              </FormItem>
              <FormItem label={'状态'}>
                {getFieldDecorator('status', {
                  rules: [{ required: true, message: '状态为必填' }],
                })(
                  <RadioGroup disabled>
                    <Radio value={1}>{changeChineseToLocale('启用中')}</Radio>
                    <Radio value={0}>{changeChineseToLocale('停用中')}</Radio>
                  </RadioGroup>,
                )}
              </FormItem>
              <FormItem label={'版本号'}>
                {getFieldDecorator('version', {
                  rules: [{ required: true, message: '版本号为必填' }, { whitespace: true, message: '版本号不能为空' }],
                })(<Input style={{ width: InputWidth }} disabled />)}
              </FormItem>
              <FormItem label="工艺路线">
                {getFieldDecorator('processRoutingCode')(
                  <SearchSelect type="processRouting" params={{ status: 1 }} style={{ width: InputWidth }} />,
                )}
              </FormItem>
              <FormItem label="物料列表">
                <MaterialSelectTable form={form} dataSource={dataSource} />
              </FormItem>
              <FormItem label=" " className={styles.footer}>
                <Button
                  className={styles.cancel}
                  type="ghost"
                  onClick={() => this.context.router.history.push('/bom/eBom')}
                >
                  取消
                </Button>
                <Button type="primary" className={styles.ok} onClick={() => this.submit()}>
                  保存
                </Button>
              </FormItem>
            </Form>
          </div>
          {this.renderSaveModal()}
        </div>
      </Spin>
    );
  }
}

EditEBom.contextTypes = {
  router: PropTypes.object,
  changeChineseToLocale: PropTypes.func,
};

export default withForm({ showFooter: false }, EditEBom);
