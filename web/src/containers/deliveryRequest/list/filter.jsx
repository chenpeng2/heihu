import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { injectIntl } from 'react-intl';

import { changeTextLanguage } from 'src/utils/locale/utils';
import { DatePicker, Select, Input, Button, FilterSortSearchBar, withForm } from 'src/components';
import UserDepartmentWareHouseSelect, {
  getUserDepartments,
} from 'src/components/select/userDeparetmentWareHouseSelect';
import { error, middleGrey, white } from 'src/styles/color';
import log from 'src/utils/log';
import { getSearchInLocation } from 'src/routes/getRouteParams';
import moment, { formatRangeUnix } from 'src/utils/time';
import { arrayIsEmpty } from 'src/utils/array';

import { DELIVERY_REQUEST_STATUS } from '../util';

const { Option } = Select;
const { RangePicker } = DatePicker;
const ItemList = FilterSortSearchBar.ItemList;
const Item = FilterSortSearchBar.Item;

const defaultValueForState = [
  DELIVERY_REQUEST_STATUS.create.value,
  DELIVERY_REQUEST_STATUS.issued.value,
  DELIVERY_REQUEST_STATUS.execute.value,
];
const defaultValueForCreate = [moment(), moment().add(30, 'days')];

class Filter extends Component {
  state = {
    wareHouseError: null,
  };

  async componentDidMount() {
    const { form } = this.props;
    const { setFieldsValue } = form || {};

    const { filter } = getSearchInLocation();

    if (!filter || !filter.wareHouses) {
      // 没有参数的时候将用户的工作部门的仓库作为搜索条件
      try {
        const initialValue = await this.getInitialValue();
        setFieldsValue(initialValue);
        await this.reFetchData(initialValue);
      } catch (e) {
        log.error(e);
      }
    } else {
      // 有搜索参数的时候用搜索参数
      const { createTime, ...rest } = filter;
      setFieldsValue({
        createTime:
          Array.isArray(createTime) && createTime.length === 2 ? [moment(createTime[0]), moment(createTime[1])] : null, // 为RangePicker设置初始值的时候需要是moment格式的数据，不可以是字符串
        ...rest,
      });
      await this.reFetchData(filter);
    }
  }

  getInitialValue = async () => {
    try {
      const workDepartments = await getUserDepartments();
      if (!arrayIsEmpty(workDepartments)) {
        const wareHouses = workDepartments.map(i => {
          const { id, name } = i || {};
          return { key: id, label: name };
        });
        return { wareHouses: wareHouses.slice(0, 10), status: defaultValueForState, createTime: defaultValueForCreate };
      }
      return null;
    } catch (e) {
      log.error(e);
    }
  };

  renderStatusSelect = props => {
    const { changeChineseToLocale } = this.context;
    const options = Object.values(DELIVERY_REQUEST_STATUS).map(i => {
      const { name, value } = i || {};
      return <Option value={value}> {changeChineseToLocale(name)}</Option>;
    });

    return (
      <Select mode={'multiple'} allowClear {...props}>
        {options}
      </Select>
    );
  };

  formatFormData = value => {
    if (!value) return {};

    const { wareHouses, status, createTime, code } = value || {};
    const res = { status: null, storageIds: null, createTime: null, createBegin: null, code: null };

    // 状态
    res.status = Array.isArray(status) ? status.join(',') : null;

    // 仓库id
    if (Array.isArray(wareHouses) && wareHouses.length) {
      res.storageIds = wareHouses
        .map(i => i && i.key)
        .filter(i => i)
        .join(',');
    }

    // 创建时间
    const rangeTime = formatRangeUnix(createTime);
    if (Array.isArray(rangeTime) && rangeTime.length === 2) {
      res.createdEnd = rangeTime[1];
      res.createdBegin = rangeTime[0];
    }

    // 编号
    res.code = code;

    // page
    res.page = 1;

    return res;
  };

  reFetchData = value => {
    const { fetchData } = this.props;
    if (fetchData && typeof fetchData === 'function') fetchData(this.formatFormData(value), value);
  };

  render() {
    const { form, intl } = this.props;
    const { wareHouseError } = this.state;
    const { getFieldDecorator, resetFields, validateFields, setFieldsValue } = form || {};

    return (
      <div>
        <FilterSortSearchBar style={{ backgroundColor: white, width: '100%' }} searchDisabled>
          <ItemList>
            <Item required label={'执行仓库'} intlId={'key1689'}>
              <div>
                {getFieldDecorator('wareHouses', {
                  rules: [
                    {
                      required: true,
                      message: '执行仓库必填',
                    },
                  ],
                })(<UserDepartmentWareHouseSelect style={{ width: '100%' }} mode={'multiple'} />)}
                {wareHouseError ? (
                  <div style={{ color: error }}>
                    {wareHouseError
                      .map(i => i && i.message)
                      .filter(i => i)
                      .join(',')}
                  </div>
                ) : null}
              </div>
            </Item>
            <Item label={'发运申请编号'} intlId={'key1514'}>
              {getFieldDecorator('code')(<Input />)}
            </Item>
            <Item label={'创建时间'} intlId={'key2434'}>
              {getFieldDecorator('createTime')(<RangePicker />)}
            </Item>
            <Item intlId={'key2105'} label="执行状态">
              {getFieldDecorator('status')(this.renderStatusSelect())}
            </Item>
          </ItemList>
          <Button
            icon="search"
            onClick={() => {
              validateFields((err, value) => {
                if (!err) {
                  if (sensors) {
                    sensors.track('web_stock_deliveryRequest_search', {
                      FilterCondition: value,
                    });
                  }
                  this.reFetchData(value);
                  this.setState({ wareHouseError: null });
                } else if (err.wareHouses) {
                  this.setState({ wareHouseError: err.wareHouses.errors });
                }
              });
            }}
          >
            {changeTextLanguage(intl, { id: 'key3196', defaultMessage: '查询' })}
          </Button>
          <span
            style={{ color: middleGrey, marginLeft: 10, paddingTop: 5, cursor: 'pointer' }}
            onClick={async () => {
              resetFields();

              this.setState({ wareHouseError: null }, async () => {
                const initialValue = await this.getInitialValue();
                setFieldsValue(initialValue);
                this.reFetchData(initialValue);
              });
            }}
          >
            {changeTextLanguage(intl, { id: 'key226', defaultMessage: '重置' })}
          </span>
        </FilterSortSearchBar>
      </div>
    );
  }
}

Filter.propTypes = {
  style: PropTypes.object,
  fetchData: PropTypes.any,
  form: PropTypes.any,
  match: PropTypes.any,
  intl: PropTypes.any,
};

Filter.contextTypes = {
  changeChineseToLocale: PropTypes.any,
};

export default withForm({}, injectIntl(Filter));
