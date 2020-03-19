import React, { Component } from 'react';
import { injectIntl } from 'react-intl';
import { changeChineseToLocale } from 'utils/locale/utils';

type Props = {
  intl: any,
};

class AQLStandard extends Component {
  props: Props;
  state = {};

  render() {
    const { intl } = this.props;
    return (
      <div style={{ padding: 20 }}>
        <div>{changeChineseToLocale('样本量字码表', intl)}</div>
        <img
          alt="样本量字码表"
          src="https://s3.cn-northwest-1.amazonaws.com.cn/public-template/AQL-1.png"
          width={800}
        />
        <div>{changeChineseToLocale('抽样方案检索表', intl)}</div>
        <img
          alt="抽样方案检索表"
          src="https://s3.cn-northwest-1.amazonaws.com.cn/public-template/AQL-2.png"
          width={800}
        />
      </div>
    );
  }
}

export default injectIntl(AQLStandard);
