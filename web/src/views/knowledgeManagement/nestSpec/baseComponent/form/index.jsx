import React, { useState, useEffect, useRef, useImperativeHandle } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import { Form, Radio, Textarea, Input, FormItem, withForm } from 'src/components';
import { lengthValidate, CHINESE_ENGLISH_NUMBER_REG } from 'src/components/form';
import { arrayIsEmpty } from 'src/utils/array';

import { NEST_SPEC_STATUS } from '../../utils';
import MaterialListForm, { FORM_TYPE as MaterialListFormType } from './materialListForm';

const FORM_ITEM_WIDTH = 300;

// 将详情接口的数据格式化为form表单需要的格式
const formatDetailValueToFormValue = value => {
  // items作为materialList的data由materialListForm组件处理
  const { packCode, packName, state, memo } = value || {};

  return {
    code: packCode,
    name: packName,
    status: state,
    remark: memo,
  };
};

// 表单的使用类型。需要根据类型有不同的行为
export const BASE_FORM_TYPE = {
  create: 'create',
  edit: 'edit',
};

const BaseForm = React.forwardRef((props, ref) => {
  const { form, style, type, initialCode, initialValue } = props;
  const { getFieldDecorator } = form;

  // materialListTable的ref处理
  const materialListRef = useRef();
  useImperativeHandle(ref, () => ({
    resetMaterialListTable: () => {
      materialListRef.current.backToInitialState();
    },
  }));

  useEffect(() => {
    // 创建的时候需要有新的code生成。编辑的时候需要有初始值的填入
    if (type === BASE_FORM_TYPE.create) {
      form.setFieldsValue({ code: initialCode });
    }

    if (type === BASE_FORM_TYPE.edit) {
      const valueAfterFormat = formatDetailValueToFormValue(initialValue);
      form.setFieldsValue(valueAfterFormat);
    }
  }, [initialCode, initialValue]);

  return (
    <div style={{ marginTop: 20, ...style }}>
      <Form>
        <FormItem label={'编号'}>
          {getFieldDecorator('code', {
            initialValue: initialCode,
            rules: [
              {
                validator: lengthValidate(null, 10),
              },
              {
                required: true,
                message: '嵌套规格编号必填',
              },
            ],
          })(<Input disabled={type === BASE_FORM_TYPE.edit} style={{ width: FORM_ITEM_WIDTH }} />)}
        </FormItem>
        <FormItem label={'名称'}>
          {getFieldDecorator('name', {
            rules: [
              {
                validator: lengthValidate(null, 15),
              },
              {
                required: true,
                message: '嵌套规格名称必填',
              },
            ],
          })(<Input style={{ width: FORM_ITEM_WIDTH }} />)}
        </FormItem>
        <FormItem label={'状态'}>
          {getFieldDecorator('status', {
            rules: [
              {
                required: true,
                message: '嵌套规格状态必填',
              },
            ],
            initialValue: NEST_SPEC_STATUS.use.value,
          })(
            <Radio.Group>
              {Object.values(NEST_SPEC_STATUS).map(i => {
                const { value, name } = i || {};
                return <Radio value={value}>{name}</Radio>;
              })}
            </Radio.Group>,
          )}
        </FormItem>
        <FormItem label={'物料列表'}>
          <MaterialListForm
            type={type === BASE_FORM_TYPE.edit ? MaterialListFormType.edit : MaterialListFormType.create}
            form={form}
            ref={materialListRef}
            initialData={_.get(initialValue, 'items')}
          />
        </FormItem>
        <FormItem label={'备注'}>
          {getFieldDecorator('remark', {
            rules: [
              {
                validator: lengthValidate(null, 100),
              },
            ],
          })(<Textarea maxLength={100} style={{ height: 150, width: FORM_ITEM_WIDTH }} />)}
        </FormItem>
      </Form>
    </div>
  );
});

BaseForm.propTypes = {
  style: PropTypes.any,
  type: PropTypes.any,
  initialCode: PropTypes.any, // 创建的时候需要更新code
  initialValue: PropTypes.any, // 编辑的时候需要填入初始值
};

// 格式化表单的数据为了创建和编辑接口
export const formatFormValue = value => {
  const { code, name, status, materialList, remark } = value || {};
  return {
    memo: remark,
    packCode: code,
    packName: name,
    state: status,
    items: !arrayIsEmpty(materialList)
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
              remark,
            };
          })
          .filter(i => i && i.materialCode)
      : [],
  };
};

export default withForm({}, BaseForm);
