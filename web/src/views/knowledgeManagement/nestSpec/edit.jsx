import React, { useState } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import { Spin, Button, message } from 'src/components';
import { black } from 'src/styles/color';
import { getNestSpecDetail, updateNestSpec } from 'src/services/nestSpec';
import { useFetch } from 'src/utils/hookUtils/fetchHooks';
import log from 'src/utils/log';

import BaseForm, { BASE_FORM_TYPE, formatFormValue } from './baseComponent/form';
import { getNestSpecDetailPageUrl } from './utils';

const Edit = props => {
  const [isLoadingInner, setIsLoadingInner] = useState(false);

  const { history, match } = props;
  const code = _.get(match, 'params.id');

  const [{ data, isLoading }] = useFetch(() => getNestSpecDetail(decodeURIComponent(code)));
  const detailData = _.get(data, 'data.data') || {};
  const baseStyle = { width: 120 };

  let formRef;

  const submitFn = () => {
    const validateFieldsAndScroll = _.get(formRef, 'props.form.validateFieldsAndScroll');

    if (typeof validateFieldsAndScroll === 'function') {
      validateFieldsAndScroll((err, value) => {
        if (err) return null;
        const valueAfterFormat = formatFormValue(value);

        setIsLoadingInner(true);

        updateNestSpec(valueAfterFormat)
          .then(() => {
            message.success('编辑嵌套规格成功');

            // 更新成功去详情页
            if (history) history.push(getNestSpecDetailPageUrl(_.get(valueAfterFormat, 'packCode')));
          })
          .catch(e => {
            log.error(e);
          })
          .finally(() => {
            setIsLoadingInner(false);
          });
      });
    }
  };

  return (
    <Spin spinning={isLoading || isLoadingInner}>
      <div style={{ padding: 20 }}>
        <div>
          <div style={{ fontSize: '20px', color: black }}>编辑嵌套规格</div>
        </div>
        <BaseForm wrappedComponentRef={inst => (formRef = inst)} type={BASE_FORM_TYPE.edit} initialValue={detailData} />
        <div style={{ marginLeft: 140 }}>
          <Button
            style={{ ...baseStyle }}
            type={'default'}
            onClick={() => {
              if (history) history.go(-1);
            }}
          >
            取消
          </Button>
          <Button type={'primary'} style={{ ...baseStyle, marginLeft: 10 }} onClick={submitFn}>
            确定
          </Button>
        </div>
      </div>
    </Spin>
  );
};

Edit.propTypes = {
  style: PropTypes.any,
  match: PropTypes.any,
  history: PropTypes.any,
};

export default Edit;
