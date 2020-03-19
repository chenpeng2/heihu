import React from 'react';
import { changeChineseToLocaleWithoutIntl } from 'utils/locale/utils';
import { Input, Radio, FormItem, Textarea } from 'src/components';
import { checkStringLength } from 'components/form';

type Props = {
  history: any,
  type: string,
  form: any,
};

const RadioGroup = Radio.Group;
const itemStyle = { width: 300, height: 32 };

const Base = (props: Props) => {
  const {
    form: { getFieldDecorator },
  } = props;

  return (
    <div>
      <FormItem label="名称">
        {getFieldDecorator('name', {
          rules: [
            { validator: checkStringLength(50) },
            { required: true, message: changeChineseToLocaleWithoutIntl('不良原因名称必填') },
          ],
        })(<Input style={itemStyle} placeholder={'请输入'} />)}
      </FormItem>
      <FormItem label="状态">
        {getFieldDecorator('status', {
          initialValue: 1,
        })(
          <RadioGroup style={itemStyle}>
            <Radio value={1} style={{ marginRight: 100 }}>
              {changeChineseToLocaleWithoutIntl('启用')}
            </Radio>
            <Radio value={0}>{changeChineseToLocaleWithoutIntl('停用')}</Radio>
          </RadioGroup>,
        )}
      </FormItem>
      <FormItem label="备注">
        {getFieldDecorator('description')(
          <Textarea maxLength={100} placeholder={'请输入备注'} style={{ width: 300, height: 100 }} />,
        )}
      </FormItem>
    </div>
  );
};

export default Base;
