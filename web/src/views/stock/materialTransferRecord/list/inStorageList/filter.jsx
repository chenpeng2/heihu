import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import {
  openModal,
  Button,
  DatePicker,
  Select,
  withForm,
  FilterSortSearchBar,
  StorageSelect,
  Searchselect,
  Input,
} from 'src/components';
import { getStorageIds } from 'src/components/select/storageSelect/storageSelect';
import { getUserInfo } from 'src/services/auth/user';
import { IN_STORAGE_TYPES } from 'src/containers/materialTransferRecord/util';
import { middleGrey, error } from 'src/styles/color';
import moment, { formatRangeUnix, formatRangeTimeToMoment } from 'src/utils/time';
import { arrayIsEmpty } from 'src/utils/array';
import { getParams } from 'src/utils/url';
import HintForUserDepartmentSet from 'src/containers/user/baseComponent/hintForUserDeaprtmentSet';

import { getInStorageFilterFromLocalStorage, saveInStorageFilterInLocalStorage } from '../../utils';

const Item = FilterSortSearchBar.Item;
const ItemList = FilterSortSearchBar.ItemList;
const Option = Select.Option;
export const formatFilterData = value => {
  if (!value) return null;
  const { type, storage, outStorage, time, material, ...rest } = value;

  let _time = {};
  if (time) {
    const [createdAtFrom, createdAtTill] = formatRangeUnix(time);
    _time = { createdAtFrom, createdAtTill };
  }

  const _value = {
    type: type === 'all' ? null : type,
    ..._time,
    ...rest,
  };
  if (!arrayIsEmpty(storage)) {
    const { houseId, secondStorageIds, firstStorageId } = getStorageIds(storage) || {};
    _value.houseId = houseId;
    _value.firstStorageId = firstStorageId;
    _value.secondStorageId = secondStorageIds;
  }
  if (!arrayIsEmpty(outStorage)) {
    const { houseId, secondStorageIds, firstStorageId } = getStorageIds(outStorage) || {};
    _value.outHouseId = houseId;
    _value.outFirstStorageId = firstStorageId;
    _value.outSecondStorageId = secondStorageIds;
  }
  if (material) {
    _value.materialCode = material.key;
  }
  return _value;
};

class Filter extends Component {
  state = {};

  async componentDidMount() {
    const { fetchData, form } = this.props;
    await this.setUserWareHouseIds(() => {
      this.setFormValue();
      form.validateFields((err, value) => {
        if (err) return;
        if (typeof fetchData === 'function') {
          fetchData({ page: 1 }, value);
          saveInStorageFilterInLocalStorage(value);
        }
      });
    });
  }

  setUserWareHouseIds = async cb => {
    const res = await getUserInfo();
    const workDepartments = _.get(res, 'data.data.workDepartments');
    const wareHouses = Array.isArray(workDepartments) ? workDepartments.map(i => i && i.warehouse).filter(i => i) : [];
    if (!Array.isArray(wareHouses) || !wareHouses.length) {
      openModal({
        title: '提示',
        width: 420,
        style: { height: 260 },
        onCloseCb: () => {
          if (typeof cb === 'function') cb();
        },
        children: <HintForUserDepartmentSet />,
        footer: null,
      });
    } else {
      const data = wareHouses
        .map(i => {
          const { code } = i || {};
          return code;
        })
        .filter(i => i);

      this.setState(
        {
          userWareHouseCodes: data,
          userWareHouses: wareHouses,
        },
        () => {
          if (typeof cb === 'function') cb();
        },
      );
    }
  };

  setFormValue = () => {
    const { form } = this.props;

    const { queryObj } = getParams();
    const filter = _.get(queryObj, 'table2.filter');

    const filterValueInLocalStorage = getInStorageFilterFromLocalStorage();

    if (filter) {
      const { time, ...rest } = filter || {};
      form.setFieldsValue({
        ...rest,
        time: formatRangeTimeToMoment(time),
      });
    } else if (filterValueInLocalStorage) {
      this.setLocalStorageValue();
    } else {
      this.setInitialValue();
    }
  };

  setLocalStorageValue = () => {
    const filterValueInLocalStorage = getInStorageFilterFromLocalStorage();
    const { form } = this.props;

    if (filterValueInLocalStorage) {
      const { time, ...rest } = filterValueInLocalStorage;
      form.setFieldsValue({
        time: formatRangeTimeToMoment(time),
        ...rest,
      });
    }
  };

  setInitialValue = cb => {
    const { form } = this.props;
    const { userWareHouses } = this.state;

    form.setFieldsValue({
      type: 'all',
      time: [moment().subtract(30, 'days'), moment()],
      storage:
        Array.isArray(userWareHouses) && userWareHouses.length === 1
          ? userWareHouses
              .map(i => {
                const { id, code } = i || {};
                return id && code ? `${id},${code},1` : undefined;
              })
              .filter(i => i)
          : [],
    });
    if (typeof cb === 'function') cb();
  };

