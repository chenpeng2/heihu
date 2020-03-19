import React from 'react';
import { Radio } from 'antd';
import classNames from 'classnames';
import { changeChineseToLocaleWithoutIntl } from 'utils/locale/utils';
import TrueFalseRadio from './trueFalseRadio';
import styles from './styles.scss';

const Group = Radio.Group;

type PropsType = {
  className: String,
  options: [],
};

class GCGroup extends React.PureComponent<PropsType, {}> {
  state = {};
  render() {
    const { options, className, ...rest } = this.props;
    return (
      <Group
        className={classNames(styles['gc-radio-group'], className)}
        options={options && options.map(node => ({ ...node, label: changeChineseToLocaleWithoutIntl(node.label) }))}
        {...rest}
      />
    );
  }
}

Radio.Group = GCGroup;
Radio.TrueFalseRadio = TrueFalseRadio;

export default Radio;
