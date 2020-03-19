import React, { Component } from 'react';
import _ from 'lodash';
import { withRouter } from 'react-router-dom';

import { updateCapacityConstraint, getCapacityConstraintDetail } from 'services/knowledgeBase/capacityConstraint';
import { Button, message, Spin } from 'src/components';
import log from 'src/utils/log';

import { formatFormValue, knowledgeItem } from '../constants';
import BaseForm, { FORM_TYPE } from '../baseComponent/baseForm';

type Props = {
  match: {},
  onCompeleted: any,
  onCancel: any,
};

class EditCapacityConstraint extends Component {
  props: Props;
  state = {
    loading: true,
    initialValue: {},
  };

  async componentDidMount() {
    const { match } = this.props;
    const id = _.get(match, 'params.id');
    this.setState({ loading: true });
    try {
      const res = await getCapacityConstraintDetail(id);
      const { workstationId, workstationName, taskLimit } = _.get(res, 'data.data');
      const initialValue = {
        taskLimit,
        workstationId: { value: `WORKSTATION-${workstationId}`, label: workstationName },
      };
      this.setState({ initialValue });
    } catch (e) {
      log.error(e);
    } finally {
      this.setState({ loading: false });
    }
  }

  render() {
    const { match, onCancel, onCompeleted } = this.props;
    const id = _.get(match, 'params.id');
    const { initialValue } = this.state;
    const formRef = React.createRef();

    return (
      <Spin spinning={this.state.loading}>
        <div style={{ paddingBottom: 30 }}>
          <BaseForm type={FORM_TYPE.edit} ref={formRef} initialValue={initialValue} />
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

                  updateCapacityConstraint(id, formatFormValue(value))
                    .then(() => {
                      message.success(`编辑${knowledgeItem.display}成功`);
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
              确定
            </Button>
          </div>
        </div>
      </Spin>
    );
  }
}

EditCapacityConstraint.contextTypes = {
  router: {},
};

export default withRouter(EditCapacityConstraint);
