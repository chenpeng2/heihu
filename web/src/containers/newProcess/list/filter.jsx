import React, { Component } from 'react';
import { Input, Select } from 'antd';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';

import { Button, withForm, Icon, FormattedMessage } from 'src/components';
import FilterSortSearchBar from 'src/components/filterSortSearchBar';
import { white, middleGrey } from 'src/styles/color/index';
import { changeChineseToLocaleWithoutIntl } from 'utils/locale/utils';
import { PROCESS_STATUS } from '../constant';

const ItemList = FilterSortSearchBar.ItemList;
const Item = FilterSortSearchBar.Item;
const Option = Select.Option;

type Props = {
  push: () => {},
  children: Node,
  match: {},
  form: {
    getFieldDecorator: () => {},
    getFieldsValue: () => {},
  },
  fetchData: () => {},
};

class FilterForProcessList extends Component {
  props: Props;

  state = {};

  getButton = () => {
    const { form, fetchData } = this.props;
    const { getFieldsValue } = form || {};

    return (
      <Button
        icon="search"
        onClick={() => {
          const value = getFieldsValue();

          if (typeof fetchData === 'function') fetchData({ ...value, page: 1 });
        }}
      >
        查询
      </Button>
    );
  };

  renderStatusSelect = () => {
    const Options = Object.entries(PROCESS_STATUS).map(([value, name]) => {
      return (
        <Option value={value} key={value}>
          <FormattedMessage defaultMessage={name} />
        </Option>
      );
    });
    Options.unshift(
      <Option value={null} key={'all'}>
        <FormattedMessage defaultMessage={'全部'} />
      </Option>,
    );

    return (
      <Select size="default" style={{ marginLeft: 13, marginRight: 20, minWidth: 120 }}>
        {Options}
      </Select>
    );
  };

  render() {
    const { form, fetchData } = this.props;
    const { getFieldDecorator, resetFields, getFieldsValue } = form || {};

    return (
      <div
        onKeyDown={e => {
          if (e.keyCode === 13) {
            const value = getFieldsValue();
            if (typeof fetchData === 'function') fetchData({ ...value, page: 1 });
          }
        }}
      >
        <FilterSortSearchBar style={{ backgroundColor: white, width: '100%' }} searchDisabled>
          <ItemList>
            <Item label="编号">{getFieldDecorator('code')(<Input className="select-input" />)}</Item>
            <Item label="名称">{getFieldDecorator('name')(<Input className="select-input" />)}</Item>
            <Item label="状态">{getFieldDecorator('status', { initialValue: null })(this.renderStatusSelect())}</Item>
          </ItemList>
          <div>
            {this.getButton()}
            <span
              style={{ cursor: 'pointer', verticalAlign: 'middle', margin: '0px 10px', color: middleGrey }}
              onClick={() => {
                resetFields();
                if (typeof fetchData === 'function') fetchData({ code: null, name: null, status: null, page: 1 });
              }}
            >
              {changeChineseToLocaleWithoutIntl('重置')}
            </span>
          </div>
        </FilterSortSearchBar>
      </div>
    );
  }
}

FilterForProcessList.contextTypes = {
  router: PropTypes.object,
};

export default withForm({}, withRouter(FilterForProcessList));
