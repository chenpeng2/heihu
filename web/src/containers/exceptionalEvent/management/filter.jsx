import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import _ from 'lodash';

import { FormattedMessage, withForm, FilterSortSearchBar, Select, Button, DatePicker } from 'src/components';
import SearchSelect from 'src/components/select/searchSelect';
import { middleGrey } from 'src/styles/color';
import { getTypeList } from 'src/services/knowledgeBase/exceptionalEvent';
import { arrayIsEmpty } from 'src/utils/array';
import WorkstationSelect from 'src/components/select/workstationSelect';
import { getParams } from 'src/utils/url';
import moment, { formatRangeTimeToMoment } from 'src/utils/time';

import {
  REPORT_TIME_LEVEL,
  RELATED_TASK,
  EVENT_STATUS,
  EXCEPTIONAL_EVENT_LEVEL,
  EXCEPTIONAL_EVENT_DURATION,
  findReportTimeLevel,
} from '../constant';

const ItemList = FilterSortSearchBar.ItemList;
const Item = FilterSortSearchBar.Item;
const Option = Select.Option;
const SelectGroup = Select.SelectGroup;
const { QuarterRangePicker, WeekPicker, MonthPicker } = DatePicker;
const EMPTY_VALUE = 'all';

// 格式化filter form的value
export const formatFilterFormValue = value => {
  if (!value) return null;

  const {
    operator,
    taskType,
    duration,
    level,
    subscribeScope,
    eventCategoryIds,
    status,
    reporters,
    timeFrom,
    timeTill,
  } = value || {};

  return {
    eventCategoryIds: arrayIsEmpty(eventCategoryIds)
      ? null
      : eventCategoryIds
          .map(i => i && i.key)
          .filter(i => i)
          .join(','),
    status: status === EMPTY_VALUE ? null : status,
    sourceIds: arrayIsEmpty(subscribeScope)
      ? null
      : subscribeScope
          .map(i => i && i.value)
          .filter(i => i)
          .join(','),
    reporterIds: arrayIsEmpty(reporters) ? null : reporters.map(({ key }) => key).join(','),
    handlerIds: operator ? operator.key : null,
    currentLevels: level && level !== EMPTY_VALUE ? level : null,
    processDurationType: duration && duration !== EMPTY_VALUE ? duration : null,
    sourceTaskTypes: taskType && taskType !== EMPTY_VALUE ? taskType : null,
    fromReportedTime: timeFrom ? Date.parse(timeFrom) : null,
    tillReportedTime: timeTill ? Date.parse(timeTill) : null,
  };
};

type Props = {
  style: {},
  fetchData: () => {},
  form: any,
  match: {},
};

class Filter extends Component {
  props: Props;
  state = {
    typeList: null,
    endOpen: false,
    timeFromLimit: null,
    timeTillLimit: null,
    timeTill: null,
    reportTimeLevel: REPORT_TIME_LEVEL.day.value,
  };

  componentDidMount() {
    const { form, fetchData } = this.props;
    const filter = _.get(getParams(), 'queryObj.filter');

    getTypeList({ size: 1000 })
      .then(res => {
        const data = _.get(res, 'data.data');

        this.setState({
          typeList: data,
        });
      })
      .then(() => {
        if (filter) {
          const { timeTill, timeFrom, ...rest } = filter || {};
          form.setFieldsValue({
            timeTill: timeTill ? moment(timeTill) : undefined,
            timeFrom: timeFrom ? moment(timeFrom) : undefined,
            ...rest,
          });
        } else {
          form.setFieldsValue({ reportTime: [moment().subtract(31, 'days'), moment()] });
        }
        form.validateFieldsAndScroll((err, value) => {
          if (!err && typeof fetchData === 'function') fetchData({ filter: value, page: 1 });
        });
      });
  }

  render_status_options = () => {
    const { changeChineseToLocale } = this.context;
    const status_options = Object.entries(EVENT_STATUS).map(([key, value]) => {
      return (
        <Option key={key} value={key}>
          {changeChineseToLocale(value)}
        </Option>
      );
    });
    status_options.unshift(
      <Option key={EMPTY_VALUE} value={EMPTY_VALUE}>
        {changeChineseToLocale('全部')}
      </Option>,
    );
    return status_options;
  };

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

