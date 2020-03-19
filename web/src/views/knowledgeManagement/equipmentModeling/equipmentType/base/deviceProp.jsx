import React, { Component } from 'react';
import _ from 'lodash';
import { FormItem, Table, Link, Icon, Searchselect, Button, Select } from 'src/components';
import { borderGrey, error } from 'src/styles/color';
import { getMetricList } from 'src/services/equipmentMaintenance/device';
import styles from './styles.scss';

type Props = {
  form: {},
  data: [],
  taskStrategies: [],
  action: string,
  handleSelect: () => {},
};
let tag = 0;
const Option = Select.Option;

class DeviceProp extends Component {
  props: Props

  state = {
    deviceProp: [],
    keys: [],
    metricList: [],
    search: '',
  };

  componentWillMount() {
    const { data } = this.props;
    if (data && Array.isArray(data)) {
      const _keys = [];
      data.forEach((_, index) => {
        _keys.push(index + 1);
        tag += 1;
      });
      this.setState({ keys: _keys });
    }
  }

  componentDidMount() {
    const { handleSelect } = this.props;
    handleSelect();
  }

  getColumns = () => {
    return [
      {
        title: '读数名称/单位',
        width: 380,
      },
    ];
  };

  handleSearch = async search => {
    const { data: { data } } = await getMetricList({
      searchCategoryType: 1,
      searchContent: search,
    });
    const metricList = data.map(({ id, metricName, metricUnitName }) => ({
      key: `${id}`,
      label: `${metricName}/${metricUnitName}`,
    }));
    this.setState({ metricList, search });
  }

  renderFormItems = () => {
    const { form, handleSelect, data, action, taskStrategies } = this.props;
    const { metricList, keys } = this.state;
    const { getFieldDecorator, getFieldValue } = form;
    const deviceProp = getFieldValue('deviceProp') && _.compact(Object.values(getFieldValue('deviceProp')));
    const formItems = keys.map(n => {
      const disabled = action === 'edit' ?
      taskStrategies.filter(m => {
          const id = (m.deviceMetric && m.deviceMetric.id) || (m.metric && m.metric.key.split('/')[0]) || -1;
          const _id = deviceProp && deviceProp[n - 1] && deviceProp[n - 1].metric.key;
          return `${id}` === `${_id}`;
        }).length > 0
      : false;
      return (
        <div style={{ width: 460, height: 46, lineHeight: '48px', border: `1px solid ${borderGrey}`, borderTopWidth: 0, marginLeft: 20 }}>
          <FormItem label="">
            {getFieldDecorator(`deviceProp[${n}]`)(
              <div style={{ display: 'flex' }}>
                {!disabled ?
                  <Icon
                    type={'minus-circle'}
                    style={{ margin: '0 7px', color: error, cursor: 'pointer', lineHeight: '46px' }}
                    onClick={() => {
                      if (getFieldValue(`deviceProp[${n}]`) && getFieldValue(`deviceProp[${n}]`).metric) {
                        handleSelect(getFieldValue(`deviceProp[${n}]`).metric.key, 'delete', n);
                      }
                      this.setState({ keys: keys.filter(key => key !== n) });
                    }}
                  /> : <span style={{ width: 28 }} />}
                {getFieldDecorator(`deviceProp[${n}].metric`, {
                  initialValue: data && data.length ? {
                    key: data[n - 1] && `${data[n - 1].id}`,
                    label: data[n - 1] ? `${data[n - 1].metricName}/${data[n - 1].metricUnitName}` : null,
                  } : [],
                })(
                  <Select
                    style={{ width: 360, marginTop: 8 }}
                    onSearch={this.handleSearch}
                    disabled={disabled}
                    onFocus={() => { this.handleSearch(''); }}
                    onSelect={value => {
                      handleSelect(value.key, 'add', n);
                    }}
                    labelInValue
                  >
                    {metricList.map(({ key, label }) => (
                      <Option value={key}>{label}</Option>
                    ))}
                  </Select>,
                )}
              </div>,
            )}
          </FormItem>
        </div>
      );
    });
    return formItems;
  }

  render() {
    const { data, action } = this.props;
    const { keys } = this.state;
    const columns = this.getColumns();

    return (
      <div className={styles.strategyConfig} style={{ width: 500 }}>
        <Table
          columns={columns}
          dataSource={[]}
          pagination={false}
        />
        <div className={styles.deviceProp} style={{ width: 480, maxHeight: 230, overflowY: 'scroll' }}>
          {this.renderFormItems()}
        </div>
        <div style={{ width: 460, height: 46, lineHeight: '48px', border: `1px solid ${borderGrey}`, borderTopWidth: 0, marginLeft: 20 }}>
          <Link
            style={{ marginLeft: 10 }}
            icon={'plus-circle-o'}
            onClick={() => {
              const items = document.getElementsByClassName('deviceProp___2pX8S')[0];
              const nextKeys = keys.concat(tag += 1);
              this.setState({ keys: nextKeys });
              setTimeout(() => {
                items.scrollTop = items.scrollHeight - parseInt(items.style.maxHeight, 10);
              }, 100);
            }}
          >
            新增一行
          </Link>
        </div>
      </div>
    );
  }
}

export default DeviceProp;
