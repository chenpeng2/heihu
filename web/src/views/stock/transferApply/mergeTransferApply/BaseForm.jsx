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
  FormattedMessage,
} from 'src/components/index';
import { lengthValidate } from 'src/components/form/index';
import SearchSelect from 'src/components/select/searchSelect';
import moment from 'src/utils/time';
import { getTransferApplyCode, getTransferApplyDetail } from 'src/services/cooperate/materialRequest';
import { arrayIsEmpty } from 'src/utils/array';
import { primary } from 'src/styles/color';
import SearchSelectForMoveTransactions from 'src/containers/moveTransactions/searchSelectForMoveTransactions';
import { TRANS_TYPE } from 'src/services/knowledgeBase/moveTransactions';

import {
  getTransferApplyMoveTransactionValueInLocalStorage,
  saveTransferApplyMoveTransactionValueInLocalStorage,
  isTransferApplyConnectWithMoveTransaction,
  codeFormatValidate,
  formatDataForMerge,
  getMergedTransferApplyDetailsByIds,
} from '../util';
import MaterialList from './MaterialListForm';
import TransferApplySelectForMerge from './TransferApplySelectForMerge.jsx';

const INPUT_WIDTH = 300;

class BaseForm extends Component {
  state = {
    code: null,
    sourceWarehouse: null,
    detailData: null,
  };

  componentDidMount() {
    const { listData } = this.props;
    this.getAndSetCodeForTransferApply();
    this.setInitialValue(listData);
  }

  componentWillReceiveProps(nextProps) {
    if (!_.isEqual(nextProps.listData, this.props.listData)) {
      this.setInitialValue(nextProps.listData);
    }
  }

