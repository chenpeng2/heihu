import React, { Component } from 'react';

import { withRouter } from 'react-router-dom';
import { createCapacityConstraint } from 'src/services/knowledgeBase/capacityConstraint';
import { message, Button } from 'src/components';
import log from 'src/utils/log';

import { formatFormValue, knowledgeItem } from '../constants';
import BaseForm, { FORM_TYPE } from '../baseComponent/baseForm';

type Props = {
  onCancel: any,
  onCompeleted: any,
};

class CreateCapacityConstraint extends Component {
  props: Props;
  state = {};

  render() {
    const { onCancel, onCompeleted } = this.props;
    const formRef = React.createRef();

    return (
      <div style={{ paddingBottom: 30 }}>
        <BaseForm type={FORM_TYPE.create} ref={formRef} />
        <div style={{ marginTop: 30, marginLeft: 160 }}>
          <Button
            type="default"
            onClick={() => {
              if (typeof onCancel === 'function') {
                onCancel();
              } else {
                this.context.router.history.push('/knowledgeManagement/capacityConstraint');
              }
            }}
            style={{ width: 110 }}
          >
            取消
          </Button>
          <Button
            type={'primary'}
            style={{
              width: 110,
              marginLeft: 72,
            }}
            onClick={() => {
              const form = formRef.current;

              if (!form) return;

              form.validateFieldsAndScroll(async (err, value) => {
                if (err) return;

                await createCapacityConstraint(formatFormValue(value))
                  .then(() => {
                    message.success(`创建${knowledgeItem.display}成功`);
                    if (typeof onCompeleted === 'function') {
                      onCompeleted();
                    } else {
                      this.context.router.history.push('/knowledgeManagement/capacityConstraint');
                    }
                  })
                  .catch(e => {
                    log.error(e);
                  });
              });
            }}
          >
            保存
          </Button>
        </div>
      </div>
    );
  }
}

CreateCapacityConstraint.contextTypes = {
  router: {},
};

export default withRouter(CreateCapacityConstraint);
