import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { DatePicker, Checkbox, Row, Col } from 'antd';
import MyStore from 'store';
import { FilterSortSearchBar, Select, Button, Icon, Searchselect, message } from 'components';
import { changeProductionTab } from 'src/store/redux/actions';
import { setLocation } from 'utils/url';
import moment, { formatRangeUnix } from 'utils/time';
import withForm from 'components/form';
import { white, borderGrey, orange, fontSub } from 'src/styles/color/index';
import { intervals } from './config';
import styles from './styles.scss';

const { MonthPicker, WeekPicker } = DatePicker;
const ItemList = FilterSortSearchBar.ItemList;
const CheckboxGroup = Checkbox.Group;
const Option = Select.Option;
const Item = FilterSortSearchBar.Item;
const time = { 6: 'd', 7: 'w', 8: 'M', 9: 'Q' };

type Props = {
  form: {
    getFieldDecorator: () => {},
    getFieldsValue: () => {},
    setFieldsValue: () => {},
    getFieldValue: () => {},
  },
  location: {},
  router: {},
  showDataCategory: [],
  fetechData: () => {},
  type: any,
};

class ProductionCapacityFilter extends Component {
  props: Props;
  state = {
    endOpen: false,
    interval: '6',
    timeFromLimit: null,
    timeTillLimit: null,
    timeTill: null,
  };

  componentDidMount() {
    const tabActive = document.getElementsByClassName('ant-tabs-tabpane-active')[0];
    const groupItem = Array.from(tabActive.getElementsByClassName('ant-checkbox-group-item'));
    if (groupItem) {
      groupItem.forEach(n => {
        n.style.marginRight = '40px';
      });
    }
  }

  componentDidUpdate() {
    const tabActive = document.getElementsByClassName('ant-tabs-tabpane-active')[0];
    const groupItem = Array.from(tabActive.getElementsByClassName('ant-checkbox-group-item'));
    if (groupItem) {
      groupItem.forEach(n => {
        n.style.marginRight = 40;
      });
    }
  }

  disabledStartDate = startValue => {
    const { timeTillLimit } = this.state;
    const endValue = this.props.form.getFieldValue('timeTill');
    if (!startValue) {
      return false;
    }
    if (!endValue && startValue) {
      return startValue.valueOf() >= Date.parse(moment().endOf('day'));
    }
    if (timeTillLimit) {
      return startValue.valueOf() > endValue.valueOf() || startValue.valueOf() < timeTillLimit.valueOf();
    }
    return startValue.valueOf() > endValue.valueOf();
  };

  quaterDisabledStartDate = startValue => {
    const { timeTillLimit } = this.state;
    const endValue = this.props.form.getFieldValue('timeTill');
    const month = startValue.format('MM');
    if (!startValue) {
      return ['01', '04', '07', '10'].indexOf(month) === -1;
    }
    if (!endValue && startValue) {
      return (
        ['01', '04', '07', '10'].indexOf(month) === -1 || startValue.valueOf() >= Date.parse(moment().endOf('day'))
      );
    }
    if (timeTillLimit) {
      return (
        startValue.valueOf() > endValue.valueOf() ||
        ['01', '04', '07', '10'].indexOf(month) === -1 ||
        startValue.valueOf() < timeTillLimit.valueOf()
      );
    }
    return startValue.valueOf() > endValue.valueOf() || ['01', '04', '07', '10'].indexOf(month) === -1;
  };

  disabledEndDate = endValue => {
    const { timeFromLimit } = this.state;
    const startValue = this.props.form.getFieldValue('timeFrom');
    if (!endValue) {
      return false;
    }
    if (endValue && !startValue) {
      return endValue.valueOf() >= Date.parse(moment().endOf('day'));
    }
    if (timeFromLimit) {
      return (
        endValue.valueOf() <= startValue.valueOf() ||
        endValue.valueOf() >= timeFromLimit.valueOf() ||
        endValue.valueOf() >= Date.parse(moment().endOf('day'))
      );
    }
    return endValue.valueOf() <= startValue.valueOf() || endValue.valueOf() <= Date.parse(moment());
  };

  quaterDisabledEndDate = endValue => {
    const { timeFromLimit } = this.state;
    const startValue = this.props.form.getFieldValue('timeFrom');
    const month = endValue.format('MM');
    if (!endValue) {
      return ['01', '04', '07', '10'].indexOf(month) === -1;
    }
    if (endValue && !startValue) {
      return ['01', '04', '07', '10'].indexOf(month) === -1 || endValue.valueOf() >= Date.parse(moment().endOf('day'));
    }
    if (timeFromLimit) {
      return (
        endValue.valueOf() <= startValue.valueOf() ||
        ['01', '04', '07', '10'].indexOf(month) === -1 ||
        endValue.valueOf() >= timeFromLimit.valueOf() ||
        endValue.valueOf() >= Date.parse(moment().endOf('day'))
      );
    }
    return (
      endValue.valueOf() <= startValue.valueOf() ||
      ['01', '04', '07', '10'].indexOf(month) === -1 ||
      endValue.valueOf() <= Date.parse(moment())
    );
  };

  onStartChange = value => {
    if (value) {
      this.setState({ timeFromLimit: _.cloneDeep(value).add(300, time[this.state.interval]) });
    }
  };

  onEndChange = value => {
    if (value) {
      this.setState({ timeTillLimit: _.cloneDeep(value).subtract(300, time[this.state.interval]) });
    }
  };

  handleStartOpenChange = open => {
    if (!open) {
      this.setState({ endOpen: true });
    }
  };

  handleEndOpenChange = open => {
    this.setState({ endOpen: open });
  };

