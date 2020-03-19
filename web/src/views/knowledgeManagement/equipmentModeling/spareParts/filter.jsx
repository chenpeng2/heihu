import React, { Component } from 'react';
import {
  FilterSortSearchBar,
  Button,
  Select,
  Icon,
  Input,
} from 'components';
import { withRouter } from 'react-router-dom';
import { setLocation } from 'utils/url';
import { getQuery } from 'src/routes/getRouteParams';
import withForm from 'components/form';
import { white, borderGrey } from 'src/styles/color/index';

const ItemList = FilterSortSearchBar.ItemList;
const Item = FilterSortSearchBar.Item;
const status = [
  {
    label: '全部',
    key: '',
  },
  {
    label: '启用中',
    key: '1',
  },
  {
    label: '停用中',
    key: '0',
  },
];

type Props = {
  form: any,
  match: {},
  router: any,
  fetchData: () => {},
};

class SparePartsFilter extends Component {
  props: Props;
  state = {};

  componentDidMount() {
    const { form, match } = this.props;
    const queryMatch = getQuery(match);
    if (queryMatch.enableStatus) {
      queryMatch.enableStatus = queryMatch.enableStatus === '1' ?
        { label: '启用中', value: '1' }
      : { label: '停用中', value: '0' };
    } else {
      queryMatch.enableStatus = { label: '启用中', value: '1' };
    }
    form.setFieldsValue(queryMatch);
  }

  renderButton = () => {
    const { form, fetchData } = this.props;
    const { getFieldsValue } = form;
    return (
      <div>
        <Button
          onClick={() => {
            const value = getFieldsValue();
            value.enableStatus = value.enableStatus.key;
            setLocation(this.props, p => ({ ...p, ...value, page: 1 }));
            fetchData({ ...value, page: 1 }, {});
          }}
        >
          <Icon type={'search'} />
          查询
        </Button>
      </div>
    );
  };

  render() {
    const { form } = this.props;
    const { getFieldDecorator } = form;

    return (
      <div style={{ borderBottom: `1px solid ${borderGrey}` }}>
        <FilterSortSearchBar style={{ backgroundColor: white, width: '100%' }} searchDisabled>
          <ItemList>
            <Item label="备件编号">
              {getFieldDecorator('searchCode')(<Input placeholder={'请输入'} />)}
            </Item>
            <Item label="备件名称">
              {getFieldDecorator('searchName')(<Input placeholder={'请输入'} />)}
            </Item>
            <Item label="状态">{getFieldDecorator('enableStatus', { initialValue: { key: '1', label: '启用' } })(
              <Select allowClear placeholder="请选择" key="status" labelInValue>
                {status.map(({ key, label }) => (
                  <Select.Option key={key} value={key}>
                    {label}
                  </Select.Option>
                ))}
              </Select>,
            )}</Item>
          </ItemList>
          {this.renderButton()}
        </FilterSortSearchBar>
      </div>
    );
  }
}

export default withRouter(withForm({}, SparePartsFilter));
