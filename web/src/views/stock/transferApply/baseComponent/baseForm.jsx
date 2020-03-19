import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import {
  Row,
  Col,
  TimePicker,
  DatePicker,
  Textarea,
  Input,
  withForm,
  FormItem,
  Form,
  SingleStorageSelect,
} from 'src/components/index';
import { lengthValidate, requiredRule } from 'src/components/form/index';
import SearchSelect from 'src/components/select/searchSelect';
import moment from 'src/utils/time';
import { getTransferApplyCode } from 'src/services/cooperate/materialRequest';
import SearchSelectForMoveTransactions from 'src/containers/moveTransactions/searchSelectForMoveTransactions';
import { TRANS_TYPE } from 'src/services/knowledgeBase/moveTransactions';
import { replaceSign } from 'src/constants';

import {
  codeFormatValidate,
  getTransferApplyMoveTransactionValueInLocalStorage,
  saveTransferApplyMoveTransactionValueInLocalStorage,
  isTransferApplyConnectWithMoveTransaction,
  findTransferApplySourceType,
} from '../util';
import MaterialList from './materialListForm';

const INPUT_WIDTH = 300;

class BaseForm extends Component {
  state = {
    code: null,
    sourceWarehouse: null,
  };

  componentDidMount() {
    if (this.props.type === 'create') this.getAndSetCodeForTransferApply();
  }

  componentDidUpdate(preProps) {
    if (!_.isEqual(preProps.initialData, this.props.initialData)) {
      this.setEditInitialValue(this.props);
    }
  }

  setEditInitialValue = props => {
    const { type, form, initialData } = props || this.props;
    if (type === 'edit' && initialData) {
      const { sourceWarehouse } = initialData || {};
      this.setState({ sourceWarehouse }, () => {
        form.setFieldsValue(initialData);
      });
    }
  };

  getAndSetCodeForTransferApply = async () => {
    const res = await getTransferApplyCode();
    const code = _.get(res, 'data.data');
    this.setState({ code });
  };

  getPayload = () => {
    const { form } = this.props;

    let res = null;
    form.validateFieldsAndScroll((err, val) => {
      if (!err) {
        res = val;
      }
    });

    // 将转移申请的移动事务保存在本地
    if (res) {
      saveTransferApplyMoveTransactionValueInLocalStorage(res && res.transferBusiness);
    }

    return res;
  };

  clearForm = () => {
    const { form } = this.props;
    form.resetFields();
    // 将来源仓库置空
    this.setState({ sourceWarehouse: null }, () => {
      // 将materialList表格重置
      if (this.materialListFormInst) {
        const resetForm = _.get(this.materialListFormInst, 'resetForm');
        if (typeof resetForm === 'function') resetForm();
      }
    });

    // 持续创建需要将code刷新
    this.getAndSetCodeForTransferApply();
  };

