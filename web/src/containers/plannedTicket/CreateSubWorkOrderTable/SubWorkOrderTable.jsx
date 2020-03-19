import React, { useEffect, Fragment } from 'react';
import _ from 'lodash';
import classNames from 'classnames';

import { Table, Spin, Select, Tooltip, Input, InputNumber, withForm, FormItem, Icon, DatePicker } from 'components';
import { disabledDateBeforToday } from 'components/datePicker';
import SearchSelect from 'components/select/searchSelect';
import SubWorkOrderModel from 'models/cooperate/planWorkOrder/SubWorkOrderModel';
import { ProductBatchModel } from 'models/cooperate/planWorkOrder/BaseModel';
import { thousandBitSeparator } from 'utils/number';
import WorkOrderModel from 'models/cooperate/planWorkOrder/WorkOrderModel';
import { replaceSign } from 'src/constants';
import { arrayIsEmpty } from 'utils/array';
import auth from 'src/utils/auth';
import moment from 'utils/time';
import log from 'utils/log';
import {
  checkTwoSidesTrim,
  amountValidator,
  chineseValidator,
  checkPositiveInteger,
  supportSpecialCharacterValidator,
  checkStringLength,
  CustomFields,
} from 'components/form';

import ProductBatchCodeRuleSelect from '../base/productBatchCodeRuleSelect';
import ProcessSelectComp from '../base/ProcessSelectComp';
import UserOrUserGroupSelect from '../base/userOrUserGroupSelect';
import ProcessSelect from '../createSonPlannedTicket/processSelect';
import { formatColumns } from '../util';
import {
  productBatchTypeMap,
  PRODUCT_BATCH_TYPE_INPUT,
  PROCESS_TYPE_PROCESS_ROUTE,
  PROCESS_TYPE_MBOM,
  PROCESS_TYPE_EBOM,
  processTypeMap,
  PROCESS_TYPE_PROCESS_ROUTE_AND_EBOM,
} from '../constants';
import styles from '../styles.scss';

const Option = Select.Option;
const { EbomSelect, MbomSelect, ProcessRouteSelect, TypeSelect } = ProcessSelectComp;

type PropsType = {
  show: Boolean,
  wrapperLoading: Boolean,
  loading: Boolean,
  data: Array<SubWorkOrderModel>,
  form: any,
  handleTreeOnChange: () => {},
};

type TableColumnsPropsType = {
  form: any,
};

export function renderProductBatchComp(productBatchType, disabledList) {
  return productBatchType === PRODUCT_BATCH_TYPE_INPUT ? (
    <Input className={styles.input} placeholder="请输入成品批次" />
  ) : (
    <ProductBatchCodeRuleSelect className={styles.select} />
  );
}

export function findLastChildDepth(tree = {}, i = 0) {
  if (!arrayIsEmpty(tree.children)) {
    findLastChildDepth(_.get(tree, 'children[0]'), i + 1);
  }
  return i;
}

