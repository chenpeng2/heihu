import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import { Button, Icon, FilterSortSearchBar, withForm, FormItem } from 'src/components';
import SearchSelect from 'src/components/select/searchSelect';
import { middleGrey } from 'src/styles/color';
import { arrayIsEmpty } from 'src/utils/array';
import { getParams } from 'src/utils/url';
import UserDepartmentSelect, {
  getUserDepartments,
  KEY_TYPE,
} from 'src/components/select/userDeparetmentWareHouseSelect';

import { getMaterialReportFilterValueFromLocalStorage, saveMaterialReportFilterValueInLocalStorage } from './utils';

const ItemList = FilterSortSearchBar.ItemList;
const ItemForFormItem = FilterSortSearchBar.ItemForFormItem;
const Item = FilterSortSearchBar.Item;

const FORMITEM_WIDTH = 200;

class Filter extends Component {
  state = {};

  async componentDidMount() {
    const { form, refetch } = this.props;
    const { queryObj } = getParams();
    const filter = _.get(queryObj, 'filter');

    // 将url中的参数设置到表格中
    if (filter) {
      form.setFieldsValue(filter);
      if (typeof refetch === 'function') refetch(queryObj);
      return null;
    }
    // 将本地保存的搜索条件设置
    const localFilter = getMaterialReportFilterValueFromLocalStorage();
    if (localFilter) {
      form.setFieldsValue(localFilter);
      if (typeof refetch === 'function') refetch({ filter: localFilter });
      return null;
    }

    // 如果url,localStorage中都没有filter数据
    const userDepartments = await getUserDepartments();
    this.setState(
      {
        userDepartments: arrayIsEmpty(userDepartments)
          ? undefined
          : userDepartments.map(i => {
              const { code, name } = i || {};
              return { key: code, label: name };
            }),
      },
      () => {
        form.validateFieldsAndScroll((err, value) => {
          if (err) return;
          if (typeof refetch === 'function') refetch({ filter: value });
        });
      },
    );
  }

  renderButtons = () => {
    const { form, refetch } = this.props;
    const { changeChineseToLocale } = this.context;

    return (
      <div>
        <Button
          style={{ width: 86 }}
          onClick={() => {
            form.validateFieldsAndScroll((err, value) => {
              if (!err && typeof refetch === 'function') {
                refetch({ filter: value, size: 10, page: 1 });
                saveMaterialReportFilterValueInLocalStorage(value);
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
            form.validateFieldsAndScroll((err, value) => {
              if (!err && typeof refetch === 'function') {
                refetch({ filter: value, size: 10, page: 1 });
              }
            });
          }}
          style={{ color: middleGrey, margin: '0px 10px', lineHeight: '28px', cursor: 'pointer' }}
        >
          {changeChineseToLocale('重置')}
        </span>
      </div>
    );
  };

  render() {
    const { form } = this.props;
    const { userDepartments } = this.state;
    const { changeChineseToLocale } = this.context;
    const { getFieldDecorator } = form || {};

    return (
      <FilterSortSearchBar>
        <ItemList>
          <ItemForFormItem>
            <FormItem label={'仓库'}>
              {getFieldDecorator('storage', {
                rules: [
                  { required: true, message: changeChineseToLocale('仓库必选') },
                  {
                    validator: (rule, value, cb) => {
                      if (Array.isArray(value) && value.length > 10) {
                        cb(changeChineseToLocale('最多选择10个仓库'));
                      }
                      cb();
                    },
                  },
                ],
                initialValue: arrayIsEmpty(userDepartments) ? undefined : userDepartments.slice(0, 10),
              })(
                <UserDepartmentSelect
                  keyType={KEY_TYPE.code}
                  mode={'multiple'}
                  style={{ minWidth: FORMITEM_WIDTH, width: '100%' }}
                />,
              )}
            </FormItem>
          </ItemForFormItem>
          <Item label={'物料'}>
            {getFieldDecorator('material')(
              <SearchSelect type={'materialBySearch'} style={{ minWidth: FORMITEM_WIDTH }} />,
            )}
          </Item>
        </ItemList>
        <div>{this.renderButtons()}</div>
      </FilterSortSearchBar>
    );
  }
}

Filter.propTypes = {
  style: PropTypes.object,
  refetch: PropTypes.any,
  form: PropTypes.any,
};

Filter.contextTypes = {
  changeChineseToLocale: PropTypes.any,
};

export const formatFilterParams = formValue => {
  if (!formValue) return;

  const { material, storage } = formValue;
  const storageCodes = !arrayIsEmpty(storage) ? storage.map(i => i && i.key).filter(i => i) : null;
  const materialCode = material ? material.key : null;
  return {
    warehouseCodes: storageCodes,
    materialCodes: materialCode ? [materialCode] : null,
  };
};

export default withForm({}, Filter);
