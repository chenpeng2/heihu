import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Select, FormItem, withForm } from 'src/components';

class ReplaceMaterial extends Component {
  state = {};

  submit = value => {
    console.log(value);
    const { changeMaterial } = this.props;

    if (typeof changeMaterial === 'function' && value) {
      changeMaterial(value);
    }
  };

  renderSelect = (props) => {
    const { replaceMaterials } = this.props;

    return (
      <Select {...props} style={{ width: 500 }} labelInValue >
        { Array.isArray(replaceMaterials) && replaceMaterials.length ?
           replaceMaterials.map(i => {
             const { code, name } = i || {};
             return (<Select.Option value={code} >{`${code}/${name}`}</Select.Option>);
           })
          : null
        }
      </Select>
    );
  }

  render() {
    const { form } = this.props;
    const { getFieldDecorator } = form;

    return (
      <div>
        <FormItem label={'替换物料'}>
          {getFieldDecorator('material', {
            rules: [
              {
                required: true,
                message: '物料必填',
              },
            ],
          })(this.renderSelect())}
        </FormItem>
      </div>
    );
  }

}

ReplaceMaterial.propTypes = {
  style: PropTypes.object,
  form: PropTypes.any,
  changeMaterial: PropTypes.func,
  replaceMaterials: PropTypes.any,
};

export default withForm({ showFooter: true }, ReplaceMaterial);
