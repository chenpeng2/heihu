import { DatePicker } from 'antd'
import React from 'react'


class BlDatePicker extends React.Component {
  state = {
    size: 'default',
  };

  handleSizeChange = e => {
    this.setState({ size: e.target.value });
  };

  changeDate(date, time) {
    console.log(date.format('YYYY-MM-DD'), time)

  }

  render() {
    const { size } = this.state;
    return (
        <DatePicker onChange={this.changeDate}size={size} />
    );
  }
}

export default BlDatePicker