export function getSubWorkOrderTableColumns(props: TableColumnsPropsType) {
  const { form, handleTreeOnChange } = props || {};
  const { getFieldDecorator, validateFields, getFieldsValue, getFieldValue } = form || {};
  const requiredSymbol = <i className={classNames(styles['table-column-title-prefix'], styles['required-symbol'])} />;
  const availableInventoryTooltip = (
    <Tooltip className={styles['table-column-title-suffix']} title="产出物料定义上配置的发料仓库中的可用库存">
      <Icon color="rgba(0,0,0,0.4)" type="exclamation-circle-o" />
    </Tooltip>
  );
  const columns = [
    {
      title: '层级',
      dataIndex: 'workOrderLevel',
      align: 'left',
      render: (data, { key }) => {
        return (
          <Fragment>
            <span style={{ display: 'none' }}>{getFieldDecorator(`${key}.key`, { initialValue: key })(<Input />)}</span>
            <span>{data}</span>
          </Fragment>
        );
      },
    },
    {
      title: '计划工单编号',
      dataIndex: 'workOrderCode',
      prefix: requiredSymbol,
      width: 160,
      render: (data, { key }) => {
        return (
          <FormItem>
            {getFieldDecorator(`${key}.code`, {
              initialValue: data,
              rules: [
                { required: true, message: '计划工单编号不能为空' },
                { max: 50, message: '计划工单编号最多50非中文字符' },
                { validator: chineseValidator('计划工单编号') },
                { validator: supportSpecialCharacterValidator('计划工单编号') },
                { validator: checkTwoSidesTrim('计划工单编号') },
              ],
            })(<Input className={styles.input} />)}
          </FormItem>
        );
      },
    },
    {
      title: '产出物料编号/名称',
      dataIndex: 'outputMaterial',
      prefix: requiredSymbol,
      width: 190,
      render: ({ option }, { key }) => {
        return (
          <FormItem>
            {getFieldDecorator(`${key}.material`, {
              initialValue: option,
            })(<SearchSelect disabled type="materialBySearch" className={styles['large-select']} />)}
          </FormItem>
        );
      },
    },
    {
      title: '规格描述',
      dataIndex: 'outputMaterial.desc',
      text: true,
      width: 150,
    },
    {
      title: '单位',
      dataIndex: 'outputMaterial.unitName',
      text: true,
      width: 100,
    },
    {
      title: '计划需求量',
      dataIndex: 'demandQuantity',
      render: (data, { key }, index) => {
        return (
          <Fragment>
            {typeof data === 'number' ? thousandBitSeparator(data) : replaceSign}
            <span style={{ display: 'none' }}>
              {getFieldDecorator(`${key}.planAmount`, {
                initialValue: data,
              })(<InputNumber className={styles['small-inputNumber']} min={0} />)}
            </span>
          </Fragment>
        );
      },
    },
    {
      title: '可用库存',
      dataIndex: 'availableInventory',
      numeric: true,
      suffix: availableInventoryTooltip,
    },
    {
      title: '计划产出量',
      dataIndex: 'outputAmount',
      align: 'right',
      prefix: requiredSymbol,
      render: (data, record) => {
        const { key } = record;
        return (
          <FormItem>
            {getFieldDecorator(`${key}.amount`, {
              initialValue: data,
              rules: [
                { required: true, message: '计划产出量必填' },
                {
                  validator: amountValidator(1000000000, 0, null, 6, '数量'),
                },
              ],
              onChange: v => {
                if (typeof v === 'number') {
                  handleTreeOnChange(form, record);
                }
              },
            })(<InputNumber className={styles['small-inputNumber']} />)}
          </FormItem>
        );
      },
    },
    {
      title: '成品批次',
      dataIndex: 'productBatch',
      render: (data: ProductBatchModel, { key }) => {
        const { type, value } = data;
        return (
          <Fragment>
            <FormItem className={styles['inline-block']}>
              {getFieldDecorator(`${key}.productBatchType`, {
                initialValue: type,
              })(
                <Select disabled className={styles['small-select']}>
                  {Object.keys(productBatchTypeMap).map(type => (
                    <Option value={Number(type)}>{productBatchTypeMap[type]}</Option>
                  ))}
                </Select>,
              )}
            </FormItem>
            <FormItem className={styles['inline-block']}>
              {getFieldDecorator(`${key}.productBatch`)(renderProductBatchComp(type))}
            </FormItem>
          </Fragment>
        );
      },
    },
    {
      title: '计划员',
      dataIndex: 'planners',
      preffix: requiredSymbol,
      render: (data, record) => {
        const { key } = record;
        const options = record.genRelatedPersonOptions('planners');
        const rules = [{ required: true, message: '计划员必填' }];
        const searchParams = {
          active: true,
          size: 1000,
          authorities: auth.WEB_CREATE_PLAN_WORK_ORDER,
        };
        return (
          <FormItem>
            {getFieldDecorator(`${key}.planners`, {
              initialValue: options,
              rules,
            })(
              <SearchSelect
                maxTagCount={2}
                loadOnFocus
                className={styles['large-select']}
                mode="multiple"
                type="account"
                params={searchParams}
              />,
            )}
          </FormItem>
        );
      },
    },
    {
      title: '生产主管',
      dataIndex: 'managers',
      preffix: requiredSymbol,
      render: (data, record) => {
        const { key } = record;
        const options = record.genRelatedPersonOptions('managers');
        const rules = [{ required: true, message: '生产主管必填' }];
        const searchParams = {
          active: true,
          size: 1000,
          authorities: auth.WEB_CREATE_PLAN_WORK_ORDER,
        };
        return (
          <FormItem>
            {getFieldDecorator(`${key}.managers`, {
              initialValue: options,
              rules,
            })(
              <SearchSelect
                maxTagCount={2}
                className={styles['large-select']}
                mode="multiple"
                type="account"
                params={searchParams}
              />,
            )}
          </FormItem>
        );
      },
    },
    {
      title: '优先级',
      dataIndex: 'priority',
      prefix: requiredSymbol,
      // width: 160,
      render: (data, { key }) => {
        return (
          <FormItem>
            {getFieldDecorator(`${key}.priority`, {
              initialValue: data,
              rules: [
                { required: true, message: '优先级必填' },
                {
                  validator: amountValidator(null, null, null, null, '优先级'),
                },
                { validator: checkPositiveInteger() },
              ],
            })(<InputNumber min={1} step={1} placeholder="数字越大优先级越高" className={styles.inputNumber} />)}
          </FormItem>
        );
      },
    },
    {
      title: '计划时间',
      dataIndex: 'planDateMomentRange',
      width: 330,
      render: (data, { planStartDateMoment, planEndDateMoment, key }) => {
        return (
          <Fragment>
            <FormItem className={styles['inline-block']}>
              {getFieldDecorator(`${key}.planBeginTime`, {
                initialValue: planStartDateMoment,
              })(
                <DatePicker
                  format="YYYY-MM-DD"
                  placeholder="开始时间"
                  disabledDate={disabledDateBeforToday}
                  className={styles.select}
                />,
              )}
            </FormItem>
            <FormItem className={styles['inline-block']}>
              {getFieldDecorator(`${key}.planEndTime`, {
                initialValue: planEndDateMoment,
              })(
                <DatePicker
                  className={styles.select}
                  placeholder="结束时间"
                  format="YYYY-MM-DD"
                  disabledDate={disabledDateBeforToday}
                />,
              )}
            </FormItem>
          </Fragment>
        );
      },
    },
    {
      title: '工艺',
      dataIndex: 'process',
      prefix: requiredSymbol,
      render: (data, record) => {
        const { key, processType, outputMaterial, defaultProcessOption } = record;
        const processRouteAndEbomRequired = processType === PROCESS_TYPE_PROCESS_ROUTE_AND_EBOM;
        const mbomReqiured = processType === PROCESS_TYPE_MBOM;
        const ebomFormItem = (
          <FormItem className={styles['inline-block']}>
            {getFieldDecorator(`${key}.ebom`, {
              initialValue: defaultProcessOption.ebom,
              rules: [{ required: processRouteAndEbomRequired, message: '工艺必填' }],
              onChange: () => handleTreeOnChange(form, record),
            })(<EbomSelect materialCode={outputMaterial.code} />)}
          </FormItem>
        );
        const processRouteFormItem = (
          <FormItem className={styles['inline-block']}>
            {getFieldDecorator(`${key}.processRoute`, {
              initialValue: defaultProcessOption.processRoute,
              rules: [{ required: processRouteAndEbomRequired, message: '工艺必填' }],
              onChange: () => handleTreeOnChange(form, record),
            })(<ProcessRouteSelect materialCode={outputMaterial.code} />)}
          </FormItem>
        );
        const mbomFormItem = (
          <FormItem className={styles['inline-block']}>
            {getFieldDecorator(`${key}.mbom`, {
              initialValue: defaultProcessOption,
              rules: [{ required: mbomReqiured, message: '工艺必填' }],
              onChange: () => handleTreeOnChange(form, record),
            })(<MbomSelect materialCode={outputMaterial.code} />)}
          </FormItem>
        );

        return (
          <Fragment>
            <FormItem className={styles['inline-block']}>
              {getFieldDecorator(`${key}.selectType`, {
                initialValue: processType,
                rules: [{ required: true, message: '工艺必填' }],
              })(<TypeSelect typeSelectDisabled processType={processType} />)}
            </FormItem>
            {processType === PROCESS_TYPE_MBOM ? (
              mbomFormItem
            ) : (
              <Fragment>
                {ebomFormItem}
                {processRouteFormItem}
              </Fragment>
            )}
          </Fragment>
        );
      },
    },
    {
      title: '上级工序',
      dataIndex: 'parentProcess',
      prefix: requiredSymbol,
      width: 190,
      render: (data, { key, defaultParentProcessOption }) => {
        function backFillProcessInfo(code, name) {
          form.setFieldsValue({
            [`${key}.parentProcessCode`]: code,
            [`${key}.parentProcessName`]: name,
          });
        }
        return (
          <Fragment>
            <FormItem>
              {getFieldDecorator(`${key}.fatherPlannedTicketProcess`, {
                initialValue: defaultParentProcessOption,
                rules: [{ required: true, message: '父工单工序必选' }],
              })(
                <Select labelInValue className={styles['large-select']}>
                  {arrayIsEmpty(data)
                    ? []
                    : data.map(({ seq, code, name, processDisplay }) => (
                        <Option
                          value={{ seq, code, name }}
                          // onChange={() => backFillProcessInfo(code, name)}
                        >
                          {processDisplay}
                        </Option>
                      ))}
                </Select>,
              )}
            </FormItem>
            {/* <FormItem style={{ display: 'none' }}>
              {getFieldDecorator(`${key}.parentProcessCode`, {})(<Input />)}
            </FormItem>
            <FormItem style={{ display: 'none' }}>
              {getFieldDecorator(`${key}.parentProcessName`)(<Input />)}
            </FormItem> */}
          </Fragment>
        );
      },
    },
  ];
  return formatColumns(columns);
}

function CreateSubWorkOrderTable(props: PropsType) {
  const { show, loading, wrapperLoading, ...rest } = props || {};
  if (!show) return null;

  useEffect(() => {
    if (wrapperLoading) {
      props.form.resetFields();
    }
  }, [wrapperLoading]);

  return (
    <Spin spinning={wrapperLoading} {...rest}>
      {wrapperLoading ? null : (
        <Table
          loading={loading}
          columns={getSubWorkOrderTableColumns(rest)}
          scroll={{ x: 'max-content' }}
          style={{ margin: 0, width: 1020 }}
          pagination={false}
          rowKey={record => record.key}
          defaultExpandAllRows
          {...rest}
        />
      )}
    </Spin>
  );
}

export default withForm({}, CreateSubWorkOrderTable);
