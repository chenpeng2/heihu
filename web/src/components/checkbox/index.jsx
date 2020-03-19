import React from 'react';
import { Checkbox } from 'antd';
import { injectIntl } from 'react-intl';
import { changeChineseToLocale } from 'src/utils/locale/utils';

import './styles.scss';

/**
 * @api {Checkbox} 多选框.
 * @APIGroup Checkbox.
 * @apiExample {js} Example usage:
 * 覆盖了层css,其他详情见antd的Checkbox
 */

class MyCheckbox extends React.Component {
  state = {};
  render() {
    const { className, style, children, intl, ...restProps } = this.props;
    return (
      <div className={className} style={style}>
        <Checkbox {...restProps} >
          {typeof children === 'string' ? changeChineseToLocale(children, intl) : children }
        </Checkbox>
      </div>
    );
  }
}

MyCheckbox.Group = Checkbox.Group;

export default injectIntl(MyCheckbox);
