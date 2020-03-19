import * as React from 'react';
import PropTypes from 'prop-types';
import {
  Select,
  InputNumber,
  Form,
  FormItem,
  withForm,
  Input,
  Radio,
  Button,
  message,
  Spin,
  FormattedMessage,
  SearchSelect,
} from 'src/components';
import { amountValidator, requiredRule, checkTwoSidesTrim } from 'components/form';
import { addEbom } from 'src/services/bom/ebom';
import { lengthValidate } from 'src/components/form';
import MaterialSelect from 'src/components/select/materialSelect';
import { isFraction, getFractionCompose } from 'src/utils/number';
import MaterialSelectTable from 'src/containers/eBom/base/materialSelectTable';
import { arrayIsEmpty } from 'src/utils/array';
import styles from './index.scss';
import { setEbomVersionInLocalStorage, getEbomVersionInLocalStorage } from './utils';

const Option = Select.Option;
const RadioGroup = Radio.Group;
const InputWidth = 300;

type CreateEBomType = {
  form: any,
  viewer: any,
  params: { id: string },
  router: any,
  match: any,
};

type stateType = {
  dataSource: Array<mixed>,
};

class AddEbom extends React.Component<CreateEBomType, stateType> {
  state = {
    dataSource: [{ key: 0 }],
    OrganizationWeighingConfig: false, // 启用称量管理模块
  };

  submit() {
    const { form } = this.props;
    const { router } = this.context;
    form.validateFieldsAndScroll((err, value) => {
      if (!err) {
        const { unitSelections, processRoutingCode, ...rest } = value;
        const submitValue = {
          ...rest,
          processRoutingCode: processRoutingCode && processRoutingCode.key,
          productMaterialCode: MaterialSelect.convert(value.productMaterialCode).code,
          productMaterialName: MaterialSelect.convert(value.productMaterialCode).name,
          rawMaterialList: value.rawMaterialList
            .map(material => {
              const { materialCode, amount, unitSelections, ...rest } = material || {};
              if (!materialCode) {
                return false;
              }
              const res = {
                ...rest,
                amount,
                materialCode: MaterialSelect.convert(materialCode).code,
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
        addEbom(submitValue).then(({ data: { data: { id } } }) => {
          if (sensors) {
            sensors.track('web_bom_ebom_create', {
              CreateMode: '手动创建',
              amount: 1,
            });
          }
          message.success('添加成功');
          setEbomVersionInLocalStorage(submitValue ? submitValue.version : null);
          router.history.push(`/bom/eBom/ebomdetail/${id}`);
        });
      }
    });
  }

  disableSelect = data => {
    const { rawMaterialList } = data;
    const arr = [];
    if (!arrayIsEmpty(rawMaterialList)) {
      rawMaterialList.forEach(i => {
        const { materialCode } = i || {};
        if (materialCode) arr.push(materialCode.key);
      });
    }
    return arr;
  };

  render() {
    const { form } = this.props;
    const { dataSource } = this.state;
    const { getFieldDecorator, getFieldsValue, setFields, getFieldValue } = form;

    getFieldDecorator('unitSelections', {
      initialValue: [],
    });
    const unitSelections = getFieldValue('unitSelections');
    return (
      <Spin spinning={false}>
        <div className={styles.createEBom}>
          <div className={styles.title}>
            <FormattedMessage defaultMessage={'创建物料清单'} />
          </div>
          <div className={styles.container}>
            <Form>
              <FormItem label="成品物料编号/名称">
                {getFieldDecorator('productMaterialCode', {
                  rules: [requiredRule('成品物料编号/名称')],
                })(
                  <MaterialSelect
                    params={{ status: 1 }}
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
                    requiredRule('数量'),
                    { validator: amountValidator(1e6, { value: 0, equal: false, message: '数量必须大于0' }) },
                  ],
                })(<InputNumber />)}
              </FormItem>
              <FormItem label="单位">
                {getFieldDecorator('currentUnitId', {
                  rules: [requiredRule('单位')],
                })(
                  <Select style={{ width: InputWidth }} placeholder={null}>
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
                  rules: [requiredRule('状态')],
                  initialValue: 1,
                })(
                  <RadioGroup>
                    <Radio value={1}>
                      <FormattedMessage defaultMessage={'启用中'} />
                    </Radio>
                    <Radio value={0}>
                      <FormattedMessage defaultMessage={'停用中'} />
                    </Radio>
                  </RadioGroup>,
                )}
              </FormItem>
              <FormItem label={'版本号'}>
                {getFieldDecorator('version', {
                  rules: [
                    requiredRule('版本号'),
                    { whitespace: true, message: <FormattedMessage defaultMessage={'版本号不能为空'} /> },
                    { validator: lengthValidate(null, 10) },
                    { validator: checkTwoSidesTrim('版本号') },
                  ],
                  initialValue: getEbomVersionInLocalStorage(),
                })(<Input style={{ width: InputWidth }} />)}
              </FormItem>
              <FormItem label="工艺路线">
                {getFieldDecorator('processRoutingCode')(
                  <SearchSelect type="processRouting" params={{ status: 1 }} style={{ width: InputWidth }} />,
                )}
              </FormItem>
              <FormItem label="物料列表">
                <MaterialSelectTable form={form} dataSource={dataSource} />
              </FormItem>
              <FormItem label=" ">
                <div className={styles.footer}>
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
                </div>
              </FormItem>
            </Form>
          </div>
        </div>
      </Spin>
    );
  }
}

AddEbom.contextTypes = {
  router: PropTypes.object,
};

export default withForm({ showFooter: false }, AddEbom);
