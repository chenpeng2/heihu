import React, { Component } from 'react';
import { middleGrey } from 'src/styles/color';
import { DatePicker, withForm, Button, Icon } from 'components';
import moment, { formatToUnix, dayStart, dayEnd } from 'utils/time';
import PropTypes from 'prop-types';

const { RangePicker } = DatePicker;

type Props = {
  form: {
    getFieldDecorator: () => {},
    validateFields: () => {},
  },
  fetchData: () => {},
};

class Filter extends Component {
  props: Props;
  state = {};

  componentDidMount = () => {
    this.onSearch();
  };

  onSearch = () => {
    this.props.form.validateFields((err, values) => {
      if (!err) {
        const { dates, ...rest } = values;
        const searchStartTime = dates[0] && formatToUnix(dayStart(dates[0]));
        const searchEndTime = dates[1] && formatToUnix(dayEnd(dates[1]));
        const { fetchData } = this.props;
        fetchData({ searchStartTime, searchEndTime, page: 1, ...rest });
      }
    });
  };

  render() {
    const {
      form: { getFieldDecorator },
    } = this.props;
    const { changeChineseToLocale } = this.context;
    const lastMonth = moment().subtract(1, 'months');
    const today = moment();

    return (
      <div style={{ display: 'flex', alignItems: 'center', margin: 20 }}>
        <span style={{ color: middleGrey, fontSize: 14 }}>{changeChineseToLocale('操作时间')}</span>
        <div style={{ marginLeft: 10 }}>
          {getFieldDecorator('dates', {
            initialValue: [lastMonth, today],
          })(<RangePicker allowClear />)}
        </div>
        <Button style={{ width: 86, marginLeft: 10 }} onClick={this.onSearch}>
          <Icon type="search" />
          {changeChineseToLocale('查询')}
        </Button>
      </div>
    );
  }
}

Filter.contextTypes = {
  changeChineseToLocale: PropTypes.any,
};

export default Filter;
