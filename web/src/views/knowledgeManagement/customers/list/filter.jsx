import React, { Component } from 'react';
import _ from 'lodash';
import { withRouter } from 'react-router-dom';
import {
  FilterSortSearchBar,
  withForm,
  Input,
  Select,
  Button,
  SimpleTable,
  OpenModal,
  Link,
  Badge,
  message,
  FormattedMessage,
} from 'components';
import { getQuery } from 'src/routes/getRouteParams';

const ItemList = FilterSortSearchBar.ItemList;
const Item = FilterSortSearchBar.Item;
const Option = Select.Option;

type props = {
  fetchData: () => {},
  form: {},
  match: {},
};

class CustomerFilter extends Component<props> {
  state = {};

  componentDidMount() {
    const { match, form } = this.props;
    const lastQuery = getQuery(match);
    const _filter = _.get(lastQuery, '_filter');
    console.log(_filter);
    if (_filter) {
      if (!_filter.status) {
        _filter.status = 'all';
      }
      form.setFieldsValue(_filter);
    } else {
      form.setFieldsValue({ status: 'all' });
    }
  }

  render() {
    const { fetchData, form } = this.props;
    const { getFieldDecorator, getFieldsValue } = form;
    return (
      <FilterSortSearchBar searchFn={() => fetchData({ page: 1, ...getFieldsValue() })}>
        <ItemList>
          <Item label="客户编号">{getFieldDecorator('idSearch')(<Input />)}</Item>
          <Item label="客户名称">{getFieldDecorator('nameSearch')(<Input />)}</Item>
          <Item label="状态">
            {getFieldDecorator('status')(
              <Select>
                {[{ label: '全部', key: 'all' }, { label: '启用中', key: '1' }, { label: '停用中', key: '0' }].map(
                  ({ label, key }) => (
                    <Option key={key}>
                      <FormattedMessage defaultMessage={label} />
                    </Option>
                  ),
                )}
              </Select>,
            )}
          </Item>
        </ItemList>
        <Button
          icon="search"
          onClick={() => {
            fetchData({ page: 1, ...getFieldsValue() });
          }}
        >
          查询
        </Button>
      </FilterSortSearchBar>
    );
  }
}

export default withRouter(CustomerFilter);
