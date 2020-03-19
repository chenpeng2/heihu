import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { Select } from 'components';
import { arrayIsEmpty } from 'utils/array';
import { getBusinessFiles } from 'src/services/electronicTag/template';

const Option = Select.Option;
const selectBaseStyle = { width: 300 };

class TagTemplateSelect extends React.Component {
  state = { templates: [], defaultTemplateFileId: null };

  componentDidMount() {
    this.fetchData(this.props.type);
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (nextProps.type !== this.props.type) {
      this.fetchData(nextProps.type);
    }
    return true;
  }

  fetchData = type => {
    if (typeof type === 'number') {
      getBusinessFiles(type)
        .then(res => {
          const data = _.get(res, 'data.data');
          const { templates } = data || {};
          const defaultTemplate = arrayIsEmpty(templates) ? null : _.find(templates, o => o.defaulted);
          this.setState({
            templates,
            defaultTemplateFileId: defaultTemplate ? defaultTemplate.attachmentId : null,
          });
        })
        .catch(err => console.log(err));
    }
  };

  render() {
    const { templates } = this.state;

    return (
      <Select placeholder="请选择标签模板" style={selectBaseStyle} {...this.props}>
        {arrayIsEmpty(templates)
          ? []
          : templates.map(({ attachmentId, fileName, defaulted }) => {
              const label = `${fileName}${defaulted ? '（默认）' : ''}`;
              return (
                <Option title={label} value={attachmentId}>
                  {label}
                </Option>
              );
            })}
      </Select>
    );
  }
}

TagTemplateSelect.propTypes = {
  type: PropTypes.number,
  showDefaultValue: PropTypes.bool,
};

export default TagTemplateSelect;
