import React, { Component } from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { FilterSortSearchBar, Icon, Select, withForm, Button, Input } from 'components';
import { setLocation } from 'utils/url';
import { getQuery } from 'src/routes/getRouteParams';
import { middleGrey, white, borderGrey } from 'src/styles/color/index';
import { getAreaList, getDisabledAreaList } from 'src/services/knowledgeBase/area';

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

class FilterForRelatedStorage extends Component {
  props: Props;
  state = {
    organization: [],
    loading: false,
    params: null,
  };

  componentDidMount() {
    const { form, match } = this.props;
    const queryMatch = getQuery(match);
    const { setFieldsValue } = form;
    const params = _.cloneDeep(queryMatch);
    this.fetchOrganizationData({ ...params, enabled: params.enabled || 'true' });
    queryMatch.enabled = {
      key: queryMatch.enabled || '',
      label: queryMatch.enabled ? (queryMatch.enabled === 'true' ? '启用' : '停用') : '全部',
    };
    setFieldsValue(queryMatch);
  }

  setDataId = data => {
    data.forEach(n => {
      n.id = `${n.type}:${n.id}`;
      if (n.children && n.children.length) {
        this.setDataId(n.children);
      }
    });
  };

  fetchOrganizationData = value => {
    this.setState({ loading: true });
    getAreaList(value)
      .then(res => {
        const data = _.cloneDeep(res.data.data);
        this.setDataId(data.children);
        this.setState({ organization: [data] });
      })
      .finally(() => {
        this.setState({ loading: false });
      });
  };

  fetchDisabledArea = () => {
    this.setState({ loading: true });
    getDisabledAreaList()
      .then(res => {
        const data = _.cloneDeep(res.data.data);
        this.setDataId(data);
        this.setState({ organization: data });
      })
      .finally(() => {
        this.setState({ loading: false });
      });
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
            let value = getFieldsValue();
            const params = {};
            if (!value.key && value.enabled && value.enabled.key === 'false') {
              params.enabled = 'false';
              this.fetchDisabledArea();
            } else {
              if (value.key) {
                const {
                  form: { setFieldsValue },
                } = this.props;
                value = { key: value.key, enabled: { label: '全部', key: '' } };
                setFieldsValue(value);
              }
              Object.keys(value).forEach(prop => {
                if (value[prop]) {
                  if (prop === 'key') {
                    params.key = value[prop];
                  }
                  if (prop === 'enabled') {
                    params.enabled = value.enabled.key !== 'false' ? value[prop].key : '';
                  }
                }
              });
              this.setState({ params });
              this.fetchOrganizationData({ ...params });
            }
            setLocation(this.props, () => params);
          }}
        >
          <Icon type={'search'} />
          {changeChineseToLocale('查询')}
        </Button>
        <span
          onClick={() => {
            form.resetFields();

            let value = getFieldsValue();
            const params = {};
            if (!value.key && value.enabled && value.enabled.key === 'false') {
              params.enabled = 'false';
              this.fetchDisabledArea();
            } else {
              if (value.key) {
                const {
                  form: { setFieldsValue },
                } = this.props;
                value = { key: value.key, enabled: { label: '全部', key: '' } };
                setFieldsValue(value);
              }
              Object.keys(value).forEach(prop => {
                if (value[prop]) {
                  if (prop === 'key') {
                    params.key = value[prop];
                  }
                  if (prop === 'enabled') {
                    params.enabled = value.enabled.key !== 'false' ? value[prop].key : '';
                  }
                }
              });
              this.setState({ params });
              this.fetchOrganizationData({ ...params });
            }
            setLocation(this.props, () => params);
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
    const { loading, organization, params } = this.state;
    const { changeChineseToLocale } = this.context;
    const { getFieldDecorator } = form;
    const _children = React.cloneElement(children, {
      data: organization,
      loading,
      params,
      refetch: this.fetchOrganizationData,
      getEditedOrganizationData: this.getEditedOrganizationData,
    });
    const status = [
      {
        label: '全部',
        key: '',
      },
      {
        label: '启用',
        key: 'true',
      },
      {
        label: '停用',
        key: 'false',
      },
    ];

    return (
      <div className="search-select-input">
        <FilterSortSearchBar
          style={{ backgroundColor: white, width: '100%', borderBottom: `1px solid ${borderGrey}`, marginBottom: 20 }}
          searchDisabled
        >
          <ItemList>
            <Item label="区域">{getFieldDecorator('key')(<Input placeholder="请输入区域名称或区域编码" />)}</Item>
            <Item label="状态">
              {getFieldDecorator('enabled', {
                initialValue: {
                  label: '启用',
                  key: 'true',
                },
              })(
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

FilterForRelatedStorage.contextTypes = {
    changeChineseToLocale: PropTypes.any,
};

export default withForm({}, withRouter(FilterForRelatedStorage));
