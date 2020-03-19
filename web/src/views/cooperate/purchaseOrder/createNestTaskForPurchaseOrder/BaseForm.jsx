import React, { useState, useEffect, useRef, useImperativeHandle } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import { Tooltip, Row, Col, InputNumber, Form, Textarea, Input, FormItem, withForm } from 'src/components/index';
import { lengthValidate, amountValidator } from 'src/components/form/index';
import { arrayIsEmpty } from 'src/utils/array';
import WorkStationSelect from 'src/components/select/workstationSelect';
import { getNestSpecDetail, getNestTaskCode } from 'src/services/nestSpec';
import { convertAmountByUnitConversions } from 'src/views/bom/materials/utils';

import MaterialListForm from './MaterialListForm';
import SelectNestSpecByMaterials, { extraSearch as searchNestSpecByMaterialCodes } from './SelectNestSpecByMaterials';

const FORM_ITEM_WIDTH = 300;

// 销售订单物料的合并的逻辑
const getPurchaseOrderMaterials = purchaseOrder => {
  const { materialList } = purchaseOrder || {};
  const materials = [];
  if (!arrayIsEmpty(materialList)) {
    materialList.forEach(i => {
      const { materialInfo, amount, unitId, unitName } = i || {};
      materials.push({ materialInfo, amount, unitId, unitName });
    });
  }

  // 所有的单位
  let units = [];
  const { materialInfo } = materials[0] || {};
  const { unitConversions, unitId: masterUnitId } = materialInfo || {};
  if (!arrayIsEmpty(unitConversions)) {
    units = unitConversions.concat([{ masterUnitCount: 1, slaveUnitCount: 1, slaveUnitId: masterUnitId }]);
  }

  const res = [];
  materials.forEach(i => {
    const materialInRes = res.find(j => {
      return _.get(i, 'materialInfo.code') === _.get(j, 'materialInfo.code');
    });
    if (!materialInRes) {
      res.push(i);
      return;
    }

    const { unitId, amount } = materialInRes;

    if (_.get(i, 'unitId') === unitId) {
      // 单位相同，amount相加
      materialInRes.amount += amount;
    } else {
      // 单位不同，用materialInRes的单位作为标准相加
      materialInRes.amount +=
        convertAmountByUnitConversions(_.get(i, 'amount'), _.get(i, 'unitId'), unitId, units) || 0;
    }
  });

  return res;
};