  renderInStorageTypeSelect = props => {
    const { changeChineseToLocale } = this.context;
    const options = Object.values(IN_STORAGE_TYPES).map(i => {
      const { name, value } = i || {};
      return <Option value={value}>{changeChineseToLocale(name)}</Option>;
    });

    return (
      <Select {...props}>
        <Option value={'all'}>{changeChineseToLocale('全部')}</Option>
        {options}
      </Select>
    );
  };

  renderError = errors => {
    if (Array.isArray(errors) && errors.length) {
      return (
        <div style={{ color: error, marginTop: 5 }}>
          {errors.map(i => {
            return <div>{i}</div>;
          })}
        </div>
      );
    }
    return null;
  };

  render() {
    const { form, fetchData, match } = this.props;
    const { userWareHouseCodes, isReset } = this.state;
    const { changeChineseToLocale } = this.context;

    const { getFieldDecorator, validateFieldsAndScroll, getFieldError, getFieldsValue, resetFields } = form || {};
    const typeErrors = getFieldError('type');
    const storageErrors = getFieldError('storage');
    const timeErrors = getFieldError('time');

    return (
      <FilterSortSearchBar searchDisabled>
        <ItemList>
          <Item label={'入库类型'} required>
            <div>
              {getFieldDecorator('type', { rules: [{ required: true, message: changeChineseToLocale('出库类型必填') }] })(
                this.renderInStorageTypeSelect({ style: { width: '100%' } }),
              )}
              {this.renderError(typeErrors)}
            </div>
          </Item>
          <Item label={'入库仓位'} required>
            <div>
              {getFieldDecorator('storage', {
                rules: [{ required: true, message: changeChineseToLocale('入库仓位必填') }],
              })(
                <StorageSelect
                  isReset={isReset}
                  match={match}
                  params={{
                    warehouseCodes: Array.isArray(userWareHouseCodes)
                      ? decodeURIComponent(userWareHouseCodes.join(','))
                      : null,
                  }}
                />,
              )}
              {this.renderError(storageErrors)}
            </div>
          </Item>
          <Item label={'出库仓位'}>
            {getFieldDecorator('outStorage')(<StorageSelect isReset={isReset} match={match} />)}
          </Item>
          <Item label={'操作时间'} required>
            <div>
              {getFieldDecorator('time', {
                rules: [
                  { required: true, message: changeChineseToLocale('操作时间必填') },
                  {
                    validator: (rule, value, callback) => {
                      if (Array.isArray(value) && value.length === 2) {
                        if (
                          moment(value[1])
                            .subtract(180, 'days')
                            .isAfter(value[0])
                        ) {
                          callback(changeChineseToLocale('操作时间跨度不能超过180天'));
                        }
                      }
                      callback();
                    },
                  },
                ],
              })(<DatePicker.RangePicker style={{ width: '100%' }} />)}
              {this.renderError(timeErrors)}
            </div>
          </Item>
          <Item label="物料">
            {getFieldDecorator('material')(
              <Searchselect
                placeholder={changeChineseToLocale('请选择')}
                params={{ status: 1 }}
                type="materialBySearch"
              />,
            )}
          </Item>
          <Item label="二维码">
            {getFieldDecorator('qrcode')(<Input placeholder={changeChineseToLocale('请输入')} />)}
          </Item>
          <Item label="嵌套二维码">
            {getFieldDecorator('containerQrcode')(<Input placeholder={changeChineseToLocale('请输入')} />)}
          </Item>
        </ItemList>
        <Button
          icon="search"
          onClick={() => {
            validateFieldsAndScroll((err, value) => {
              if (err) return null;

              if (sensors) {
                sensors.track('web_stock_materialTransferRecordList_search', {
                  FilterCondition: value,
                });
              }

              if (typeof fetchData === 'function') {
                fetchData({ page: 1 }, value);
                saveInStorageFilterInLocalStorage(value);
              }
            });
          }}
        >
          查询
        </Button>
        <span
          style={{ color: middleGrey, marginLeft: 10, paddingTop: 5, cursor: 'pointer' }}
          onClick={() => {
            resetFields();

            this.setInitialValue(() => {
              this.setState({ isReset: true }, () => {
                this.setState({ isReset: false });
              });

              form.validateFieldsAndScroll((err, value) => {
                if (err) return;

                fetchData({ page: 1 }, value);
                saveInStorageFilterInLocalStorage(value);
              });
            });
          }}
        >
          {changeChineseToLocale('重置')}
        </span>
      </FilterSortSearchBar>
    );
  }
}

Filter.propTypes = {
  style: PropTypes.object,
  form: PropTypes.any,
  fetchData: PropTypes.any,
  match: PropTypes.any,
};

Filter.contextTypes = {
  changeChineseToLocale: PropTypes.any,
};

export default withForm({}, Filter);
