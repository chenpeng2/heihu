import React, { Component } from 'react';

import { addDefect } from 'src/services/knowledgeBase/defect';
import { message, Button } from 'src/components';
import log from 'src/utils/log';

import { formatFormValue } from '../constants';
import BaseForm, { FORM_TYPE } from '../baseComponent/baseForm';

type Props = {
  onClose: any,
  onCompeleted: any,
};

class CreateUnit extends Component {
  props: Props;
  state = {};

  render() {
    const { onClose, onCancel, onCompeleted } = this.props;
    const formRef = React.createRef();

    return (
      <div style={{ paddingBottom: 30 }} >
        <BaseForm type={FORM_TYPE.create} ref={formRef} />
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <Button
            type="default"
            onClick={() => {
              if (typeof onCancel === 'function') onCancel();
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

              form.validateFieldsAndScroll(async (err, value) => {
                if (err) return;

                await addDefect(formatFormValue(value))
                  .then(() => {
                    message.success('创建次品项成功');
                    if (typeof onCompeleted === 'function') onCompeleted();
                    if (typeof onClose === 'function') onClose();
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
      </div>
    );
  }
}

export default CreateUnit;
