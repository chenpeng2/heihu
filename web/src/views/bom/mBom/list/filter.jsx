import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { withRouter } from 'react-router-dom';
import FilterSortSearchBar from 'components/filterSortSearchBar';
import { getPathname, getQuery } from 'src/routes/getRouteParams';
import { Button, withForm, Icon, Input, Select, FormattedMessage, DatePicker } from 'components';
import { white } from 'src/styles/color/index';
import { arrayIsEmpty } from 'utils/array';
import { formatRangeUnix, formatUnixMoment } from 'utils/time';

const RangePicker = DatePicker.RangePicker;
const ItemList = FilterSortSearchBar.ItemList;
const Item = FilterSortSearchBar.Item;
const Option = Select.Option;
const filterGroup = {
  variable: 'status',
  labels: [
    {
      name: '全部',
      value: 'all',
    },
    {
      name: '启用',
      value: 1,
    },
    {
      name: '停用',
      value: 0,
    },
  ],
};

type Props = {
  push: () => {},
  children: Node,
  match: {},
  onFilter: () => {},
  form: {
    getFieldDecorator: () => {},
    getFieldsValue: () => {},
  },
};

class FilterForMBomList extends Component {
  props: Props;

  state = {};

  componentDidMount() {
    const { match, form } = this.props;
    const query = _.cloneDeep(getQuery(match));
    if (query.status === undefined || query.status === null) {
      query.status = 'all';
    }
    if (query && query.startDate && query.endDate) {
      query.createdTime = [formatUnixMoment(query.startDate), formatUnixMoment(query.endDate)];
    }
    form.setFieldsValue({ ...query });
  }

  reFetchData = p => {
    const { form, onFilter } = this.props;
    const { getFieldsValue } = form;
    const _value = { ...getFieldsValue(), ...p };
    if (_value.status === 'all') {
      _value.status = null;
    }
    _value.startDate = !arrayIsEmpty(_value.createdTime) ? formatRangeUnix(_value.createdTime)[0] : undefined;
    _value.endDate = !arrayIsEmpty(_value.createdTime) ? formatRangeUnix(_value.createdTime)[1] : undefined;
    _value.createdTime = undefined;
    if (typeof onFilter === 'function') onFilter({ ..._value, page: 1 });
  };

  render() {
    const { form } = this.props;
    const { getFieldDecorator } = form;

    return (
      <div
        className="search-select-input"
        onKeyDown={e => {
          if (e.keyCode === 13) {
            this.reFetchData();
          }
        }}
      >
        <FilterSortSearchBar style={{ backgroundColor: white, width: '100%' }} searchDisabled>
          <ItemList>
            <Item label="成品物料编号">
              {getFieldDecorator('materialCodeSearch')(<Input placeholder="关键字" className="select-input" />)}
            </Item>
            <Item label="成品物料名称">
              {getFieldDecorator('materialNameSearch')(<Input placeholder="关键字" className="select-input" />)}
            </Item>
            <Item label="版本号">
              {getFieldDecorator('version')(<Input placeholder="请输入完整版本号" className="select-input" />)}
            </Item>
            <Item label="发布状态">
              {getFieldDecorator('status', { initialValue: 'all' })(
                <Select size="default" style={{ marginLeft: 13, marginRight: 20, minWidth: 120 }}>
                  {filterGroup.labels.map(({ name, value }) => {
                    return (
                      <Option key={value} title={name}>
                        <FormattedMessage defaultMessage={name} />
                      </Option>
                    );
                  })}
                </Select>,
              )}
            </Item>
            <Item label="工艺路线编号">
              {getFieldDecorator('processRoutingCodeSearch')(<Input placeholder="关键字" className="select-input" />)}
            </Item>
            <Item label="工序编号">
              {getFieldDecorator('processCodeSearch')(<Input placeholder="关键字" className="select-input" />)}
            </Item>
            <Item label="工序名称">
              {getFieldDecorator('processNameSearch')(<Input placeholder="关键字" className="select-input" />)}
            </Item>
            <Item label="物料清单版本号">
              {getFieldDecorator('eBomVersion')(<Input placeholder="请输入完整版本号" className="select-input" />)}
            </Item>
            <Item label="物料编号">
              {getFieldDecorator('inputMaterialCodeSearch')(<Input placeholder="关键字" className="select-input" />)}
            </Item>
            <Item label="物料名称">
              {getFieldDecorator('inputMaterialNameSearch')(<Input placeholder="关键字" className="select-input" />)}
            </Item>
            <Item label="创建时间">{getFieldDecorator('createdTime')(<RangePicker />)}</Item>
          </ItemList>
          <Button
            icon="search"
            onClick={() => {
              this.reFetchData();
            }}
          >
            查询
          </Button>
        </FilterSortSearchBar>
      </div>
    );
  }
}

FilterForMBomList.contextTypes = {
  router: PropTypes.object,
};

export default withForm({}, withRouter(FilterForMBomList));
