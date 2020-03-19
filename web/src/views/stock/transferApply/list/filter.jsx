import React, { Component } from 'react';
import PropTypes from 'prop-types';

import {
  StorageSelect,
  FormItem,
  DatePicker,
  Button,
  Input,
  withForm,
  FilterSortSearchBar,
  Icon,
} from 'src/components/index';
import { middleGrey, error } from 'src/styles/color/index';
import { getParams } from 'src/utils/url';
import moment, { formatRangeUnix } from 'src/utils/time';
import SearchSelect from 'src/components/select/searchSelect';
import SearchSelectForMoveTransactions from 'src/containers/moveTransactions/searchSelectForMoveTransactions';
import { TRANS_TYPE } from 'src/services/knowledgeBase/moveTransactions';
import { arrayIsEmpty } from 'src/utils/array';

import {
  APPLY_STATUS,
  saveTransferApplyFilterValueInLocalStorage,
  getTransferApplyFilterValueFromLocalStorage,
  isTransferApplyConnectWithMoveTransaction,
} from '../util';
import ApplyStatusSelect from '../baseComponent/applyStatusSelect';

const ItemList = FilterSortSearchBar.ItemList;
const Item = FilterSortSearchBar.Item;
const ItemForFormItem = FilterSortSearchBar.ItemForFormItem;
const getStorageIds = StorageSelect.getStorageIds;

const DEFAULT_VALUE_FOR_APPLY_STATUS = [
  APPLY_STATUS.created.value,
  APPLY_STATUS.issue.value,
  APPLY_STATUS.done.value,
  APPLY_STATUS.issueFinish.value,
  APPLY_STATUS.stop.value,
];

class Filter extends Component {
  state = {};

  componentDidMount() {
    const { form, refetch } = this.props;
    const { queryObj } = getParams();

    const { filter: urlFilter } = queryObj || {};
    const localStorageFilter = getTransferApplyFilterValueFromLocalStorage();
    let _filter;
    // 如果有url中的filter使用url。如果没有使用localStorage
    if (urlFilter) {
      _filter = urlFilter;
    } else if (localStorageFilter) {
      _filter = localStorageFilter;
    }

    if (_filter) {
      const { createTime, targetStorage, wareHouse, ...rest } = _filter;
      this.setState({ targetStorage, wareHouse }, () => {
        form.setFieldsValue({
          createTime: [
            createTime && createTime[0] ? moment(createTime[0]) : moment().subtract(30, 'days'),
            createTime && createTime[1] ? moment(createTime[1]) : moment(),
          ],
          targetStorage,
          wareHouse,
          ...rest,
        });
        form.validateFieldsAndScroll((err, value) => {
          if (!err) {
            refetch({ filter: value, size: 10, page: 1 });
            saveTransferApplyFilterValueInLocalStorage(value);
          }
        });
      });
    }
  }

  renderButton = () => {
    const { form, refetch } = this.props;
    const { changeChineseToLocale } = this.context;

    return (
      <div>
        <Button
          style={{ width: 86 }}
          onClick={() => {
            form.validateFieldsAndScroll((err, value) => {
              if (!err) {
                saveTransferApplyFilterValueInLocalStorage(value);
                refetch({ filter: value, size: 10, page: 1 });
              }
            });
          }}
        >
          <Icon type={'search'} />
          {changeChineseToLocale('查询')}
        </Button>
        <span
          onClick={() => {
            form.resetFields();
            this.setState(
              {
                wareHouse: null,
                targetStorage: null,
              },
              () => {
                form.validateFieldsAndScroll((err, value) => {
                  if (!err) {
                    saveTransferApplyFilterValueInLocalStorage(value);
                    refetch({ filter: value, size: 10, page: 1 });
                  }
                });
              },
            );
          }}
          style={{ color: middleGrey, margin: '0px 10px', lineHeight: '28px', cursor: 'pointer' }}
        >
          {changeChineseToLocale('重置')}
        </span>
      </div>
    );
  };

  renderErrorMessage = itemName => {
    const { form } = this.props;

    return <div style={{ color: error }}>{form.getFieldError(itemName)}</div>;
  };

