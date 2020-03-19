/**
 * @description: 库容检查项
 *
 * @date: 2019/4/29 下午3:35
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import { FormattedMessage, FormItem, Select, Radio } from 'src/components/index';
import { arrayIsEmpty } from 'src/utils/array';
import { middleGrey } from 'src/styles/color';

import { STORAGE_CAPACITY, useStorageCapacity, findStorageCapacity } from './utils';
import MaterialListTabs from './materialListTabs';

const Option = Select.Option;
const RadioGroup = Radio.Group;

class StorageCapacity extends Component {
  state = {
    types: [],
    useStorageCapacity: useStorageCapacity.stop.value,
  };

  componentDidMount() {
    this.setInitialValue();
  }

  componentWillReceiveProps(nextProps) {
    if (!_.isEqual(nextProps.initialValue, this.props.initialValue)) {
      this.setInitialValue(nextProps);
    }
  }

  resetForm = () => {
    const { form } = this.props;

    if (form) form.resetFields();
    this.setState({
      types: [],
      useStorageCapacity: useStorageCapacity.stop.value,
    });
  };

  setInitialValue = props => {
    const { initialValue } = props || this.props;

    if (initialValue) {
      const { useStorageCapacity, storageCapacity } = initialValue;
      this.setState({
        useStorageCapacity,
        types: arrayIsEmpty(storageCapacity)
          ? null
          : storageCapacity
              .map(i => {
                return findStorageCapacity(i);
              })
              .filter(i => i),
      });
    }
  };

  render() {
    const { form, formItemStyle, initialValue } = this.props;
    const { getFieldDecorator } = form || {};
    const { types, useStorageCapacity: stateUseStorageCapacity } = this.state;
    const { changeChineseToLocale } = this.context;

    return (
      <div>
        <FormItem label={'仓库库容管理'}>
          {getFieldDecorator('useStorageCapacity', {
            initialValue: stateUseStorageCapacity,
            onChange: e => {
              // 这里不需要置空types
              this.setState({ useStorageCapacity: e.target.value });
            },
          })(
            <RadioGroup>
              {Object.values(useStorageCapacity).map(i => {
                const { name, value } = i || {};
                return <Radio value={value}>{changeChineseToLocale(name)}</Radio>;
              })}
            </RadioGroup>,
          )}
        </FormItem>
        {stateUseStorageCapacity === useStorageCapacity.stop.value ? null : (
          <React.Fragment>
            <FormItem label={'库容检查项'}>
              {getFieldDecorator('storageCapacity', {
                onChange: (v, options) => {
                  this.setState({ types: !arrayIsEmpty(options) ? options.map(i => _.get(i, 'props.data')) : [] });
                },
                initialValue: arrayIsEmpty(types) ? undefined : types.map(i => i && i.value),
              })(
                <Select mode={'multiple'} style={formItemStyle}>
                  {Object.values(STORAGE_CAPACITY).map(i => {
                    const { name, value } = i || {};
                    return (
                      <Option data={i} value={value}>
                        {changeChineseToLocale(name)}
                      </Option>
                    );
                  })}
                </Select>,
              )}
              <FormattedMessage defaultMessage={'系统每天早上8点进行一次库存数据检查并发送通知'} style={{ marginLeft: 10, color: middleGrey }} />
            </FormItem>
            <FormItem label={'物料列表'}>
              <MaterialListTabs initialValue={initialValue} form={form} storageCapacitys={this.state.types} />
            </FormItem>
          </React.Fragment>
        )}
      </div>
    );
  }
}

StorageCapacity.propTypes = {
  style: PropTypes.object,
  form: PropTypes.any,
  formItemStyle: PropTypes.any,
  initialValue: PropTypes.any,
};

StorageCapacity.contextTypes = {
  changeChineseToLocale: PropTypes.any,
};

export default StorageCapacity;
