import React, { Component } from 'react';
import _ from 'lodash';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';

import { FilterSortSearchBar, Icon, Select, withForm, Button, Input } from 'components';
import { setLocation } from 'utils/url';
import { getQuery } from 'src/routes/getRouteParams';
import { middleGrey, white, borderGrey } from 'src/styles/color/index';
import { getStoreHouseList } from 'src/services/knowledgeBase/storeHouse';

const ItemList = FilterSortSearchBar.ItemList;
const Item = FilterSortSearchBar.Item;

type Props = {
  form: {
    getFieldDecorator: () => {},
    getFieldsValue: () => {},
  },
  children: any,
  match: {
    location: {},
  },
};

class FilterForstoreHouse extends Component {
  props: Props;
  state = {
    data: null,
    allFields: null,
    loading: false,
  };

  componentDidMount() {
    const { form, match } = this.props;
    const queryMatch = getQuery(match);
    const { setFieldsValue, getFieldsValue } = form;
    const initialValue = { ...getFieldsValue(), ...queryMatch };
    setFieldsValue(initialValue);
    this.fetchAndSetData(initialValue);
  }

  fetchAndSetData = value => {
    const params = this.getFormatParams(_.cloneDeep(value));
    this.setState({ loading: true });
    getStoreHouseList(params)
      .then(res => {
        const data = res.data.data;
        this.setState({ data });
      })
      .finally(() => {
        this.setState({ loading: false });
      });
  };

  getFormatParams = value => {
    const params = value.value || value;
    if (
      !(params.status === '' || params.status) ||
      !((params.status && params.status.key) || (params.status.key === '' || params.status === ''))
    ) {
      params.status = {
        label: '启用',
        key: '1',
      };
      params.category = {
        label: '全部',
        key: '',
      };
    }
    Object.keys(params).forEach(prop => {
      if (params[prop]) {
        if (prop === 'status' || prop === 'category') {
          params[prop] = params[prop].key;
        }
      }
    });
    return params;
  };

  renderButton = () => {
    const { form } = this.props;
    const { getFieldsValue } = form;
    const { changeChineseToLocale } = this.context;

    return (
      <div>
        <Button
          style={{ width: 86 }}
          onClick={() => {
            const value = getFieldsValue();
            setLocation(this.props, p => ({ ...p, ...value, size: 10, page: 1 }));
            this.fetchAndSetData({ ...value, size: 10, page: 1 });
          }}
        >
          <Icon type={'search'} />
          {changeChineseToLocale('查询')}
        </Button>
        <span
          onClick={() => {
            form.resetFields();
            const value = getFieldsValue();
            setLocation(this.props, p => ({ ...p, ...value, size: 10, page: 1 }));
            this.fetchAndSetData({ ...value, size: 10, page: 1 });
          }}
          style={{ color: middleGrey, margin: '0px 10px', lineHeight: '28px', cursor: 'pointer' }}
        >
          {changeChineseToLocale('重置')}
        </span>
      </div>
    );
  };

  render() {
    const { form, children } = this.props;
    const { changeChineseToLocale } = this.context;
    const { data, loading } = this.state;
    const { getFieldDecorator } = form;

    const _children = React.cloneElement(children, { data, loading, refetch: this.fetchAndSetData });
    const field = [
      {
        label: '全部',
        key: '',
      },
      {
        label: '仓库',
        key: '1',
      },
      {
        label: '车间库',
        key: '2',
      },
    ];
    const status = [
      {
        label: '全部',
        key: '',
      },
      {
        label: '启用',
        key: '1',
      },
      {
        label: '停用',
        key: '0',
      },
    ];

    return (
      <div className="search-select-input">
        <FilterSortSearchBar
          style={{ backgroundColor: white, width: '100%', borderBottom: `1px solid ${borderGrey}` }}
          searchDisabled
        >
          <ItemList>
            <Item label="仓库">
              {getFieldDecorator('search')(
                <Input placeholder={'请输入搜索内容'} style={{ margin: '0 100px 0 5px', width: 200, height: 32 }} />,
              )}
            </Item>
            <Item label="区域">
              {getFieldDecorator('category', { initialValue: { key: '', label: '全部' } })(
                <Select allowClear placeholder="请选择" key="category" labelInValue>
                  {field.map(({ key, label }) => (
                    <Select.Option key={key} value={key}>
                      {changeChineseToLocale(label)}
                    </Select.Option>
                  ))}
                </Select>,
              )}
            </Item>
            <Item label="状态">
              {getFieldDecorator('status', { initialValue: { key: '1', label: '启用' } })(
                <Select allowClear placeholder="请选择" key="taskStatus" labelInValue>
                  {status.map(({ key, label }) => (
                    <Select.Option key={key} value={key}>
                      {changeChineseToLocale(label)}
                    </Select.Option>
                  ))}
                </Select>,
              )}
            </Item>
          </ItemList>
          {this.renderButton()}
        </FilterSortSearchBar>
        {_children}
      </div>
    );
  }
}

FilterForstoreHouse.contextTypes = {
  changeChineseToLocale: PropTypes.any,
};

export default withForm({}, withRouter(FilterForstoreHouse));
