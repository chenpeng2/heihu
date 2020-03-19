import React, { Component } from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';

import { openModal, Button, message, Spin } from 'src/components';
import { black, white, content, borderGrey } from 'src/styles/color';
import BaseForm from 'src/containers/newProcess/base/Form';
import { updateProcess, getProcessDetail } from 'src/services/process';
import { changeChineseToLocaleWithoutIntl } from 'utils/locale/utils';
import SyncModal from './syncModal';

type Props = {
  match: any,
};

class Edit extends Component {
  props: Props;
  state = {
    data: null,
    loading: false,
  };

  componentDidMount() {
    this.fetchAndSetData();
  }

  fetchAndSetData = () => {
    const code = _.get(this.props, 'match.params.id');

    this.setState({ loading: true });

    getProcessDetail(decodeURIComponent(code))
      .then(res => {
        const data = _.get(res, 'data.data');
        this.setState({ data });
      })
      .finally(() => {
        this.setState({ loading: false });
      });
  };

  submit = async () => {
    const { router } = this.context;
    const { data } = this.state;
    const code = _.get(this.props, 'match.params.id');

    const value = this.formRef ? await this.formRef.wrappedInstance.getFormValue() : null;
    if (value) {
      updateProcess(decodeURIComponent(code), value).then(() => {
        message.success('编辑工序成功');
        const addedWorkstations = _.difference(value.workstations.map(e => Number(e)), data.workstations);
        const deletedWorkstations = _.difference(data.workstations, value.workstations.map(e => Number(e)));
        const addedAttachments = _.difference(value.attachments, data.attachments);
        const deletedAttachments = _.difference(data.attachments, value.attachments);
        const newDeliverable = value.deliverable !== data.deliverable ? value.deliverable : undefined;
        if (
          addedWorkstations.length ||
          deletedWorkstations.length ||
          addedAttachments.length ||
          deletedAttachments.length ||
          newDeliverable !== undefined
        ) {
          openModal(
            {
              title: '同步',
              width: 400,
              footer: null,
              onClose: () => {
                router.history.push(`/bom/newProcess/${code}/detail`);
              },
              children: (
                <SyncModal
                  processCode={code}
                  addedWorkstations={addedWorkstations}
                  deletedWorkstations={deletedWorkstations}
                  addedAttachments={addedAttachments}
                  deletedAttachments={deletedAttachments}
                  newDeliverable={newDeliverable}
                />
              ),
            },
            this.context,
          );
        } else {
          router.history.push(`/bom/newProcess/${encodeURIComponent(code)}/detail`);
        }
      });
    }
  };

  renderTitle = () => {
    return (
      <div style={{ color: black, fontSize: 18, margin: '20px 0 30px 20px' }}>
        {changeChineseToLocaleWithoutIntl('编辑工序')}
      </div>
    );
  };

  renderBaseForm = () => {
    return (
      <BaseForm
        isEdit
        initialValue={this.state.data}
        wrappedComponentRef={inst => (this.formRef = inst)}
        disableStatus={{ code: true, status: true }}
      />
    );
  };

  renderOperation = () => {
    const { router } = this.context;
    const normalButtonStyle = {
      width: 114,
      height: 32,
      backgroundColor: white,
      color: content,
      borderColor: borderGrey,
    };

    return (
      <div style={{ margin: '26px 0 100px 160px' }}>
        <Button
          style={{ ...normalButtonStyle, marginRight: 60 }}
          onClick={() => {
            router.history.push('/bom/newProcess');
          }}
          type="primary"
        >
          取消
        </Button>
        <Button style={{ width: 114, height: 32 }} type="primary" onClick={this.submit}>
          保存
        </Button>
      </div>
    );
  };

  render() {
    return (
      <Spin spinning={this.state.loading}>
        {this.renderTitle()}
        {this.renderBaseForm()}
        {this.renderOperation()}
      </Spin>
    );
  }
}

Edit.contextTypes = {
  router: PropTypes.object.isRequired,
};

export default Edit;