  render() {
    const { code, sourceWarehouse } = this.state;
    const { changeChineseToLocale } = this.context;

    const { form, style, initialData, type } = this.props;
    const { getFieldDecorator } = form || {};

    const { sourceId, sourceType } = initialData || {};
    const { name: typeName } = findTransferApplySourceType(sourceType) || {};

    return (
      <div style={style}>
        <Form>
          <FormItem label={'编号'}>
            {getFieldDecorator('code', {
              rules: [
                requiredRule('编号'),
                {
                  validator: codeFormatValidate,
                },
                {
                  validator: lengthValidate(null, 20),
                },
              ],
              initialValue: code || undefined,
            })(<Input disabled={type === 'edit'} style={{ width: INPUT_WIDTH }} />)}
          </FormItem>
          {isTransferApplyConnectWithMoveTransaction() ? (
            <FormItem label={'移动事务'}>
              {getFieldDecorator('transferBusiness', {
                rules: [{ required: true, message: '移动事务必填' }],
                initialValue: getTransferApplyMoveTransactionValueInLocalStorage() || undefined,
              })(
                <SearchSelectForMoveTransactions
                  params={{ enable: 1 }}
                  style={{ width: INPUT_WIDTH }}
                  type={TRANS_TYPE.transferApply.value}
                />,
              )}
            </FormItem>
          ) : null}
          <FormItem label={'发出仓库'}>
            {getFieldDecorator('sourceWarehouse', {
              rules: [
                {
                  required: true,
                  message: '发出仓库必填',
                },
              ],
              onChange: value => {
                this.setState({
                  sourceWarehouse: value,
                });
              },
            })(<SearchSelect params={{ status: 1 }} type={'wareHouseWithCode'} style={{ width: INPUT_WIDTH }} />)}
          </FormItem>
          <FormItem label={'目标仓位'}>
            {getFieldDecorator('targetStorage', {
              rules: [
                {
                  required: true,
                  message: '目标仓位必填',
                },
              ],
            })(<SingleStorageSelect cascaderStyle={{ verticalAlign: 'top' }} style={{ width: INPUT_WIDTH }} />)}
          </FormItem>
          <Row>
            <Col>
              <FormItem label={'需求时间'}>
                {getFieldDecorator('requireTime', {
                  initialValue: moment(),
                  rules: [
                    {
                      required: true,
                      message: '需求时间必填',
                    },
                  ],
                })(<DatePicker style={{ width: INPUT_WIDTH - 110 }} />)}
              </FormItem>
            </Col>
            <Col>
              <FormItem>
                {getFieldDecorator('timeDetail', {
                  initialValue: moment(),
                })(<TimePicker format={'HH:mm'} style={{ width: 100, marginLeft: 10 }} />)}
              </FormItem>
            </Col>
          </Row>
          <FormItem
            label={
              <span>
                <span
                  style={{
                    color: '#F5222D',
                    textAlign: 'right',
                    verticalAlign: 'sub',
                    fontSize: 14,
                    marginRight: 5,
                  }}
                >
                  {'*'}
                </span>
                <span>{changeChineseToLocale('物料列表')}</span>
              </span>
            }
          >
            <MaterialList
              ref={inst => (this.materialListFormInst = inst)}
              type={type}
              initialData={initialData ? initialData.materialList : null}
              sourceWarehouse={sourceWarehouse}
              form={form}
            />
          </FormItem>
          {type === 'edit' ? (
            <div>
              <FormItem label={'来源类型'}>{typeName || replaceSign}</FormItem>
              <FormItem label={'来源内容'}>{sourceId || replaceSign}</FormItem>
            </div>
          ) : null}
          <FormItem label={'备注'}>
            {getFieldDecorator('remark', {
              rules: [
                {
                  validator: lengthValidate(null, 50),
                },
              ],
            })(<Textarea maxLength={50} style={{ height: 100, width: INPUT_WIDTH }} />)}
          </FormItem>
        </Form>
      </div>
    );
  }
}

BaseForm.propTypes = {
  style: PropTypes.object,
  form: PropTypes.any,
  type: PropTypes.string,
  initialData: PropTypes.any,
};

BaseForm.contextTypes = {
  changeChineseToLocale: PropTypes.any,
};

// 将baseForm的数据format为后端提交的时候需要的格式
export const formatBaseFormValueForSubmit = data => {
  if (!data) return null;
  const { transferBusiness, code, remark, timeDetail, requireTime, targetStorage, sourceWarehouse, materialList } =
    data || {};

  let time;
  if (requireTime && timeDetail) {
    time = `${requireTime.format('YYYY/MM/DD')} ${timeDetail.format('HH:mm')}`;
  }
  if (requireTime && !timeDetail) {
    time = requireTime.format('YYYY/MM/DD');
  }

  return {
    header: {
      code,
      remark,
      targetStorageId: targetStorage && targetStorage.split(',')[0],
      sourceWarehouseCode: sourceWarehouse && sourceWarehouse.key,
      requireTime: time ? Number(moment(time).format('x')) : null,
      transactionCode: transferBusiness ? transferBusiness.key : null,
    },
    items: Array.isArray(materialList)
      ? materialList
          .filter(i => i)
          .map((i, index) => {
            const { material, unit, ...rest } = i || {};
            return {
              materialCode: material && material.key,
              unitId: unit && unit.key,
              ...rest,
              lineId: index + 1, // lineId需要顺序保存。没有实际用处。在此处用index代替
            };
          })
      : [],
  };
};

export default withForm({}, BaseForm);
