import React, { Component } from 'react';
import _ from 'lodash';
import { Select } from 'antd';
import { FormItem, Form, message, RecordHistorySelect, Input } from 'components';
import { getQuery } from 'src/routes/getRouteParams';
import { injectIntl } from 'react-intl';
import { changeChineseToLocale } from 'utils/locale/utils';
import withForm, { equipCodeFormat } from 'components/form';
import { getValidDeviceCategoryList } from 'src/services/equipmentMaintenance/base';

type Props = {
  form: any,
  parentId: any,
  intl: any,
  actionFunc: () => {},
  type: string,
  initialValue: {},
  refetch: () => {},
  onCancel: () => {},
  match: any,
  isCommonUse: Boolean,
};
const Option = Select.Option;

class Base extends Component {
  props: Props;
  state = {
    data: null,
    isSubmit: false,
    type: [],
  };

  componentDidMount() {
    const { initialValue, form } = this.props;
    const { setFieldsValue } = form;
    this.fetchData();
    if (initialValue) {
      const { code, name, category } = initialValue;
      if (category && category.length) {
        const type = category.map(n => n.type);
        this.setState({ type });
      }
      setFieldsValue({
        name,
        code,
        category,
      });
    }
  }

  fetchData = () => {
    getValidDeviceCategoryList({}).then(res => {
      this.setState({
        data: res.data,
      });
    });
  };

  getChildren = () => {
    const { data } = this.state;
    if (!data) {
      return null;
    }
    const selectData = data.data.map(({ name, id, type }) => ({
      key: `${id},${type}`,
      label: name,
    }));
    return selectData.map(({ key, label }) => (
      <Option key={key} value={key}>
        {label}
      </Option>
    ));
  };

  submit = value => {
    const { code, name, category } = value;
    const { parentId, actionFunc, type, initialValue, refetch, match, onCancel } = this.props;
    const queryMatch = getQuery(match);
    const { id } = initialValue || {};
    const suitableCategory = category
      ? category.map((n, index) => ({
          [this.state.type[index] === 'mould' ? 'defCode' : 'categoryId']: n.key,
          type: this.state.type[index],
        }))
      : [];
    const variables =
      type === '创建'
        ? {
            code,
            name,
            suitableCategory,
            parentId,
          }
        : {
            id,
            code,
            name,
            suitableCategory,
            parentId,
          };
    this.setState({ isSubmit: true });
    return actionFunc(variables).then(res => {
      const id = _.get(res, 'data.data.id');
      message.success(`${type}原因成功`);
      if (typeof refetch === 'function') {
        refetch(queryMatch, { code, id, name });
      }
      if (typeof onCancel === 'function') {
        onCancel();
      }
    });
  };

  render() {
    const { form, type, parentId, initialValue, isCommonUse, intl } = this.props;
    const { getFieldDecorator, getFieldValue } = form;

    return (
      <Form layout="vertical">
        <FormItem label={'故障名称'}>
          {getFieldDecorator('name', {
            rules: [
              { required: true, message: changeChineseToLocale('请输入故障名称', intl) },
              { max: 50, message: changeChineseToLocale('故障名称长度不能超过50个字', intl) },
              { min: 2, message: changeChineseToLocale('故障名称长度不能少于2个字', intl) },
            ],
          })(<Input style={{ width: 450 }} placeholder={'请输入故障名称'} />)}
        </FormItem>
        <FormItem label={'故障代码'}>
          {getFieldDecorator('code', {
            rules: [
              { required: true, message: changeChineseToLocale('请输入故障代码', intl) },
              { validator: equipCodeFormat(changeChineseToLocale('故障代码', intl)) },
              { max: 10, message: changeChineseToLocale('故障代码长度不能超过10个字', intl) },
              { min: 4, message: changeChineseToLocale('故障代码长度不能少于4个字', intl) },
            ],
          })(<Input style={{ width: 450 }} disabled={type === '编辑'} placeholder={'请输入故障代码'} />)}
        </FormItem>
        {parentId === 0 || type === '编辑' || type === '创建' ? (
          <FormItem label={'适用范围'}>
            {getFieldDecorator('category')(
              <RecordHistorySelect
                placeholder={changeChineseToLocale('请选择适用范围', intl)}
                style={{ width: 450 }}
                mode="multiple"
                disabled={parentId !== 0 || isCommonUse}
                type={'faultCase'}
                isSubmit={this.state.isSubmit}
                initialValue={initialValue && initialValue.category}
                onSelect={value => {
                  const type = value.extra;
                  this.state.type.push(
                    type === 'equipmentProdCategory'
                      ? 'equipmentProd'
                      : type === 'equipmentModuleCategory'
                      ? 'equipmentModule'
                      : 'mould',
                  );
                  this.setState({ type: this.state.type });
                }}
                onDeselect={value => {
                  let index = null;
                  getFieldValue('category').forEach((n, i) => {
                    if (n.key === value.key) {
                      index = i;
                    }
                  });
                  this.state.type.splice(index, 1);
                  this.setState({ type: this.state.type });
                }}
                storageType={'equipmentProdCategory;equipmentModuleCategory;mouldCategory'}
              />,
            )}
          </FormItem>
        ) : null}
      </Form>
    );
  }
}

export default injectIntl(withForm({ showFooter: true }, Base));
