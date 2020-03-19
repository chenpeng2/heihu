// 用户工作部门的仓库选择
import React from 'react';
import debounce from 'lodash.debounce';
import _ from 'lodash';
import { injectIntl } from 'react-intl';

import HintForUserDepartmentSet from 'src/containers/user/baseComponent/hintForUserDeaprtmentSet';
import { openModal } from 'src/components';
import { getUserInfo } from 'src/services/auth/user';
import log from 'src/utils/log';
import { arrayIsEmpty } from 'src/utils/array';
import { changeChineseToLocale } from 'src/utils/locale/utils';

import Select from '../select';

const Option = Select.Option;

export const KEY_TYPE = {
  id: 'id',
  code: 'code',
};

type propsType = {
  id: any,
  style: mixed,
  params: mixed,
  onChange: () => {},
  disabled: boolean,
  keyType: string,
    intl: any,
};

/**
 * @description: 获取用户的工作部门
 *
 * @reason: 不从localStorage的userInfo中获取的原因是：业务上不能有延迟。防止工作部门被改变localStorage没有改变
 *
 *
 * @date: 2019/5/16 下午2:21
 */
export const getUserDepartments = async () => {
  const res = await getUserInfo().catch(e => log.error(e));
  const workDepartments = _.get(res, 'data.data.workDepartments');
  return arrayIsEmpty(workDepartments) ? [] : workDepartments.map(i => i && i.warehouse).filter(i => i);
};

class SearchSelect extends React.Component<propsType> {
  constructor(props) {
    super(props);
    this._handleSearch = debounce(this.handleSearch, 800);
    this.state = {
      data: [],
    };
  }

  componentDidMount() {
    if (!this.props.disabled) {
      this.handleSearch();
    }
  }

  handleSearch = () => {
    const { keyType } = this.props;
    getUserDepartments()
      .then(wareHouses => {
        if (arrayIsEmpty(wareHouses)) {
          openModal({
            title: '提示',
            width: 420,
            style: { height: 260 },
            children: <HintForUserDepartmentSet />,
            footer: null,
          });
        }

        // keyType决定了key是id还是code
        let data = wareHouses.map(i => {
          const { id, name } = i || {};
          return { key: id, label: name };
        });
        if (keyType === KEY_TYPE.code) {
          data = wareHouses.map(i => {
            const { code, name } = i || {};
            return { key: code, label: name };
          });
        }

        this.setState({
          data: data || [],
          fetching: false,
        });
      })
      .catch(e => log.error(e));
  };

  render() {
    const { data } = this.state;
    const { intl, style, disabled, ...rest } = this.props;

    return (
      <Select
        allowClear
        disabled={disabled}
        labelInValue
        placeholder={changeChineseToLocale('请选择', intl)}
        onSearch={this._handleSearch}
        style={{ width: 120, ...style }}
        filterOption
        maxTagCount={5}
        {...rest}
      >
        {data.map(i => {
          const { key, label, ...rest } = i || {};
          return (
            <Option data={i} key={`key-${key}`} value={key} title={label} {...rest}>
              {label}
            </Option>
          );
        })}
      </Select>
    );
  }
}

export default injectIntl(SearchSelect);
