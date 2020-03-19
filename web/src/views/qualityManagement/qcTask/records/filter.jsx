import React, { Component } from 'react';
import { middleGrey } from 'src/styles/color';
import { DatePicker, withForm, Button, Icon, Text } from 'components';
import moment, { formatToUnix, dayStart, dayEnd } from 'utils/time';

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
        const from_at = dates[0] && formatToUnix(dayStart(dates[0]));
        const to_at = dates[1] && formatToUnix(dayEnd(dates[1]));
        const { fetchData } = this.props;
        console.log(from_at, to_at);
        fetchData({ from_at, to_at, page: 1, ...rest });
      }
    });
  };

  render() {
    const {
      form: { getFieldDecorator },
    } = this.props;
    const lastMonth = moment().subtract(1, 'months');
    const today = moment();

    return (
      <div style={{ display: 'flex', alignItems: 'center', margin: 20 }}>
        <span style={{ color: middleGrey, fontSize: 14 }}>
          <Text>操作时间</Text>
        </span>
        <div style={{ marginLeft: 10 }}>
          {getFieldDecorator('dates', {
            initialValue: [lastMonth, today],
          })(<RangePicker />)}
        </div>
        <Button style={{ width: 86, marginLeft: 10 }} onClick={this.onSearch}>
          <Icon type="search" />
          <Text>查询</Text>
        </Button>
      </div>
    );
  }
}

export default Filter;
