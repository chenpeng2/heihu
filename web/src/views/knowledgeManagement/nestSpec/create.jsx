import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import { black, middleGrey } from 'src/styles/color';
import { Spin, Button, Checkbox, message } from 'src/components';
import { createNestSpec, getNestSpecNewCode } from 'src/services/nestSpec';
import log from 'src/utils/log';

import BaseForm, { formatFormValue, BASE_FORM_TYPE } from './baseComponent/form';
import { getNestSpecListPageUrl, getNestSpecDetailPageUrl } from './utils';

const useInitialCode = () => {
  const [initialCode, setInitialCode] = useState(null);

  const getInitialCode = () =>
    getNestSpecNewCode().then(res => {
      const code = _.get(res, 'data.data');
      setInitialCode(code);
    });

  useEffect(() => {
    getInitialCode();
  }, []);

  return [initialCode, getInitialCode];
};

const Create = props => {
  const [keepCreate, setKeepCreate] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [initialCode, setInitialCode] = useInitialCode();

  let formRef;
  const { history } = props;
  const baseStyle = { width: 120 };

  // 创建按钮回调函数
  const createFn = () => {
    const validateFieldsAndScroll = _.get(formRef, 'props.form.validateFieldsAndScroll');

    const resetFields = _.get(formRef, 'props.form.resetFields');
    const resetMaterialList = _.get(formRef, 'wrappedInstance.resetMaterialListTable');

    if (typeof validateFieldsAndScroll === 'function') {
      validateFieldsAndScroll((err, value) => {
        if (err) return null;
        const valueAfterFormat = formatFormValue(value);

        setIsLoading(true);

        createNestSpec(valueAfterFormat)
          .then(() => {
            message.success('创建嵌套规格成功');

            // 如果持续创建那么清空form
            if (keepCreate) {
              if (typeof resetFields === 'function') resetFields();
              if (typeof resetMaterialList === 'function') resetMaterialList();
              // 更新code
              setInitialCode();
            } else {
              // 不是持续创建去详情页
              history.push(getNestSpecDetailPageUrl(_.get(valueAfterFormat, 'packCode')));
            }
          })
          .catch(e => {
            log.error(e);
          })
          .finally(() => {
            setIsLoading(false);
          });
      });
    }
  };

  return (
    <Spin spinning={isLoading}>
      <div style={{ padding: 20 }}>
        <div>
          <div style={{ fontSize: '20px', color: black }}>创建嵌套规格</div>
        </div>
        <BaseForm
          initialCode={initialCode}
          wrappedComponentRef={inst => (formRef = inst)}
          type={BASE_FORM_TYPE.create}
        />
        <div style={{ marginLeft: 140 }}>
          <Button
            style={{ ...baseStyle }}
            type={'default'}
            onClick={() => {
              history.push(getNestSpecListPageUrl());
            }}
          >
            取消
          </Button>
          <Button type={'primary'} style={{ ...baseStyle, marginLeft: 10 }} onClick={createFn}>
            确定
          </Button>
          <Checkbox
            value={keepCreate}
            style={{ display: 'inline-block', marginLeft: 30 }}
            onChange={e => {
              const value = _.get(e, 'target.checked');
              setKeepCreate(value);
            }}
          >
            <span style={{ color: black, fontSize: 13, marginRight: 5 }}>持续创建</span>
            <span style={{ color: middleGrey, fontSize: 12 }}>保存后可直接创建新的嵌套规格</span>
          </Checkbox>
        </div>
      </div>
    </Spin>
  );
};

Create.propTypes = {
  style: PropTypes.any,
  history: PropTypes.any,
};

export default Create;
