import React, { Component } from 'react';
import _ from 'lodash';

import { Button, message, Spin } from 'src/components';
import { editSetting, getSettingDetail } from 'src/services/knowledgeBase/exceptionalEvent';
import { formatUser } from 'src/containers/exceptionalEvent/subscribeManageList/util';

import BaseForm, { formatWorkstation } from './baseForm';

type Props = {
  style: {},
  onClose: () => {},
  form: {},
  fetchData: () => {},
  id: string,
};

class Edit extends Component {
  props: Props;
  state = {
    detailData: null,
    loading: false,
  };

  componentDidMount() {
    const { id } = this.props;

    this.setState({ loading: true });
    getSettingDetail(id)
      .then(res => {
        const data = _.get(res, 'data.data');

        const { userId, userType, userName, sendLevel, subscribeLevel, subscribeCategoryIds, subscribeScope } =
          data || {};

        let _userType;
        if (userType === 0) {
          _userType = 'user';
        }
        if (userType === 1) {
          _userType = 'userGroup';
        }

        this.setState({
          detailData: {
            name: { key: `${userId}-${_userType}`, label: userName },
            sendLevel,
            subscribeLevel: subscribeLevel === 0 ? '不订阅' : subscribeLevel,
            subscribeCategoryIds,
            subscribeScope: subscribeScope.map(({ facilityId }) => {
              return facilityId;
            }),
          },
        });
      })
      .finally(() => {
        this.setState({ loading: false });
      });
  }

  renderForm = () => {
    const { detailData } = this.state;

    return <BaseForm ref={inst => (this.formInst = inst)} initialValue={detailData} />;
  };

  renderFooterButtons = () => {
    const { onClose, fetchData, id } = this.props;
    const buttonStyle = { width: 114 };

    return (
      <div style={{ paddingBottom: 35 }}>
        <div style={{ width: 280, margin: 'auto' }}>
          <Button
            type={'default'}
            style={{ ...buttonStyle, marginRight: 40 }}
            onClick={() => {
              if (onClose && typeof onClose === 'function') onClose();
            }}
          >
            取消
          </Button>
          <Button
            style={buttonStyle}
            onClick={() => {
              this.formInst.validateFieldsAndScroll((err, values) => {
                if (err) return;

                const { name, sendLevel, subscribeLevel, subscribeScope, subscribeCategoryIds } = values || {};
                editSetting(id, {
                  userId: name ? formatUser(name).userId : null,
                  userType: name ? formatUser(name).userType : null,
                  sendLevel,
                  subscribeLevel: subscribeLevel === '不订阅' ? 0 : subscribeLevel,
                  subscribeScope: formatWorkstation(subscribeScope),
                  subscribeCategoryIds,
                }).then(() => {
                  message.success('编辑配置成功');
                  if (typeof onClose === 'function') onClose();
                  if (typeof fetchData === 'function') fetchData();
                });
              });
            }}
          >
            完成
          </Button>
        </div>
      </div>
    );
  };

  render() {
    const { loading } = this.state;

    return (
      <Spin spinning={loading}>
        {this.renderForm()}
        {this.renderFooterButtons()}
      </Spin>
    );
  }
}

export default Edit;