  setInitialValue = transferApplys => {
    if (arrayIsEmpty(transferApplys)) return;
    const { form } = this.props;

    // 根据id拉取数据
    Promise.all(
      transferApplys.map(i => {
        const { id } = i || {};
        return getTransferApplyDetail(id).then(res => {
          return _.get(res, 'data.data');
        });
      }),
    ).then(res => {
      // 将多个转移申请的数据进行合并
      // header的合并
      const _data = { header: {}, items: [] };
      if (!arrayIsEmpty(res)) {
        res.forEach(i => {
          const { header, items } = i || {};
          const {
            remark,
            targetStorageCode,
            targetStorageId,
            targetStorageName,
            requireTime,
            sourceWarehouseCode,
            sourceWarehouseName,
            code,
            transactionCode,
            transactionName,
          } = header || {};
          _data.header = {
            transactionCode,
            transactionName,
            requireTimes: (_data.header.requireTimes || []).concat(requireTime),
            remark: _data.header.remark ? `${_data.header.remark},${remark}` : remark,
            sourceWarehouseCode,
            sourceWarehouseName,
            targetStorageCode,
            targetStorageName,
            targetStorageId,
          };
          _data.items = (_data.items || []).concat(
            items.map(i => {
              i.headerCode = code;
              return i;
            }),
          );
        });
      }

      // item根据物料和物料单位合并
      const _items = [];
      _data.items.forEach(i => {
        if (!i) return;
        const { materialCode, unitId, planingAmount, remark, headerCode, materialUnit, lineId } = i || {};
        i.headerCodes = [headerCode];
        i.mergeDetail = `${headerCode}-${lineId}: ${planingAmount} ${materialUnit}`;
        if (_items.length === 0) {
          _items.push(i);
          return;
        }

        const same = _items.find(i => i && i.materialCode === materialCode && i.unitId === unitId);
        if (same) {
          same.planingAmount += planingAmount;
          same.reamrk = `${same.reamrk},${remark}`;
          same.mergeDetail = `${same.mergeDetail}, ${headerCode}-${lineId} : ${planingAmount} ${materialUnit}`; // 合并明细
          same.headerCodes = (same.headerCodes || []).concat([headerCode]);
          return;
        }
        _items.push(i);
      });
      _data.items = _items;

      const dataAfterFormat = formatDataForMerge(_data);
      this.setState({
        detailData: dataAfterFormat,
        sourceWarehouse: dataAfterFormat ? dataAfterFormat.sourceWarehouse : null,
      });
      const { materialList, ...rest } = dataAfterFormat || {};

      // 将requireTimes设置为最小值
      const minRequireTime = arrayIsEmpty(rest.requireTimes) ? moment() : moment(rest.requireTimes.sort()[0]);

      // 合并codes
      const mergedCodes = [];
      if (!arrayIsEmpty(materialList)) {
        materialList.forEach(i => {
          const { headerCodes } = i || {};
          if (!arrayIsEmpty(headerCodes)) {
            headerCodes.forEach(i => {
              // 如果已经被放入mergedCodes中，那么跳过
              const alreadyHas = mergedCodes.find(j => j && j.key === i);
              if (!alreadyHas) mergedCodes.push({ key: i, label: i });
            });
          }
        });
      }

      form.setFieldsValue({
        ...rest,
        requireTime: minRequireTime,
        mergedCodes,
        timeDetail: minRequireTime,
      });
    });
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
    const { code, sourceWarehouse, detailData } = this.state;

    const { form, style, mergedTransferApplyIds, getMergedTransferApplyList } = this.props;
    const { getFieldDecorator } = form || {};

    return (
      <div style={style}>
        <Form>
          <FormItem label={'合并列表'}>
            {getFieldDecorator('mergedCodes', {
              rules: [
                {
                  required: true,
                  message: '合并列表必填',
                },
                {
                  validator: (rule, value, cb) => {
                    if (arrayIsEmpty(value) || value.length < 2) cb('至少选择两个转移申请');
                    cb();
                  },
                },
              ],
              onChange: (value, options) => {
                if (!arrayIsEmpty(options)) {
                  const ids = [];
                  options.forEach(i => {
                    if (i) ids.push(_.get(i, 'props.data.id'));
                  });
                  getMergedTransferApplyList(ids.filter(i => i));
                }
              },
            })(
              <TransferApplySelectForMerge
                mode={'multiple'}
                transferApplyIds={mergedTransferApplyIds}
                style={{ width: INPUT_WIDTH }}
              />,
            )}
          </FormItem>
          <FormItem label={'编号'}>
            {getFieldDecorator('code', {
              rules: [
                {
                  required: true,
                  message: '编号必填',
                },
                {
                  validator: codeFormatValidate,
                },
                {
                  validator: lengthValidate(null, 20),
                },
              ],
              initialValue: code || undefined,
            })(<Input style={{ width: INPUT_WIDTH }} />)}
          </FormItem>
          {isTransferApplyConnectWithMoveTransaction() ? (
            <FormItem label={'移动事务'}>
              {getFieldDecorator('transaction', {
                rules: [{ required: true, message: '移动事务必填' }],
              })(
                <SearchSelectForMoveTransactions
                  disabled
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
            })(
              <SearchSelect
                disabled
                params={{ status: 1 }}
                type={'wareHouseWithCode'}
                style={{ width: INPUT_WIDTH }}
              />,
            )}
          </FormItem>
          <FormItem label={'目标仓位'}>
            {getFieldDecorator('targetStorage', {
              rules: [
                {
                  required: true,
                  message: '目标仓位必填',
                },
              ],
            })(
              <SingleStorageSelect disabled cascaderStyle={{ verticalAlign: 'top' }} style={{ width: INPUT_WIDTH }} />,
            )}
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
            <Col style={{ marginLeft: 10 }}>
              <FormItem>
                <FormattedMessage
                  style={{ color: primary, cursor: 'pointer' }}
                  onClick={() => {
                    const next = !this.state.earlyRequireTime;
                    this.setState(
                      {
                        earlyRequireTime: next,
                      },
                      () => {
                        const { requireTimes } = detailData || {};
                        const _requireTimes = arrayIsEmpty(requireTimes) ? [moment()] : requireTimes.sort();
                        if (next) {
                          form.setFieldsValue({
                            requireTime: moment(_requireTimes[0]),
                            timeDetail: moment(_requireTimes[0]),
                          });
                        } else {
                          form.setFieldsValue({
                            requireTime: moment(_requireTimes[_requireTimes.length - 1]),
                            timeDetail: moment(_requireTimes[_requireTimes.length - 1]),
                          });
                        }
                      },
                    );
                  }}
                  defaultMessage={this.state.earlyRequireTime ? '最早需求时间' : '最晚需求时间'}
                />
              </FormItem>
            </Col>
          </Row>
          <FormItem required label={'物料列表'}>
            <MaterialList
              ref={inst => (this.materialListFormInst = inst)}
              initialData={detailData ? detailData.materialList : null}
              requireTimes={detailData ? detailData.requireTimes : null}
              sourceWarehouse={sourceWarehouse}
              form={form}
            />
          </FormItem>
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
  mergedTransferApplyIds: PropTypes.any,
  listData: PropTypes.any,
  getMergedTransferApplyList: PropTypes.any,
};

BaseForm.contextTypes = {
  changeChineseToLocale: PropTypes.any,
};

// 将baseForm的数据format为后端提交的时候需要的格式
export const formatBaseFormValueForSubmit = data => {
  if (!data) return null;
  const {
    mergedCodes,
    code,
    remark,
    timeDetail,
    requireTime,
    targetStorage,
    sourceWarehouse,
    materialList,
    transaction,
  } = data || {};

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
      transactionCode: transaction ? transaction.key : null,
      sourceRequestCodes: arrayIsEmpty(mergedCodes) ? null : mergedCodes.map(i => i && i.key).filter(i => i),
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
