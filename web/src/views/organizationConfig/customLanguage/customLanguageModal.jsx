import React, { Component } from 'react';
import LocalStorage from 'src/utils/localStorage';
import { withForm, FormItem, Input, message } from 'src/components';
import { getCustomLanguage, updateCustomLanguage } from 'src/services/organization';

type Props = {
  form: {},
  onUpdate: () => {},
  data: any,
};

class MustomLanguageModal extends Component {
  props: Props;

  submit = () => {
    const { form, data, onUpdate } = this.props;
    const { getFieldValue } = form;
    const newName = getFieldValue('name');
    return updateCustomLanguage({ id: data.id, name: newName })
      .then(async () => {
        data.moduleName = newName;
        const {
          data: { data: _data },
        } = await getCustomLanguage();
        const customLanguage = {};
        _data.forEach(n => {
          customLanguage[n.moduleType] = n.moduleName;
        });
        LocalStorage.set('customLanguage', customLanguage);
        message.success('编辑显示话术成功');
        onUpdate();
      });
  }

  render = () => {
    const { form, data } = this.props;
    const { getFieldDecorator } = form;
    return (
      <div>
        <div style={{ display: 'inline-block', margin: '20px 0 0 60px' }}>
          <FormItem label="显示话术">
            {getFieldDecorator('name', {
              initialValue: data.moduleName || '',
              rules: [
                { required: true, message: '显示话术必填' },
                {
                  validator: (rule, value, callback) => {
                    const reg = /\$+/g;
                    if (reg.test(value)) {
                      callback('不能包含$符号');
                    }
                    callback();
                  },
                },
                { max: 20, message: '长度不能超过20个字符' },
              ],
            })(
              <Input style={{ width: 200 }} placeholder="请输入要显示的话术" />,
            )}
          </FormItem>
        </div>
      </div>
    );
  }
}

export default withForm({ showFooter: true }, MustomLanguageModal);
