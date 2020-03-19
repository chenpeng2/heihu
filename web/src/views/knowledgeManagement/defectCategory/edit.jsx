import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import { Spin, message, Button } from 'src/components';
import { editDefectCategory, getDefectCategoryDetail } from 'src/services/knowledgeBase/defect';
import useFetch from 'src/utils/hookUtils/fetchHooks';
import log from 'src/utils/log';

import BaseForm from './baseComponent/baseForm';

const Edit = props => {
  const { onCancel, onClose, id, cbForSuccess } = props;

  // 拉取次品分类的详情数据
  const [{ data, isLoading }] = useFetch(async () => {
    return await getDefectCategoryDetail(id);
  });

  const { name } = _.get(data, 'data.data') || {};

  const formRef = React.createRef();

  return (
    <div style={{ paddingBottom: 30 }}>
      <Spin spinning={isLoading}>
        <BaseForm ref={formRef} initialData={{ name }} />
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <Button
            type="default"
            onClick={() => {
              if (typeof onCancel === 'function') onCancel();
              if (typeof cbForSuccess === 'function') cbForSuccess();
            }}
            style={{ width: 110 }}
          >
            取消
          </Button>
          <Button
            type={'primary'}
            style={{
              width: 110,
              marginLeft: 10,
            }}
            onClick={() => {
              const form = formRef.current;

              if (!form) return;

              form.validateFieldsAndScroll((err, value) => {
                if (err) return;

                editDefectCategory({ ...value, id })
                  .then(() => {
                    message.success('编辑次品分类成功');
                    if (typeof onClose === 'function') onClose();
                    if (typeof cbForSuccess === 'function') cbForSuccess();
                  })
                  .catch(e => {
                    log.error(e);
                  });
              });
            }}
          >
            确定
          </Button>
        </div>
      </Spin>
    </div>
  );
};

Edit.propTypes = {
  style: PropTypes.any,
  onClose: PropTypes.any,
  onCancel: PropTypes.any,
  id: PropTypes.any.isRequired,
  cbForSuccess: PropTypes.any,
};

export default Edit;
