import React, { Component } from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';

import {
  DatePicker,
  Input,
  Link,
  Button,
  Select,
  withForm,
  FilterSortSearchBar,
  FormattedMessage,
} from 'src/components';
import { queryMaterialCustomField } from 'src/services/bom/material';
import log from 'src/utils/log';
import { white } from 'src/styles/color/index';
import { getParams } from 'src/utils/url';
import { formatRangeUnix, formatRangeTimeToMoment } from 'src/utils/time';
import { changeChineseToLocaleWithoutIntl } from 'src/utils/locale/utils';
import SearchSelectForMaterialType, {
  EMPTY_OPTION,
} from 'src/containers/materialType/baseComponent/searchSelectForMaterialType';

const ItemList = FilterSortSearchBar.ItemList;
const Item = FilterSortSearchBar.Item;
const { Option } = Select;
const RangePicker = DatePicker.RangePicker;

const statusGroup = [
  {
    key: -1,
    label: '全部',
  },
  {
    key: 1,
    label: '启用中',
  },
  {
    key: 0,
    label: '停用中',
  },
];

type Props = {
  children: Node,
  form: any,
  fetchData: () => {},
  match: {
    location: {
      query: {},
      search: {},
    },
  },
};

class FilterForMaterialList extends Component {
  props: Props;

  state = {
    materialCustomFields: null,
  };

  componentDidMount() {
    this.fetchAndSetMaterialCustomFields(this.setInitialFormValue);
  }

  setInitialFormValue = () => {
    const { queryObj } = getParams();
    const filter = _.get(queryObj, 'filter');
    const { createdTime, ...rest } = filter || {};

    this.props.form.setFieldsValue({ createdTime: formatRangeTimeToMoment(createdTime), ...rest });
  };

  fetchAndSetMaterialCustomFields = async cb => {
    try {
      const res = await queryMaterialCustomField();
      const materialCustomFields = _.get(res, 'data.data');

      this.setState(
        {
          materialCustomFields,
        },
        cb,
      );
    } catch (e) {
      log.error(e);
    }
  };

  onReset = () => {
    const { fetchData, form } = this.props;
    form.resetFields();
    const values = form.getFieldsValue();
    if (typeof fetchData === 'function') fetchData({ filter: values, page: 1 });
  };

  // 生成自定义字段的搜索框
  materialCustomFieldsSearch = () => {
    const { materialCustomFields } = this.state;
    const { form } = this.props;
    const { getFieldDecorator } = form || {};

    if (Array.isArray(materialCustomFields)) {
      return (
        <React.Fragment>
          {materialCustomFields.map((i, index) => {
            const { keyName } = i || {};

            getFieldDecorator(`customFields[${index}].keyName`, { initialValue: keyName });

            return (
              <Item
                labelTextStyle={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  wordBreak: 'break-all',
                  WebkitBoxOrient: 'vertical',
                  WebkitLineClamp: 1,
                }}
                label={keyName}
              >
                {getFieldDecorator(`customFields[${index}].keyValue`, { initialValue: null })(
                  <Input
                    onPressEnter={() => {
                      this.reFetchData();
                    }}
                  />,
                )}
              </Item>
            );
          })}
        </React.Fragment>
      );
    }
  };

  reFetchData = () => {
    const { form, fetchData } = this.props;
    const { getFieldsValue } = form;
    const value = getFieldsValue();

    if (typeof fetchData === 'function') fetchData({ filter: value, page: 1 });
  };

  render() {
    const { form } = this.props;
    const { getFieldDecorator } = form;

    return (
      <div
        onKeyDown={e => {
          if (e.keyCode === 13) {
            this.reFetchData();
          }
        }}
      >
        <FilterSortSearchBar style={{ backgroundColor: white, width: '100%' }} searchDisabled>
          <ItemList>
            <Item label="编号">{getFieldDecorator('codeLike')(<Input placeholder="请输入物料编号" />)}</Item>
            <Item label="名称">{getFieldDecorator('name')(<Input placeholder="请输入物料名称" />)}</Item>
            <Item label="状态">
              {getFieldDecorator('status', {
                initialValue: { key: '-1', label: '全部' },
              })(
                <Select labelInValue>
                  {statusGroup.map(({ label, key }) => (
                    <Option key={key}>{changeChineseToLocaleWithoutIntl(label)}</Option>
                  ))}
                </Select>,
              )}
            </Item>
            <Item label="物料类型">
              {getFieldDecorator('materialTypeId', {})(
                <SearchSelectForMaterialType needEmptyOption labelInValue params={{ status: 1 }} />,
              )}
            </Item>
            {this.materialCustomFieldsSearch()}
            <Item label="质检方案">
              {getFieldDecorator('hasQcConfig')(
                <Select allowClear style={{ width: '100%' }}>
                  <Option value>
                    <FormattedMessage defaultMessage={'有'} />
                  </Option>
                  <Option value={false}>
                    <FormattedMessage defaultMessage={'无'} />
                  </Option>
                </Select>,
              )}
            </Item>
            <Item label="创建时间">{getFieldDecorator('createdTime')(<RangePicker style={{ width: '100%' }} />)}</Item>
          </ItemList>
          <Button
            icon="search"
            style={{ float: 'right', width: 86 }}
            onClick={() => {
              this.reFetchData();
            }}
          >
            查询
          </Button>
          <Link
            style={{
              lineHeight: '30px',
              height: '28px',
              color: '#8C8C8C',
              paddingLeft: 16,
            }}
            onClick={this.onReset}
          >
            重置
          </Link>
        </FilterSortSearchBar>
        {this.props.children}
      </div>
    );
  }
}

FilterForMaterialList.contextTypes = {
  router: PropTypes.object,
};

export const formatFilterValue = value => {
  const { createdTime, customFields, name, codeLike, status, materialTypeId, ...rest } = value || {};
  const customFieldsFiltered =
    Array.isArray(customFields) && customFields.length ? customFields.filter(e => e.keyValue) : [];

  let statusKey;
  if (status && status.key !== '-1') {
    statusKey = status.key;
  }

  const [startDate, endDate] = formatRangeUnix(createdTime) || [];

  return {
    name,
    codeLike,
    status: statusKey,
    materialTypeIds: materialTypeId && materialTypeId.key !== EMPTY_OPTION ? materialTypeId.key : undefined,
    hasMaterialType: materialTypeId && materialTypeId.key === EMPTY_OPTION ? false : null,
    customFields: customFieldsFiltered.length ? customFieldsFiltered : undefined,
    startDate,
    endDate,
    ...rest,
  };
};

export default withForm({}, withRouter(FilterForMaterialList));
