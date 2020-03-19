import React, { Component } from 'react';
import _ from 'lodash';
import { injectIntl } from 'react-intl';
import { changeChineseToLocale } from 'utils/locale/utils';
import { FormItem, Form, Button, Attachment, Input } from 'components';
import withForm from 'components/form';
import styles from './styles.scss';

type Props = {
  form: any,
  intl: any,
  onSubmit: () => {},
  onClose: () => {},
  closeModal: () => {},
};

class AddAttachment extends Component {
  props: Props;

  state = {};

  submit = () => {
    const { form, onSubmit, onClose, closeModal } = this.props;
    form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        try {
          const val = _.cloneDeep(values);
          onSubmit(val);
        } catch (e) {
          console.error(e);
        }
      }
    });
    closeModal();
    onClose();
  };

  render() {
    const { form, onClose, closeModal, intl } = this.props;
    const { getFieldDecorator } = form;
    return (
      <div className={styles.addAttachment}>
        <div style={{ paddingLeft: 60, paddingTop: 5 }}>
          <Form className={styles.materialBaseForm}>
            <FormItem label="标题">
              {getFieldDecorator('attachmentTitle', {
                rules: [{ max: 20, message: changeChineseToLocale('长度不能超过20个字符', intl) }],
              })(<Input style={{ width: 200 }} placeholder={'请输入该文件标题'} />)}
            </FormItem>
            <FormItem label="附件" style={{ marginTop: 20 }}>
              {getFieldDecorator('attachment', {})(
                <Attachment
                  style={{ width: 300, display: 'block' }}
                  tipStyle={{ width: 290, marginLeft: 0, lineHeight: '15px', marginTop: 4, top: 'unset' }}
                  max={1}
                />,
              )}
            </FormItem>
          </Form>
          <div className={styles.inModalFotter}>
            <Button
              className={styles.cancel}
              type="ghost"
              onClick={() => {
                closeModal();
                onClose();
              }}
            >
              放弃
            </Button>
            <Button type="primary" className={styles.ok} onClick={this.submit}>
              确定
            </Button>
          </div>
        </div>
      </div>
    );
  }
}

export default withForm({}, injectIntl(AddAttachment));
