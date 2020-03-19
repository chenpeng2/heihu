import React, { Component } from 'react';
import PropTypes from 'prop-types';

import SearchSelect from 'src/components/select/searchSelect';
import { Button, FormItem, withForm } from 'src/components';

class SelectForSourceWarehouse extends Component {
  state = {
    value: null,
  };

  render() {
    const { cbForEnsure, onClose, form } = this.props;
    const { getFieldDecorator } = form || {};

    return (
      <div>
        <FormItem label={'发出仓库'}>
          {getFieldDecorator('sourceHouse', {})(
            <SearchSelect style={{ width: 450 }} params={{ status: 1 }} type={'wareHouseWithCode'} />,
          )}
        </FormItem>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <Button style={{ width: 110 }} type="ghost" onClick={onClose}>
            取消
          </Button>
          <Button
            style={{ width: 110, marginLeft: 20 }}
            onClick={async () => {
              form.validateFields((err, value) => {
                if (!err) {
                  cbForEnsure(value ? value.sourceHouse : null);
                  onClose();
                }
              });
            }}
          >
            确认
          </Button>
        </div>
      </div>
    );
  }
}

SelectForSourceWarehouse.propTypes = {
  style: PropTypes.object,
  cbForEnsure: PropTypes.any,
  onClose: PropTypes.any,
  form: PropTypes.any,
};

export default withForm({}, SelectForSourceWarehouse);
