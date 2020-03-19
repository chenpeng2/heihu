import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import { getCodeForDefect } from 'src/services/knowledgeBase/defect';
import { checkTwoSidesTrim, reg1, checkStringLength, lengthValidate, requiredRule } from 'src/components/form';
import { Form, Input, FormItem, withForm, FormattedMessage } from 'src/components';
import DefectCategorySearchSelect from 'src/containers/defectCategory/defectCategorySearchSelect';
import { DEFECT_CATEGORY_STATUS } from 'src/views/knowledgeManagement/defectCategory/util';

import { knowledgeItem } from '../constants';

export const FORM_TYPE = {
  create: 'create',
  edit: 'edit',
};

const FORM_ITEM_WIDTH = 300;

const BaseForm = props => {
  const { form, type, initialValue } = props;
  const { getFieldDecorator, setFieldsValue } = form;

  useEffect(() => {
    if (type === FORM_TYPE.create) {
      getCodeForDefect().then(res => {
        const code = _.get(res, 'data.data');
        setFieldsValue({ code });
      });
    }
  }, []);

  useEffect(() => {
    if (type === FORM_TYPE.edit) {
      setFieldsValue(initialValue);
    }
  }, [initialValue]);

  return (
    <Form layout="vertical">
      <FormItem label={'编号'}>
        {getFieldDecorator('code', {
          rules: [
            requiredRule('编号'),
            { validator: lengthValidate(0, 20) },
            {
              pattern: /^[\w\_]+$/g,
              message: <FormattedMessage defaultMessage={'编号只支持英文字母、数字和下划线'} />,
            },
          ],
        })(<Input style={{ width: FORM_ITEM_WIDTH }} disabled={type === FORM_TYPE.edit} />)}
      </FormItem>
      <FormItem label="名称">
        {getFieldDecorator('name', {
          rules: [
            { required: true, message: <FormattedMessage defaultMessage={`请输入${knowledgeItem.display}名称`} /> },
            {
              min: 0,
              max: 50,
              message: <FormattedMessage defaultMessage={`${knowledgeItem.display}长度不能超过50个字`} />,
            },
            {
              pattern: reg1,
              message: (
                <FormattedMessage
                  defaultMessage={`${
                    knowledgeItem.display
                  }只能由中文、英文字母、数字、*·_ /-.,中文括号,英文括号,&,空格组成`}
                />
              ),
            },
            {
              validator: checkTwoSidesTrim(knowledgeItem.display),
            },
          ],
        })(<Input style={{ width: FORM_ITEM_WIDTH }} />)}
      </FormItem>
      <FormItem label={'分类'}>
        {getFieldDecorator('defectGroup', {
          rules: [requiredRule('次品分类必填')],
        })(
          <DefectCategorySearchSelect
            style={{ width: FORM_ITEM_WIDTH }}
            params={{ status: DEFECT_CATEGORY_STATUS.inUse.value }}
          />,
        )}
      </FormItem>
      <FormItem label="备注">
        {getFieldDecorator('remark', {
          rules: [{ validator: checkStringLength(1000) }],
        })(<Input.TextArea style={{ width: FORM_ITEM_WIDTH }} />)}
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
