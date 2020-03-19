import React from 'react';
import _ from 'lodash';
import { Select } from 'components';
import {
  getCarriers,
  getDrivers,
  getPlateNumbers,
  getParkingList,
} from 'src/services/shipment/carrier';
import styles from './CarSelect.scss';

const Option = Select.Option;

export const validatorSelectLabelLength = max => (rule, value, callback) => {
  if (value && value.key) {
    const { label } = value;
    if (label.length > max) {
      callback(`长度不能超过${max}`);
    }
    callback();
  }
  callback();
};

class CarSelect extends React.PureComponent<any> {
  constructor(props) {
    super(props);
    this.handleSearch = _.debounce(this.handleSearch, 800);
    this.state = {
      children: [],
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.value !== this.props.value) {
      this.setState({ value: nextProps.value });
    }
    if (nextProps.carrierId !== this.props.carrierId) {
      this.setState({ children: [] });
    }
  }

  handleSearch = async search => {
    const { type, carrierId, onChange, warehouseId } = this.props;
    if (search) {
      onChange({ key: 'user-defined', label: search });
    }
    let options = [];
    if (type === 'carrier') {
      const { data: { data } } = await getCarriers({ name: search, size: 50 });
      options = data.map(({ name, id }) => <Option key={id}>{name}</Option>);
    } else if (type === 'plateNumber' && carrierId !== 'user-defined') {
      const { data: { data } } = await getPlateNumbers({ code: search });
      options = data.map(({ code, logisticsCarrier: { name, id } }) => (
        <Option key={JSON.stringify({ code, carrierId: id, carrierName: name })}>
          <div style={{ width: '100%' }} className={styles.input}>
            <span>{code}</span>
            <span style={{ float: 'right' }}>{name}</span>
          </div>
        </Option>
      ));
    } else if (type === 'driver' && carrierId !== 'user-defined') {
      const { data: { data } } = await getDrivers({ carrierId, name: search, size: 50 });
      options = data.map(({ name, phone, logisticsCarrier: { name: carrierName, id } }) => (
        <Option key={JSON.stringify({ name, carrierId: id, carrierName, phone })}>
          <div style={{ width: '100%' }} className={styles.input}>
            <span>{name}</span>
            <span style={{ float: 'right' }}>{carrierName}</span>
          </div>
        </Option>
      ));
    } else if (type === 'parking') {
      const { data: { data } } = await getParkingList({ name: search, warehouseId, size: 50 });
      options = data.map(({ name, id }) => <Option key={id}>{name}</Option>);
    }
    this.setState({
      children: options,
    });
  };

  render() {
    const { type, onChange, ...rest } = this.props;
    const { children, value } = this.state;
    return (
      <Select
        labelInValue
        showSearch
        onSearch={this.handleSearch}
        className={styles.select}
        {...rest}
        onFocus={this.handleSearch}
        onChange={value => {
          onChange(value);
        }}
      >
        {children}
      </Select>
    );
  }
}

export default CarSelect;
