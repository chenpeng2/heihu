import React, { Component } from 'react';
import { Input } from 'antd';
import _ from 'lodash';
import { injectIntl } from 'react-intl';
import { changeChineseToLocale } from 'src/utils/locale/utils';
import { fontSub } from 'src/styles/color/index';
import styles from './styles.scss';

type Props = {
  style: Object,
  maxLength: Number,
  value: any,
  intl: any,
  onChange: () => {},
};

class Textarea extends Component {
  props: Props;
  state = {
    isFocus: false,
  };

  render() {
    const { style, maxLength, placeholder, intl, ...rest } = this.props;
    const length = _.get(this.props, 'value.length', 0);
    return (
      <div
        onFocus={() => {
          this.setState({ isFocus: true });
        }}
        onBlur={() => {
          this.setState({ isFocus: false });
        }}
        tabIndex={0}
        className={this.state.isFocus ? styles.gcTextAreaFocus : styles.gcTextArea}
        style={{ ...style, height: ((style && style.height) || 100) + 22, background: '#fff' }}
      >
        <Input.TextArea
          {...rest}
          placeholder={changeChineseToLocale(placeholder, intl)}
          maxLength={maxLength}
          style={{ ...style, resize: 'none', border: 'none', height: (style && style.height) || 120 }}
          rows={4}
        />
        {maxLength ? (
          <div className={styles.prompt}>
            <div style={{ color: fontSub }}>
              {length === maxLength ? changeChineseToLocale('(字数已满)', intl) : null}
            </div>
            <div style={{ color: fontSub }}>{`${length}/${maxLength}`}</div>
          </div>
        ) : null}
      </div>
    );
  }
}

export const AntTextarea = Input.TextArea;

export default injectIntl(Textarea);
