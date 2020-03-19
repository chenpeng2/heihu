import React, { Component } from 'react';
import _ from 'lodash';

import auth from 'src/utils/auth';
import { Link, haveAuthority, message } from 'components';
import { updateESignatureStatus } from 'src/services/knowledgeBase/eSignature';

type Props = {
  data: {},
  refetch: () => {},
};

class UpdateESignatureLink extends Component {
  props: Props;
  state = {};

  updateESignatureStatus = async params => {
    const { data, refetch } = this.props;
    const { configKey, status } = data;
    await updateESignatureStatus({ configKey, status: status === 1 ? 0 : 1 })
      .then(res => {
        const statusCode = _.get(res, 'data.statusCode');
        const action = status === 1 ? '停用' : '启用';

        if (statusCode === 200) {
          message.success(`${action}成功`);
          refetch();
        } else {
          message.success(`${action}失败`);
        }
      })
      .catch(err => console.log(err));
  };

  render() {
    const { data, ...rest } = this.props;
    const { status } = data;
    const display = status === 1 ? '停用' : '启用';

    return (<Link
      disabled={!haveAuthority(auth.WEB_CONFIG_E_SIGNATURE)}
      onClick={this.updateESignatureStatus}
      {...rest}
    >{display}</Link>);
  }
}

export default UpdateESignatureLink;
