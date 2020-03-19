import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { arrayIsEmpty } from 'src/utils/array';
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
import { getUserInfo } from 'src/services/auth/user';
import { getStorageIds } from 'src/components/select/storageSelect/storageSelect';
import { OUT_STORAGE_TYPES } from 'src/containers/materialTransferRecord/util';
import { middleGrey, error } from 'src/styles/color';
import { getParams } from 'src/utils/url';
import moment, { formatRangeUnix, formatRangeTimeToMoment } from 'src/utils/time';
import HintForUserDepartmentSet from 'src/containers/user/baseComponent/hintForUserDeaprtmentSet';

import { getOutStorageFilterFromLocalStorage, saveOutStorageFilterInLocalStorage } from '../../utils';

const Item = FilterSortSearchBar.Item;
const ItemList = FilterSortSearchBar.ItemList;
const Option = Select.Option;
export const formatFilterData = value => {
  if (!value) return null;
  const { type, storage, time, material, ...rest } = value;
  let _time = {};
  if (time) {
    const [createdAtFrom, createdAtTill] = formatRangeUnix(time);
    _time = { createdAtFrom, createdAtTill };
  }
  const _value = { type: type === 'all' ? null : type, ..._time, ...rest };
  if (!arrayIsEmpty(storage)) {
    const { houseId, secondStorageIds, firstStorageId } = getStorageIds(storage) || {};
    _value.houseId = houseId;
    _value.firstStorageId = firstStorageId;
    _value.secondStorageId = secondStorageIds;
  }
  if (material) {
    _value.materialCode = material.key;
  }
  return _value;
};

class Filter extends Component {
  state = {
    userWareHouseIds: null,
  };

  async componentDidMount() {
    const { fetchData, form } = this.props;
    await this.setUserWareHouseIds(() => {
      this.setFormValue();
      form.validateFields((err, value) => {
        if (err) return;
        if (typeof fetchData === 'function') {
          fetchData({ page: 1 }, value);
          saveOutStorageFilterInLocalStorage(value);
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
      const codes = wareHouses
        .map(i => {
          const { code } = i || {};
          return code;
        })
        .filter(i => i);

      this.setState(
        {
          userWareHouseCodes: codes,
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

    const filter = _.get(queryObj, 'table1.filter');
    const filterValueInLocalStorage = getOutStorageFilterFromLocalStorage();

    if (filter) {
      const { time, ...rest } = filter || {};
      form.setFieldsValue({
        ...rest,
        time: Array.isArray(time) && time.length === 2 ? [moment(time[0]), moment(time[1])] : undefined,
      });
    } else if (filterValueInLocalStorage) {
      this.setLocalStorageValue();
    } else {
      this.setInitialValue();
    }
  };

  setLocalStorageValue = () => {
    const filterValueInLocalStorage = getOutStorageFilterFromLocalStorage();
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
    // 有多个用户工作部门不设置初始值，只有一个工作部门的时候才设置
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

  renderOutStorageTypeSelect = props => {
    const { changeChineseToLocale } = this.context;
    const options = Object.values(OUT_STORAGE_TYPES).map(i => {
      const { name, value } = i || {};
      return <Option value={value}>{changeChineseToLocale(name)}</Option>;
    });
    const { style, ...rest } = props || {};

    return (
      <Select style={{ width: '100%', ...style }} {...rest}>
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
    const { form, fetchData, match, tabKey } = this.props;
    const { userWareHouseCodes, isReset } = this.state;
    const { changeChineseToLocale } = this.context;

    const { getFieldDecorator, validateFieldsAndScroll, getFieldError, resetFields, getFieldsValue } = form || {};
    const typeErrors = getFieldError('type');
    const storageErrors = getFieldError('storage');
    const timeErrors = getFieldError('time');

    return (
      <FilterSortSearchBar searchDisabled>
        <ItemList>
          <Item label={'出库类型'} required>
            <div>
              {getFieldDecorator('type', { rules: [{ required: true, message: changeChineseToLocale('出库类型必填') }] })(
                this.renderOutStorageTypeSelect(),
              )}
              {this.renderError(typeErrors)}
            </div>
          </Item>
          <Item label={'出库仓位'} required>
            <div>
              {getFieldDecorator('storage', { rules: [{ required: true, message: changeChineseToLocale('出库仓位必填') }] })(
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
              <Searchselect params={{ status: 1 }} placeholder={changeChineseToLocale('请选择')} type="materialBySearch" />,
            )}
          </Item>
          <Item label="二维码">{getFieldDecorator('qrcode')(<Input placeholder={changeChineseToLocale('请输入')} />)}</Item>
          <Item label="嵌套二维码">{getFieldDecorator('containerQrcode')(<Input placeholder={changeChineseToLocale('请输入')} />)}</Item>
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
                saveOutStorageFilterInLocalStorage(value);
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
                saveOutStorageFilterInLocalStorage(value);
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
  tabKey: PropTypes.any,
};

Filter.contextTypes = {
  changeChineseToLocale: PropTypes.any,
};

export default withForm({}, Filter);
