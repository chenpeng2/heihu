import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import { Button, message, FormattedMessage, FormItem } from 'src/components';
import BaseForm from 'src/containers/materialType/baseComponent/form';
import { black } from 'src/styles/color';
import { createMaterialType } from 'src/services/bom/materialType';
import log from 'src/utils/log';
import { formatFormValue } from 'src/containers/materialType/utils';

class CreateMaterialType extends Component {
  state = {};

  renderTitle = () => {
    return (
      <div style={{ color: black, fontSize: 20, margin: '20px 0px' }}>
        <FormattedMessage defaultMessage={'创建物料类型'} />
      </div>
    );
  };

  renderButtons = () => {
    const { router } = this.context;
    const baseStyle = { width: 120 };

    return (
      <FormItem label=" ">
        <Button
          style={{ ...baseStyle }}
          type={'default'}
          onClick={() => {
            if (router) {
              router.history.push('/bom/materialTypes');
            }
          }}
        >
          取消
        </Button>
        <Button
          type={'primary'}
          style={{ ...baseStyle, marginLeft: 10 }}
          onClick={async () => {
            if (!this.formRef) return null;
            const getFormValue = _.get(this.formRef, 'wrappedInstance.getFormValue');
            if (typeof getFormValue === 'function') {
              const value = getFormValue();
              if (value) {
                try {
                  const res = await createMaterialType(formatFormValue(value));
                  message.success('创建物料类型成功');
                  const id = _.get(res, 'data.data.id');
                  if (typeof id === 'number') {
                    router.history.push(`/bom/materialTypes/${id}/detail`);
                  }
                } catch (e) {
                  log.error(e);
                }
              }
            }
          }}
        >
          确定
        </Button>
      </FormItem>
    );
  };

  render() {
    return (
      <div style={{ marginLeft: 20 }}>
        {this.renderTitle()}
        <BaseForm wrappedComponentRef={inst => (this.formRef = inst)} />
        {this.renderButtons()}
      </div>
    );
  }
}

CreateMaterialType.propTypes = {
  style: PropTypes.object,
};

CreateMaterialType.contextTypes = {
  router: PropTypes.any,
};

export default CreateMaterialType;
