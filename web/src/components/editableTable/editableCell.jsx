import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Input, Icon } from 'antd';

const errorStyle = { border: '0.5px solid red' };

class EditableCell extends Component {
  props: {
    check: any,
  };

  state = {
    value: this.props.value,
    editable: false,
    error: '',
    originValue: '',
  };

  componentWillMount() {
    this.state.originValue = this.props.value;
  }

  handleChange = e => {
    const value = e.target.value;
    this.setState({ value });
  };

  check = () => {
    if (this.props.check) {
      const error = this.props.check(this.state.value);
      if (error) {
        this.setState({ error });
        return;
      }
    }
    this.setState({ editable: false, originValue: this.state.value });
    global.log(this.props.onChange);
    if (this.props.onChange) {
      this.props.onChange(this.state.value);
    }
  };

  close = () => {
    this.setState({ value: this.state.originValue, editable: false });
  };

  edit = () => {
    this.setState({ editable: true });
  };
  render() {
    const { value, editable } = this.state;
    return (
      <div className="editable-cell">
        {editable
          ? <div className="editable-cell-input-wrapper">
            <Input
              value={value}
              onChange={this.handleChange}
              onPressEnter={this.check}
              style={this.state.error ? errorStyle : {}}
            />
            <div style={{ color: 'red' }}>{this.state.error}</div>
            <Icon type="check" className="editable-cell-icon-check" onClick={this.check} />
            <Icon type="close" className="editable-cell-icon-close" onClick={this.close} />
          </div>
          : <div className="editable-cell-text-wrapper">
            {value || ' '}
            <Icon type="edit" className="editable-cell-icon" onClick={this.edit} />
          </div>}
      </div>
    );
  }
}

EditableCell.propTypes = {
  value: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
  onChange: PropTypes.func,
};

export default EditableCell;
