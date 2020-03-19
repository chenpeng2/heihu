import React, { Component } from 'react';
import { Select } from 'antd';
import { injectIntl } from 'react-intl';
import { changeChineseToLocale, changeChineseToLocaleWithoutIntl } from 'src/utils/locale/utils';
import SelectGroup from './selectGroup';

import './styles.scss';

/**
 * @api {Select} Select.
 * @APIGroup Select.
 * @apiParam {String} placeholder 就是placeholder喽.
 * @apiParam {String} notFoundContent 当下拉列表为空时显示的内容.
 * @apiParam {Function} onChange 改变选中的option的时候触发的函数,不传有默认的.
 * @apiParam {Function} onSearch 文本框值变化时回调.
 * @apiExample {js} Example usage:
 * <Select
    style={{ width: '100%' }}
    placeholder={`选择${title}`}
    onChange={option => {
      this.setState({ loading: true });
    }}
   >
    {organization.data.edges.map(({ node }) => {
      return <Option value={node.id} key={node.id}>{node.name}</Option>;
    })}
   </Select>
   可以当做antd的select使用
   只是添加了search的功能
 */

type Props = {
  onChange: ?Function,
  onSearch: ?Function,
  placeholder: ?string,
  notFoundContent: ?any,
  showSearch: ?Boolean,
  intl: any,
  options: ?Array,
};

class SearchSelect extends Component {
  props: Props;

  state = {};

  handleChange = (value, option) => {
    if (this.props.onChange) {
      this.props.onChange(value, option);
    }
    this.setState({ value });
  };

  render() {
    const { intl, showSearch = true, placeholder, options, children, ...rest } = this.props;
    const _placeholder = changeChineseToLocale(placeholder || '请填写', intl);
    const selectChildren = Array.isArray(options)
      ? options.map(({ label, value }) => (
          <Select.Option key={value} value={value}>
            {changeChineseToLocaleWithoutIntl(label)}
          </Select.Option>
        ))
      : children;
    return (
      <Select
        showSearch={showSearch}
        optionFilterProp="children"
        filterOption={(input, option) => {
          if (typeof option.props.children.toLowerCase === 'function') {
            return option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0;
          }
          return null;
        }}
        placeholder={_placeholder}
        {...rest}
        notFoundContent={
          Object.prototype.hasOwnProperty.call(this.props, 'notFoundContent') ? this.props.notFoundContent : undefined
        }
        onChange={this.handleChange}
        onSearch={this.props.onSearch}
      >
        {selectChildren}
      </Select>
    );
  }
}
// const OptionWithIntl = injectIntl(props => {
//   const { children, intl, ...rest } = props;
//   return (
//     <Select.Option {...rest}>
//       {typeof children === 'string' ? changeChineseToLocale(children, intl) : children}
//     </Select.Option>
//   );
// });

const SearchSelectWithIntl = injectIntl(SearchSelect);

SearchSelectWithIntl.Option = Select.Option;
SearchSelectWithIntl.OptGroup = Select.OptGroup;
SearchSelectWithIntl.SelectGroup = SelectGroup;

export default SearchSelectWithIntl;
