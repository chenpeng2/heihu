import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';

import {
  StorageSelectWithWorkDepartments,
  withForm,
  FormItem,
  FilterSortSearchBar,
  Button,
  Select,
  Input,
  StorageSelect,
} from 'src/components';
import { changeChineseToLocaleWithoutIntl } from 'utils/locale/utils';
import SearchSelect from 'src/components/select/searchSelect';
import { middleGrey } from 'src/styles/color';
import { QUALITY_STATUS } from 'src/views/qualityManagement/constants';
import { getParams } from 'src/utils/url';

import { LOCATION_STATUS, TRALLYING_STATUS, formatFilterFormStatusValue } from '../utils';

const getStorageIds = StorageSelect.getStorageIds;
const Option = Select.Option;
const ItemList = FilterSortSearchBar.ItemList;
const Item = FilterSortSearchBar.Item;
const ItemForFormItem = FilterSortSearchBar.ItemForFormItem;
const ItemListWithFoldButton = FilterSortSearchBar.ItemListWithFoldButton;

type Props = {
  style: {},
  form: any,
  fetchData: () => {},
  match: any,
};

export const formatFilerFormValue = formValue => {
  if (!formValue) return;
  const {
    mfgBatch,
    supplierCode,
    trallyingStatus,
    project,
    purchaseOrder,
    area,
    material,
    containerCode,
    locationStatus,
    inboundBatch,
    productBatch,
    ...rest
  } = formValue;
  // 获取仓位id，主要是将仓位id分类
  const _value = {
    materialCode: material ? material.key : null,
    containerCode: containerCode || null,
    status: locationStatus,
    projectCode: project ? project.key : null,
    purchaseOrderCode: purchaseOrder ? purchaseOrder.key : null,
    supplierCode: supplierCode || null, // 空字符串
    mfgBatch: mfgBatch || null,
    inboundBatch: inboundBatch || null,
    productBatch: productBatch || null,
    ...formatFilterFormStatusValue(trallyingStatus),
    ...rest,
  };
  const { houseId, firstStorageId, secondStorageIds } = getStorageIds(area) || {};

  return { ..._value, houseId, firstStorageId, secondStorageId: secondStorageIds };
};

export const renderQcStatusSelect = (style = {}, props) => {
  const options = Object.entries(QUALITY_STATUS).map(([value, content]) => {
    const { name } = content || {};
    return (
      <Option key={value} value={value}>
        {changeChineseToLocaleWithoutIntl(name)}
      </Option>
    );
  });
  options.unshift(
    <Option value={null} key={'all'}>
      {changeChineseToLocaleWithoutIntl('全部')}
    </Option>,
  );

  return (
    <Select style={style} {...props}>
      {options}
    </Select>
  );
};

class Filter extends Component {
  props: Props;
  state = {};

  componentDidMount() {
    this.setFormValue();
  }

  setFormValue = () => {
    const { form, fetchData } = this.props;
    const { queryObj } = getParams();
    const { filter } = queryObj || {};

    if (typeof fetchData === 'function') fetchData(queryObj);

    if (filter) {
      const { material, area } = filter;
      this.setState({ material, area }, () => {
        form.setFieldsValue(filter);
      });
    }
  };

  onClickForFilter = () => {
    const { form, fetchData } = this.props;
    const { validateFieldsAndScroll } = form || {};

    validateFieldsAndScroll((err, value) => {
      if (err) return;

      if (sensors) {
        sensors.track('web_stock_qrCode_search', {
          FilterCondition: formatFilerFormValue(value),
        });
      }

      if (typeof fetchData === 'function') fetchData({ filter: value, page: 1 });
    });
  };

  renderLocationStatus = () => {
    const { changeChineseToLocale } = this.context;
    const options = Object.values(LOCATION_STATUS).map(({ value, name }) => {
      return (
        <Option key={value} value={value}>
          {changeChineseToLocale(name)}
        </Option>
      );
    });
    options.unshift(
      <Option value={null} key={'all'}>
        {changeChineseToLocale('全部')}
      </Option>,
    );

    return <Select>{options}</Select>;
  };

  // 盘点状态多选框
  renderTrallyingStatusSelect = () => {
    const { changeChineseToLocale } = this.context;
    const options = Object.values(TRALLYING_STATUS).map(i => {
      const { value, name } = i || {};
      return (
        <Option key={value} value={value}>
          {changeChineseToLocale(name)}
        </Option>
      );
    });
    options.unshift(
      <Option value={null} key={'all'}>
        {changeChineseToLocale('全部')}
      </Option>,
    );

    return <Select>{options}</Select>;
  };

