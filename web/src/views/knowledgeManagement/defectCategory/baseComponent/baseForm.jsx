import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import { Input, withForm, Form, FormItem, FormattedMessage } from 'src/components';
import { reg1, lengthValidate, checkTwoSidesTrim, requiredRule } from 'src/components/form';

const BaseForm = props => {
  const { form, initialData } = props;
  const { getFieldDecorator, setFieldsValue } = form || {};

  useEffect(() => {
    if (initialData) {
      setFieldsValue(initialData);
    }
  }, [initialData]);

  return (
    <Form>
      <FormItem label={'名称'}>
        {getFieldDecorator('name', {
          rules: [
            requiredRule('名称'),
            {
              validator: lengthValidate(0, 50),
            },
            {
              pattern: reg1,
              message: (
                <FormattedMessage
                  defaultMessage={'次品分类名称只能由中文、英文字母、数字、*·_ /-.,中文括号,英文括号,&,空格组成'}
                />
              ),
            },
            {
              validator: checkTwoSidesTrim('次品项分类名称'),
            },
          ],
        })(<Input />)}
      </FormItem>
    </Form>
  );
};

BaseForm.propTypes = {
  style: PropTypes.any,
  initialData: PropTypes.any,
};

export default withForm({}, BaseForm);