  getFormatParams = value => {
    const { type } = this.props;
    const params = {};
    params.groupBy = type === '工位负荷' ? 1 : type === '工位产能损失' ? 2 : 3;
    if (value) {
      Object.keys(value).forEach(prop => {
        if (value[prop]) {
          switch (prop) {
            case 'workstationIds':
            case 'processCodes':
              params[prop] = value[prop].map(n => n.key);
              break;
            case 'timeFrom':
              if (this.state.interval === '9') {
                params[prop] = value[prop].startOf('quarter');
              }
              break;
            case 'timeTill':
              if (this.state.interval === '9') {
                params[prop] = value[prop].endOf('quarter');
              }
              break;
            default:
              params[prop] = value[prop];
          }
        }
      });
      if (value.timeFrom && value.timeTill) {
        const _time = formatRangeUnix([value.timeFrom, value.timeTill]);
        params.timeFrom = _time[0];
        params.timeTill = _time[1];
      }
    }
    return params;
  };

  renderButton = () => {
    const { form, fetechData, type } = this.props;
    const { changeChineseToLocale } = this.context;
    const { getFieldsValue, validateFields } = form;
    return (
      <div>
        <Button
          onClick={() => {
            const values = getFieldsValue();
            const { interval, timeFrom, timeTill } = values;
            validateFields((err, values) => {
              if (!interval) {
                message.error(changeChineseToLocale('统计时间维度必填'));
              }
              if (!timeFrom || !timeTill) {
                message.error(changeChineseToLocale(`${!timeFrom ? '开始' : ''}${!timeTill ? '结束' : ''}时间必填`));
              }
              if (!values.categories || (values.categories && !values.categories.length)) {
                message.error(changeChineseToLocale('显示数据必填'));
              }
              if (err) return null;
              const params = this.getFormatParams(values);
              fetechData(params);
              MyStore.dispatch(changeProductionTab(params, type));
              setLocation(this.props, p => ({ ...p, ...params, page: 1 }));
            });
          }}
        >
          <Icon type={'search'} />
          {changeChineseToLocale('查询')}
        </Button>
      </div>
    );
  };

  render() {
    const { showDataCategory, form, type } = this.props;
    const { getFieldDecorator } = form;
    const { endOpen, interval } = this.state;
    const { changeChineseToLocale } = this.context;
    const dataCategories = showDataCategory.map(category => ({
      ...category,
      label: changeChineseToLocale(category.label),
    }));
    let TimePicker = null;
    switch (interval) {
      case '6':
        TimePicker = DatePicker;
        break;
      case '7':
        TimePicker = WeekPicker;
        break;
      case '8':
        TimePicker = MonthPicker;
        break;
      case '9':
        TimePicker = MonthPicker;
        break;
      default:
        TimePicker = DatePicker;
    }

    return (
      <div className={styles.reportStyle} style={{ borderBottom: `1px solid ${borderGrey}` }}>
        <FilterSortSearchBar style={{ backgroundColor: white, width: '100%' }} searchDisabled>
          <ItemList>
            <Item required label="统计时间维度">
              {getFieldDecorator('interval', {
                rules: [{ required: true }],
              })(
                <Select
                  onChange={value => {
                    this.setState({ interval: value });
                  }}
                >
                  {intervals.map(n => (
                    <Option value={n.value}>{changeChineseToLocale(n.label)}</Option>
                  ))}
                </Select>,
              )}
            </Item>
            <Item required label="开始结束时间" itemWrapperStyle={{ paddingRight: 0 }}>
              <div style={{ display: 'flex' }}>
                {getFieldDecorator('timeFrom', {
                  rules: [{ required: true }],
                })(
                  <TimePicker
                    disabledDate={this.state.interval === '9' ? this.quaterDisabledStartDate : this.disabledStartDate}
                    onChange={this.onStartChange}
                    onOpenChange={this.handleStartOpenChange}
                  />,
                )}
                <div style={{ display: 'inline-block', textAlign: 'center', margin: '0 5px' }}>~</div>
                {getFieldDecorator('timeTill', {
                  rules: [{ required: true }],
                })(
                  <TimePicker
                    disabledDate={this.state.interval === '9' ? this.quaterDisabledEndDate : this.disabledEndDate}
                    onChange={this.onEndChange}
                    open={endOpen}
                    onOpenChange={this.handleEndOpenChange}
                  />,
                )}
              </div>
            </Item>
            <Item label="工位">
              {getFieldDecorator('workstationIds')(<Searchselect mode={'multiple'} type={'workstationCodeAndName'} />)}
            </Item>
            <Item label="工序">
              {getFieldDecorator('processCodes')(
                <Searchselect mode={'multiple'} type={'processName'} params={{ status: '' }} />,
              )}
            </Item>
          </ItemList>
          {this.renderButton()}
        </FilterSortSearchBar>
        <Item
          wrapperStyle={{ width: '100%', margin: '-20px 0 10px 20px', alignItems: 'center' }}
          required
          label={'显示数据'}
        >
          {getFieldDecorator('categories', {
            initialValue: dataCategories.map(n => n.value),
            rules: [{ required: true }],
          })(<CheckboxGroup onChange={this.onChange} options={dataCategories} />)}
        </Item>
        {type !== '工位OEE' ? (
          <div style={{ margin: '0 0 20px 32px' }}>
            <span style={{ color: fontSub, marginRight: 10 }}>{changeChineseToLocale('显示数据说明')}</span>
            <span style={{ color: orange }}>{changeChineseToLocale('显示数据均以分钟为单位统计')}</span>
          </div>
        ) : null}
      </div>
    );
  }
}

ProductionCapacityFilter.contextTypes = {
  router: PropTypes.object,
  changeChineseToLocale: PropTypes.func,
};

export default withRouter(withForm({}, ProductionCapacityFilter));
