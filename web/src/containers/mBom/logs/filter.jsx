import React, { Component } from 'react';
import { middleGrey } from 'src/styles/color';
import { DatePicker, withForm, Button, Icon, FormattedMessage } from 'components';
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
        const fromAt = (dates[0] && formatToUnix(dayStart(dates[0]))) || null;
        const toAt = (dates[1] && formatToUnix(dayEnd(dates[1]))) || null;
        const { fetchData } = this.props;
        fetchData({ fromAt, toAt, page: 1, ...rest });
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
        <FormattedMessage defaultMessage={'操作时间'} style={{ color: middleGrey, fontSize: 14 }} />
        <div style={{ marginLeft: 10 }}>
          {getFieldDecorator('dates', {
            initialValue: [lastMonth, today],
          })(<RangePicker />)}
        </div>
        <Button style={{ width: 86, marginLeft: 10 }} onClick={this.onSearch} icon={'search'}>
          查询
        </Button>
      </div>
    );
  }
}

export default Filter;