  seasonDisabledStartDate = startValue => {
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

  seasonDisabledEndDate = endValue => {
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
    const { momentStr } = findReportTimeLevel(this.state.reportTimeLevel) || {};
    if (value && momentStr) {
      this.setState({ timeFromLimit: _.cloneDeep(value).add(300, momentStr) });
    }
  };

  onEndChange = value => {
    const { momentStr } = findReportTimeLevel(this.state.reportTimeLevel) || {};
    if (value && momentStr) {
      this.setState({ timeTillLimit: _.cloneDeep(value).subtract(300, momentStr) });
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

  renderTimePicker = () => {
    const { form } = this.props;
    const { getFieldDecorator } = form || {};
    const { reportTimeLevel: level, endOpen } = this.state;

    let TimePicker = DatePicker;
    switch (level) {
      case REPORT_TIME_LEVEL.day.value:
        TimePicker = DatePicker;
        break;
      case REPORT_TIME_LEVEL.week.value:
        TimePicker = WeekPicker;
        break;
      case REPORT_TIME_LEVEL.month.value:
        TimePicker = MonthPicker;
        break;
      case REPORT_TIME_LEVEL.season.value:
        TimePicker = MonthPicker;
        break;
      default:
        TimePicker = DatePicker;
    }

    return (
      <div style={{ display: 'flex', flexWrap: 'nowrap' }}>
        {getFieldDecorator('timeFrom', {
          rules: [{ required: true }],
        })(
          <TimePicker
            disabledDate={
              this.state.reportTimeLevel === REPORT_TIME_LEVEL.season.value
                ? this.seasonDisabledStartDate
                : this.disabledStartDate
            }
            onChange={this.onStartChange}
            onOpenChange={this.handleStartOpenChange}
          />,
        )}
        <div style={{ display: 'inline-block', textAlign: 'center', margin: '0 5px' }}>~</div>
        {getFieldDecorator('timeTill', {
          rules: [{ required: true }],
        })(
          <TimePicker
            disabledDate={
              this.state.reportTimeLevel === REPORT_TIME_LEVEL.season.value
                ? this.seasonDisabledEndDate
                : this.disabledEndDate
            }
            onChange={this.onEndChange}
            open={endOpen}
            onOpenChange={this.handleEndOpenChange}
          />,
        )}
      </div>
    );
  };

  render() {
    const { typeList } = this.state;
    const { form, fetchData, style } = this.props;
    const { changeChineseToLocale } = this.context;
    const { getFieldDecorator, getFieldsValue, resetFields } = form || {};

    return (
      <div style={style}>
        <FilterSortSearchBar searchDisabled>
          <ItemList>
            <Item label={'事件类型'}>
              {getFieldDecorator('eventCategoryIds')(
                <Select
                  labelInValue
                  mode={'multiple'}
                  placeholder={'请选择'}
                  type={'procureOrder'}
                  className="select-input"
                >
                  {Array.isArray(typeList)
                    ? typeList.map(({ id, name }) => {
                        return (
                          <Option value={id} key={id}>
                            {name}
                          </Option>
                        );
                      })
                    : null}
                </Select>,
              )}
            </Item>
            <Item label="设施位置">
              {getFieldDecorator('subscribeScope')(<WorkstationSelect labelInValue multiple placeholder={'请选择'} />)}
            </Item>
            <Item label={'事件等级'}>
              {getFieldDecorator('level', {
                initialValue: EMPTY_VALUE,
              })(
                <Select allowClear>
                  {[
                    <Option value={EMPTY_VALUE} key={EMPTY_VALUE}>
                      {changeChineseToLocale('全部')}
                    </Option>,
                  ].concat(
                    Object.values(EXCEPTIONAL_EVENT_LEVEL).map(i => {
                      const { name, value } = i || {};
                      return (
                        <Option value={value} key={value}>
                          {changeChineseToLocale(name)}
                        </Option>
                      );
                    }),
                  )}
                </Select>,
              )}
            </Item>
            <Item label="事件状态">
              {getFieldDecorator('status', {
                initialValue: EMPTY_VALUE,
              })(
                <Select placeholder={'请选择'} allowClear>
                  {this.render_status_options()}
                </Select>,
              )}
            </Item>
            <Item label={'处理人'}>
              {getFieldDecorator('operator')(<SearchSelect type={'account'} params={{ status: 1 }} />)}
            </Item>
            <Item label="报告人">
              {getFieldDecorator('reporters')(
                <SearchSelect mode={'multiple'} placeholder={'请选择'} type={'account'} className="select-input" />,
              )}
            </Item>
            <Item label={'处理时长'}>
              {getFieldDecorator('duration', {
                initialValue: EMPTY_VALUE,
              })(
                <Select>
                  {[
                    <Option key={EMPTY_VALUE} value={EMPTY_VALUE}>
                      {changeChineseToLocale('全部')}
                    </Option>,
                  ].concat(
                    Object.values(EXCEPTIONAL_EVENT_DURATION).map(i => {
                      const { name, value } = i || {};
                      return (
                        <Option key={value} value={value}>
                          {changeChineseToLocale(name)}
                        </Option>
                      );
                    }),
                  )}
                </Select>,
              )}
            </Item>
            <Item label="报告时间维度">
              <SelectGroup
                value={this.state.reportTimeLevel}
                onChange={v => {
                  this.setState({ reportTimeLevel: v });
                }}
                groupData={Object.values(REPORT_TIME_LEVEL).map(i => {
                  const { name, value } = i || {};
                  return { label: name, value };
                })}
              />
            </Item>
            <Item label="报告时间">{this.renderTimePicker()}</Item>
            <Item label={'任务'}>
              {getFieldDecorator('taskType', {
                initialValue: EMPTY_VALUE,
              })(
                <Select>
                  {[
                    <Option key={EMPTY_VALUE} value={EMPTY_VALUE}>
                      {changeChineseToLocale('全部')}
                    </Option>,
                  ].concat(
                    Object.values(RELATED_TASK).map(i => {
                      const { name, value } = i || {};
                      return (
                        <Option key={value} value={value}>
                          {changeChineseToLocale(name)}
                        </Option>
                      );
                    }),
                  )}
                </Select>,
              )}
            </Item>
          </ItemList>
          <Button
            icon="search"
            onClick={() => {
              const value = getFieldsValue();
              fetchData({
                page: 1,
                filter: value,
              });
            }}
          >
            查询
          </Button>
          <FormattedMessage
            style={{ color: middleGrey, cursor: 'pointer', margin: '0 10px', lineHeight: '28px' }}
            onClick={() => {
              resetFields();
              const value = getFieldsValue();
              fetchData({
                page: 1,
                filter: value,
              });
            }}
            defaultMessage={'重置'}
          />
        </FilterSortSearchBar>
      </div>
    );
  }
}

Filter.contextTypes = {
  changeChineseToLocale: PropTypes.any,
};

export default withForm({}, withRouter(Filter));