  render() {
    const { form, fetchData, match, cbForFold } = this.props;
    const { getFieldDecorator, resetFields } = form || {};
    const { changeChineseToLocale } = this.context;

    return (
      <div>
        <FilterSortSearchBar innerStyle={{ paddingBottom: 3 }} searchFn={this.onClickForFilter} searchDisabled>
          <ItemList>
            <Item label={'二维码'}>{getFieldDecorator('qrcode')(<Input />)}</Item>
            <Item label={'区域'}>
              {getFieldDecorator('area', {
                onChange: v => {
                  this.setState({ area: v }, () => {
                    form.validateFields(['mfgBatch', 'supplierCode', 'inboundBatch', 'productBatch'], { force: true });
                  });
                },
              })(<StorageSelectWithWorkDepartments match={match} />)}
            </Item>
            <Item label={'物料'}>
              {getFieldDecorator('material', {
                onChange: v => {
                  this.setState({ material: v }, () => {
                    form.validateFields(['mfgBatch', 'supplierCode', 'inboundBatch', 'productBatch'], { force: true });
                  });
                },
              })(<SearchSelect type={'materialBySearch'} />)}
            </Item>
            <ItemListWithFoldButton cbForFold={cbForFold}>
              <Item label={'项目'}>{getFieldDecorator('project')(<SearchSelect type={'project'} />)}</Item>
              <Item label={'销售订单'}>
                {getFieldDecorator('purchaseOrder')(<SearchSelect type={'purchaseOrder'} />)}
              </Item>
              <Item label={'质量状态'}>
                {getFieldDecorator('qcStatus', {
                  initialValue: null,
                })(renderQcStatusSelect())}
              </Item>
              <Item label={'父级二维码'}>{getFieldDecorator('containerCode')(<Input />)}</Item>
              <Item label={'位置状态'}>
                {getFieldDecorator('locationStatus', {
                  initialValue: null,
                })(this.renderLocationStatus())}
              </Item>
              <Item label={'业务状态'}>
                {getFieldDecorator('trallyingStatus', {
                  initialValue: null,
                })(this.renderTrallyingStatusSelect())}
              </Item>
              <ItemForFormItem>
                <FormItem label={'供应商'}>
                  {getFieldDecorator('supplierCode', {
                    rules: [
                      {
                        validator: (rule, value, callback) => {
                          if (value && (!this.state.area || !this.state.material)) {
                            callback('请先填写区域和物料');
                          }
                          callback();
                        },
                      },
                    ],
                  })(<Input />)}
                </FormItem>
              </ItemForFormItem>
              <ItemForFormItem>
                <FormItem label={'供应商批次'}>
                  {getFieldDecorator('mfgBatch', {
                    rules: [
                      {
                        validator: (rule, value, callback) => {
                          if (value && (!this.state.area || !this.state.material)) {
                            callback('请先填写区域和物料');
                          }
                          callback();
                        },
                      },
                    ],
                  })(<Input />)}
                </FormItem>
              </ItemForFormItem>
              <ItemForFormItem>
                <FormItem label={'入厂批次'}>
                  {getFieldDecorator('inboundBatch', {
                    rules: [
                      {
                        validator: (rule, value, callback) => {
                          if (value && (!this.state.area || !this.state.material)) {
                            callback('请先填写区域和物料');
                          }
                          callback();
                        },
                      },
                    ],
                  })(<Input />)}
                </FormItem>
              </ItemForFormItem>
              <ItemForFormItem>
                <FormItem label={'生产批次'}>
                  {getFieldDecorator('productBatch', {
                    rules: [
                      {
                        validator: (rule, value, callback) => {
                          if (value && (!this.state.area || !this.state.material)) {
                            callback('请先填写区域和物料');
                          }
                          callback();
                        },
                      },
                    ],
                  })(<Input />)}
                </FormItem>
              </ItemForFormItem>
            </ItemListWithFoldButton>
          </ItemList>
          <div>
            <Button icon="search" onClick={this.onClickForFilter}>
              查询
            </Button>
            <span
              style={{ color: middleGrey, margin: '0 10px', cursor: 'pointer', verticalAlign: 'middle' }}
              onClick={() => {
                resetFields();
                form.validateFieldsAndScroll((err, value) => {
                  if (err) return;
                  if (typeof fetchData === 'function') {
                    fetchData({ filter: value, page: 1 });
                  }
                });
              }}
            >
              {changeChineseToLocale('重置')}
            </span>
          </div>
        </FilterSortSearchBar>
      </div>
    );
  }
}

Filter.contextTypes = {
  changeChineseToLocale: PropTypes.func,
};

export default withForm({}, withRouter(Filter));
