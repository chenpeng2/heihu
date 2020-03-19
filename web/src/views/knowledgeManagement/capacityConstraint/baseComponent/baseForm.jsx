import React, { useEffect } from 'react';
import PropTypes from 'prop-types';

import { Form, InputNumber, FormItem, withForm, WorkstationAndAreaSelect } from 'components';
import { amountValidator } from 'components/form';

export const FORM_TYPE = {
  create: 'create',
  edit: 'edit',
};

const FORM_ITEM_WIDTH = 300;

const BaseForm = props => {
  const { form, type, initialValue } = props;
  const { getFieldDecorator, setFieldsValue } = form;

  useEffect(() => {
    if (type === FORM_TYPE.edit) {
      setFieldsValue(initialValue);
    }
  }, [initialValue]);

  const renderTile = () => {
    const style = {
      margin: '20px 0 30px 20px',
      color: '#000',
      fontSize: 16,
    };

    return <div style={style}>{type === FORM_TYPE.edit ? '编辑' : '创建'}产能约束</div>;
  };

  return (
    <Form>
      {renderTile()}
      <FormItem label={'工位'}>
        {getFieldDecorator('workstationId', {
          rules: [{ required: true, message: '工位必填' }],
        })(<WorkstationAndAreaSelect style={{ width: FORM_ITEM_WIDTH }} onlyWorkstations params={{ toManyTask: 1 }} />)}
      </FormItem>
      <FormItem label={'单位时间'}>
        {getFieldDecorator('timeUnit', {
          initialValue: 'd',
          rules: [{ required: true, message: '单位时间必填' }],
        })(<div>一个自然日</div>)}
      </FormItem>
      <FormItem label={'任务数量上限'}>
        {getFieldDecorator('taskLimit', {
          rules: [
            { required: true, message: '任务数量上限必填' },
            {
              validator: amountValidator(1000, undefined, 'integer'),
            },
          ],
        })(<InputNumber style={{ width: FORM_ITEM_WIDTH }} />)}
      </FormItem>
    </Form>
  );
};

BaseForm.propTypes = {
  style: PropTypes.any,
  type: PropTypes.any,
  form: PropTypes.any,
  initialValue: PropTypes.any,
};

export default withForm({}, BaseForm);