  validateForStorage = (rule, value, cb) => {
    const { changeChineseToLocale } = this.context;
    const { targetStorage, wareHouse } = this.state;
    if (!targetStorage && !wareHouse) {
      cb(changeChineseToLocale('发出仓库，目标位置必选一个'));
    }
    cb();
  };

  render() {
    const { form } = this.props;
    const { changeChineseToLocale } = this.context;
    const { getFieldDecorator } = form || {};

    return (
      <FilterSortSearchBar>
        <ItemList>
          <Item label={'编号'}>{getFieldDecorator('code')(<Input />)}</Item>
          <Item label={'目标位置'}>
            <div>
              {getFieldDecorator('targetStorage', {
                rules: [
                  {
                    validator: this.validateForStorage,
                  },
                ],
                onChange: value => {
                  this.setState({ targetStorage: arrayIsEmpty(value) ? null : value }, () => {
                    form.validateFields(['wareHouse', 'targetStorage'], { force: true });
                  });
                },
              })(<StorageSelect />)}
              {this.renderErrorMessage('targetStorage')}
            </div>
          </Item>
          <Item label={'发出仓库'}>
            <div>
              {getFieldDecorator('wareHouse', {
                rules: [
                  {
                    validator: this.validateForStorage,
                  },
                ],
                onChange: value => {
                  this.setState({ wareHouse: value }, () => {
                    form.validateFields(['targetStorage', 'wareHouse'], { force: true });
                  });
                },
              })(<SearchSelect style={{ width: '100%' }} type={'wareHouseWithCode'} />)}
              {this.renderErrorMessage('wareHouse')}
            </div>
          </Item>
          {isTransferApplyConnectWithMoveTransaction() ? (
            <ItemForFormItem>
              <FormItem label={'移动事务'}>
                {getFieldDecorator('transaction')(
                  <SearchSelectForMoveTransactions
                    params={{ enable: 1 }}
                    style={{ width: '100%' }}
                    type={TRANS_TYPE.transferApply.value}
                  />,
                )}
              </FormItem>
            </ItemForFormItem>
          ) : null}
          <Item required label={'申请状态'}>
            <div>
              {getFieldDecorator('status', {
                initialValue: DEFAULT_VALUE_FOR_APPLY_STATUS,
                rules: [
                  {
                    required: true,
                    message: changeChineseToLocale('申请状态必填'),
                  },
                ],
              })(<ApplyStatusSelect style={{ width: '100%' }} />)}
              {this.renderErrorMessage('status')}
            </div>
          </Item>
          <Item required label={'创建时间'}>
            <div>
              {getFieldDecorator('createTime', {
                initialValue: [moment().subtract(30, 'days'), moment()],
                rules: [
                  {
                    required: true,
                    message: changeChineseToLocale('创建时间必填'),
                  },
                ],
              })(<DatePicker.RangePicker />)}
              {this.renderErrorMessage('createTime')}
            </div>
          </Item>
        </ItemList>
        {this.renderButton()}
      </FilterSortSearchBar>
    );
  }
}

Filter.propTypes = {
  style: PropTypes.object,
  form: PropTypes.any,
  refetch: PropTypes.any,
};

Filter.contextTypes = {
  changeChineseToLocale: PropTypes.any,
};

export const formatFilterData = data => {
  if (!data) return null;

  const { transaction, code, targetStorage, wareHouse, status, createTime, ...rest } = data || {};

  const res = { code, status, ...rest };

  // 发出仓库
  if (wareHouse) {
    res.sourceWarehouseCodes = [wareHouse.key];
  } else {
    res.sourceWarehouseCodes = null;
  }

  // 创建时间
  if (createTime) {
    const [createBegin, createEnd] = formatRangeUnix(createTime);
    res.createdBegin = createBegin;
    res.createdEnd = createEnd;
  } else {
    res.createdBegin = null;
    res.createdEnd = null;
  }

  // 移动事务code
  if (transaction) {
    res.transactionCode = transaction.key;
  } else {
    res.transactionCode = null;
  }

  // 目标位置
  const ids = targetStorage ? getStorageIds(targetStorage) : null;

  return { ...res, ...ids };
};

export default withForm({}, Filter);
