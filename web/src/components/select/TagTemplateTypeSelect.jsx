import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { Select } from 'components';
import { arrayIsEmpty } from 'utils/array';
import { getBusinessList, getBusinessFiles } from 'src/services/electronicTag/template';

const Option = Select.Option;
const selectBaseStyle = { width: 300 };

class TagTemplateTypeSelect extends React.Component {
  state = { templateTypes: [] };

  componentDidMount() {
    this.fetchData(this.props.types);
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (nextProps.types !== this.props.types) {
      this.fetchData(nextProps.types);
    }
    return true;
  }

  fetchData = types => {
    getBusinessList()
      .then(res => {
        const data = _.get(res, 'data.data');
        const filter = arrayIsEmpty(data)
          ? []
          : data.filter(n => {
              if (arrayIsEmpty(types)) return n;
              return types.includes(n.type);
            });
        this.setState({ templateTypes: filter });
      })
      .catch(err => console.log(err));
  };

  render() {
    const { templateTypes } = this.state;
    return (
      <Select placeholder="请选择标签模板类型" style={selectBaseStyle} {...this.props}>
        {arrayIsEmpty(templateTypes)
          ? []
          : templateTypes.map(({ type, typeName }) => <Option value={type}>{typeName}</Option>)}
      </Select>
    );
  }
}

TagTemplateTypeSelect.propTypes = {
  types: PropTypes.arrayOf(PropTypes.number),
};

export default TagTemplateTypeSelect;
