import React, { Component } from 'react';
import { Input as AntInput, Icon } from 'antd';
import { injectIntl } from 'react-intl';
import { changeChineseToLocale } from 'src/utils/locale/utils';

type propsType = {
  value: any,
  intl: any,
  eye: boolean,
  trim: boolean,
  onChange: () => {},
};

class Input extends Component<propsType> {
  state = {
    showPassword: false,
  };

  onChange = e => {
    const { trim, onChange } = this.props;
    const value = e.target.value;
    let result =
      value &&
      value.replace(
        /([\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2694-\u2697]|\uD83E[\uDD10-\uDD5D])/g,
        '',
      );
    result = trim ? result.trim() : result;
    if (onChange) {
      onChange(result);
    }
  };

  render() {
    const { eye, intl, placeholder, ...rest } = this.props;
    const { showPassword } = this.state;
    if (eye) {
      rest.addonAfter = (
        <Icon
          type={`${showPassword ? 'eye-o' : 'eye'}`}
          onClick={() => this.setState({ showPassword: !showPassword })}
        />
      );
      rest.type = showPassword ? rest.type : 'password';
      rest.autocomplete = 'new-password';
    }
    return (
      <AntInput placeholder={changeChineseToLocale(placeholder || '请填写', intl)} {...rest} onChange={this.onChange} />
    );
  }
}

Input.TextArea = AntInput.TextArea;
Input.Search = AntInput.Search;
Input.Group = AntInput.Group;
Input.Password = AntInput.Password;
export default injectIntl(Input);