const BaseForm = React.forwardRef((props, ref) => {
  const { form, style, purchaseOrder } = props;
  const { getFieldDecorator } = form;
  const [materialCodes, setMaterialCodes] = useState([]);
  const [nestSpecItems, setNestSpecItems] = useState([]);
  const [planAmount, setPlanAmount] = useState(undefined);
  const [isInnerPlanAmount, setIsInnerPlanAmount] = useState(false);
  const [nestSpecMemo, setNestSpecMemo] = useState(null);

  // materialListTable的ref处理
  const materialListRef = useRef();
  useImperativeHandle(ref, () => ({
    resetMaterialListTable: () => {
      materialListRef.current.backToInitialState();
    },
  }));

  // 嵌套任务初始code
  useEffect(() => {
    getNestTaskCode().then(res => {
      const code = _.get(res, 'data.data');
      form.setFieldsValue({ code });
    });
  }, []);

  // 销售订单
  useEffect(() => {
    // 创建的时候需要有新的code生成。编辑的时候需要有初始值的填入
    const { purchaseOrderCode, materialList, remark } = purchaseOrder || {};

    const materialCodes = arrayIsEmpty(materialList) ? [] : materialList.map(i => i && i.materialCode).filter(i => i);
    setMaterialCodes(materialCodes);

    form.setFieldsValue({ purchaseOrderCode, remark });
  }, [purchaseOrder]);

  const onChangeForNestSpec = v => {
    const { key } = v || {};
    if (key) {
      getNestSpecDetail(key).then(res => {
        // 嵌套规格备注
        const memo = _.get(res, 'data.data.memo');
        setNestSpecMemo(memo);

        // 需要为嵌套规格的数字中加上共计数
        let items = _.get(res, 'data.data.items');
        if (!arrayIsEmpty(items)) {
          const purchaserOrderMaterials = getPurchaseOrderMaterials(purchaseOrder);
          items = items.map(i => {
            const { materialCode } = i || {};
            const materialInPurchaseOrder = purchaserOrderMaterials.find(
              i => _.get(i, 'materialInfo.code') === materialCode,
            );
            if (materialInPurchaseOrder) i.allAmount = materialInPurchaseOrder.amount;
            return i;
          });
        }
        setNestSpecItems(items);
      });
    } else {
      materialListRef.current.backToInitialState();
      setNestSpecItems(null);
      setNestSpecMemo(null);
    }
  };

  // 如果嵌套规格只有一个默认带出
  useEffect(() => {
    const getNestSpecs = async () => {
      return await searchNestSpecByMaterialCodes(materialCodes);
    };
    getNestSpecs().then(res => {
      if (!arrayIsEmpty(res) && res.length === 1) {
        form.setFieldsValue({ nestSpec: res[0] });
        onChangeForNestSpec(res[0]);
      }
    });
  }, [materialCodes]);

  return (
    <div style={{ marginTop: 20, ...style }}>
      <Form>
        <FormItem label={'任务编号'}>
          {getFieldDecorator('code', {
            rules: [
              {
                validator: lengthValidate(null, 20),
              },
              {
                required: true,
                message: '嵌套规格编号必填',
              },
            ],
          })(<Input style={{ width: FORM_ITEM_WIDTH }} />)}
        </FormItem>
        <FormItem label={'销售订单'}>
          {getFieldDecorator('purchaseOrderCode', {
            rules: [
              {
                required: true,
                message: '销售订单编号必填',
              },
            ],
          })(<Input disabled style={{ width: FORM_ITEM_WIDTH }} />)}
        </FormItem>
        <FormItem label={'嵌套工位'}>
          {getFieldDecorator('workstation', {
            rules: [
              {
                required: true,
                message: '嵌套工位必填',
              },
            ],
          })(<WorkStationSelect filterStopWorkstation placeholder={'请选择'} style={{ width: FORM_ITEM_WIDTH }} />)}
        </FormItem>
        <FormItem label={'计划数'}>
          {getFieldDecorator('amount', {
            initialValue: planAmount,
            onChange: v => {
              setPlanAmount(v);
              setIsInnerPlanAmount(false);

              form.setFieldsValue({ amount: v });
            },
            rules: [
              {
                validator: amountValidator(null, null, 'integer'),
              },
              {
                required: true,
                message: '计划数必填',
              },
            ],
          })(<InputNumber style={{ width: FORM_ITEM_WIDTH }} />)}
        </FormItem>
        <Row>
          <Col>
            <FormItem label={'嵌套规格'}>
              {getFieldDecorator('nestSpec', {
                rules: [
                  {
                    required: true,
                    message: '嵌套规格必填',
                  },
                ],
                onChange: onChangeForNestSpec,
              })(<SelectNestSpecByMaterials materialCodes={materialCodes} style={{ width: FORM_ITEM_WIDTH }} />)}
            </FormItem>
          </Col>
          {nestSpecMemo ? (
            <Col>
              <FormItem style={{ marginLeft: 10 }}>
                {getFieldDecorator('memo', {
                  initialValue: nestSpecMemo,
                })(<Tooltip text={nestSpecMemo} length={50} />)}
              </FormItem>
            </Col>
          ) : null}
        </Row>

        <FormItem label={' '}>
          <MaterialListForm
            setPlanAmount={v => {
              setPlanAmount(v);
              setIsInnerPlanAmount(true);

              form.setFieldsValue({ amount: v });
            }}
            isInnerPlanAmount={isInnerPlanAmount}
            planAmount={planAmount}
            initialData={nestSpecItems}
            form={form}
            ref={materialListRef}
          />
        </FormItem>
        <FormItem label={'备注'}>
          {getFieldDecorator('remark', {
            rules: [
              {
                validator: lengthValidate(null, 100),
              },
            ],
          })(<Textarea disabled maxLength={100} style={{ height: 150, width: FORM_ITEM_WIDTH }} />)}
        </FormItem>
      </Form>
    </div>
  );
});

BaseForm.propTypes = {
  style: PropTypes.any,
  purchaseOrder: PropTypes.any,
};

// 格式化表单的数据为了创建和编辑接口
export const formatFormValue = value => {
  const { memo, code, workstation, purchaseOrderCode, materialList, remark, amount, nestSpec } = value || {};

  const items = !arrayIsEmpty(materialList)
    ? materialList
        .map(i => {
          const { nestAmount, unit, material, lineId, remark } = i || {};
          const { key: materialCode, label } = material || {};
          const materialName = typeof label === 'string' ? label.split('/')[1] : null;

          return {
            seq: lineId,
            materialCode,
            materialName,
            amount: nestAmount,
            unitId: unit ? unit.key : null,
            unitName: unit ? unit.label : null,
            remark,
          };
        })
        .filter(i => i && i.materialCode)
    : [];

  return {
    remark,
    taskCode: code,
    workStationId: workstation,
    orderNo: purchaseOrderCode,
    orderType: 1,
    amountProductPlanned: amount,
    packCode: nestSpec ? nestSpec.key : null,
    packSnapshot: {
      packCode: nestSpec ? nestSpec.key : null,
      packName: nestSpec ? nestSpec.label : null,
      state: 1,
      memo,
      items,
    },
  };
};

export default withForm({}, BaseForm);
