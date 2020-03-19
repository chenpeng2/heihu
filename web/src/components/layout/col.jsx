import React, { Component } from 'react';
import { Col as AntCol } from 'antd';
import { injectIntl } from 'react-intl';
import { changeChineseToLocale } from 'src/utils/locale/utils';
import styles from './styles.scss';

type Props = {
  children: any,
  style: Object,
  intl: any,
  // 值为title或content或不传,
  type: ?String,
};

class Col extends Component {
  props: Props;

  state = {};

  render() {
    const { children, style, type, intl } = this.props;

    return (
      <div className={type && styles[type]} style={{ ...style, wordBreak: 'break-all' }}>
        {typeof children === 'string' ? changeChineseToLocale(children, intl) : children}
      </div>
    );
  }
}

Col.AntCol = AntCol;

export default injectIntl(Col);
