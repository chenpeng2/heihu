import * as React from 'react';
import { withForm, FormItem, Input, message } from 'components';
import SearchSelect from 'components/select/searchSelect';
import { createReceiptCategory, editReceiptCategory } from 'services/shipment/receipt';
import { createSendCategory, editSendCategory } from 'services/shipment/send';
import Color from 'styles/color';

const colors = [
  Color.primary,
  Color.orange,
  Color.blue,
  Color.red,
  Color.skyBlue,
  Color.purple,
  Color.khaki,
  Color.blackPurple,
  Color.blueGreen,
  Color.greenBrown,
  Color.placeholder,
];

class TransportTypeForm extends React.PureComponent<any> {
  state = { markColor: Color.primary };

  componentDidMount() {
    const { edit, value, form: { setFieldsValue } } = this.props;
    if (edit) {
      const { id, name, warehouse, unit, markColor } = value;
      this.setState({
        markColor: colors.indexOf(markColor) !== -1 ? markColor : Color.primary,
      });
      setFieldsValue({
        type: name,
        warehouseId: {
          key: warehouse.id,
          label: warehouse.name,
        },
        unit: {
          key: unit.id,
          label: unit.name,
        },
      });
    }
  }

  submit = async value => {
    const { type, edit, callback } = this.props;
    const { markColor } = this.state;
    const submitValue = {
      markColor,
      name: value.type,
      warehouseId: value.warehouseId.key,
      unitId: value.unit.key,
    };
    if (type === 'receipt') {
      if (edit) {
        await editReceiptCategory(this.props.value.id, submitValue);
      } else {
        await createReceiptCategory(submitValue);
      }
    } else if (type === 'send') {
      if (edit) {
        await editSendCategory(this.props.value.id, submitValue);
      } else {
        await createSendCategory(submitValue);
      }
    }
    message.success('操作成功！');
    callback();
  };

  render() {
    const { form: { getFieldDecorator, setFieldsValue }, type, edit } = this.props;
    const { markColor } = this.state;
    return (
      <div>
        <FormItem label={type === 'receipt' ? '收货类型' : '发运类型'}>
          {getFieldDecorator('type', {
            rules: [
              { required: true, message: '请填写类型' },
              {
                max: 10,
                message: '类型长度不能超过10个字',
              },
            ],
          })(<Input />)}
        </FormItem>
        <FormItem label="标记颜色" required>
          <div style={{ display: 'flex' }}>
            <div style={{ display: 'flex', height: 40, alignItems: 'center' }}>
              {colors.map(color => (
                <div
                  style={{
                    width: 22,
                    height: 22,
                    display: 'inline-block',
                    background: color,
                    marginRight: 20,
                    borderRadius: 4,
                    cursor: 'pointer',
                    opacity: markColor === color ? 1 : 0.15,
                  }}
                  key={color}
                  onClick={() => {
                    this.setState({ markColor: color });
                  }}
                />
              ))}
            </div>
          </div>
        </FormItem>
        <FormItem label="所属仓库">
          {getFieldDecorator('warehouseId', {
            rules: [{ required: true, message: '所属仓库不能为空' }],
          })(<SearchSelect type="wareHouse" style={{ width: 450 }} params={{ status: 1 }} />)}
        </FormItem>
        <FormItem label="默认单位">
          {getFieldDecorator('unit', {
            rules: [{ required: true, message: '请填写默认单位' }],
          })(<SearchSelect type="unit" style={{ width: 450 }} />)}
        </FormItem>
      </div>
    );
  }
}

export default withForm({}, TransportTypeForm);
