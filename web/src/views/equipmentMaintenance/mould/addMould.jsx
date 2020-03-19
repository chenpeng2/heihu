import * as React from 'react';
import {
  Form,
  FormItem,
  Button,
  withForm,
  Input,
  Attachment,
  DatePicker,
  message,
  InputNumber,
  Textarea,
  RecordHistorySelect,
} from 'components';
import _ from 'lodash';
import { lengthValidate, checkPositiveInteger, orderNumberFormat } from 'components/form';
import SearchSelect from 'components/select/searchSelect';
import { setDayStart, formatToUnix } from 'utils/time';
import { addMould } from 'services/equipmentMaintenance/mould';
import styles from './index.scss';

type propsType = {
  form: any,
  history: any,
};

const { ImgAttachments } = Attachment;
const width = 300;
class AddMould extends React.Component<propsType> {
  state = {
    isSubmit: null,
  };

  onSubmit = () => {
    const { form: { validateFields }, history: { push } } = this.props;
    validateFields((err, values) => {
      const { deliverDate, admitDate, firstEnableDate, attachments, picture, categoryId } = values;
      const submitValue = {
        ...values,
        deliverDate: deliverDate && formatToUnix(setDayStart(deliverDate)),
        admitDate: admitDate && formatToUnix(setDayStart(admitDate)),
        firstEnableDate: firstEnableDate && formatToUnix(setDayStart(firstEnableDate)),
        attachments: attachments && attachments.map(({ restId }) => restId),
        picture: _.get(picture, '[0].restId'),
        categoryId: categoryId.key,
      };
      this.setState({ isSubmit: true });
      addMould(submitValue).then(({ data: { data: { id } } }) => {
        push(`/equipmentMaintenance/mould/detail/${id}`);
        message.success('创建成功！');
      });
    });
  };

  render() {
    const { form: { getFieldDecorator, getFieldValue } } = this.props;
    const { isSubmit } = this.state;
    return (
      <div>
        <p className={styles.header}>创建模具</p>
        <Form className={styles.form}>
          <FormItem label="图片">
            {getFieldDecorator('picture', {})(<ImgAttachments listType="picture-card" maxCount={1} />)}
          </FormItem>
          <FormItem label="类型">
            {getFieldDecorator('categoryId', {
              rules: [{ required: true, message: '必填' }],
            })(
              <RecordHistorySelect
                placeholder={'请选择类型'}
                style={{ width }}
                type="deviceCategory"
                params={{ searchType: 'mould' }}
                isSubmit={this.state.isSubmit}
                storageType={'mouldCategory'}
                newUrl={'/knowledgeManagement/moldType/create'}
              />,
            )}
          </FormItem>
          <FormItem label="编码">
            {getFieldDecorator('code', {
              rules: [
                { required: true, message: '名称必填' },
                {
                  validator: lengthValidate(6, 32),
                },
                {
                  validator: orderNumberFormat('编码'),
                },
              ],
            })(<Input style={{ width }} placeholder="请输入编码" trim />)}
          </FormItem>
          <FormItem label="名称">
            {getFieldDecorator('name', {
              rules: [{ required: true, message: '必填' }, { validator: lengthValidate(2, 30) }],
            })(<Input style={{ width }} placeholder="请输入名称" trim />)}
          </FormItem>
          <FormItem label="电子标签">
            {getFieldDecorator('qrcode', {
              rules: [{ validator: lengthValidate(6, 32) }],
            })(<Input style={{ width }} placeholder="请输入的厂内电子标签号码" trim />)}
          </FormItem>
          <FormItem label="制造商">
            {getFieldDecorator('manufacturerId')(
              <SearchSelect
                style={{ width }}
                type="manufacturer"
                placeholder="请选择制造商"
                labelInValue={false}
              />,
            )}
          </FormItem>
          <FormItem label="型号">
            {getFieldDecorator('model', {
              rules: [{ validator: lengthValidate(undefined, 60) }],
            })(<Input placeholder="请输入制造商提供的型号" style={{ width }} trim />)}
          </FormItem>
          <FormItem label="序列号">
            {getFieldDecorator('serialNumber', {
              rules: [{ validator: lengthValidate(undefined, 20) }],
            })(<Input style={{ width }} placeholder="请输入制造商提供的序列号" trim />)}
          </FormItem>
          <FormItem label="穴数">
            {getFieldDecorator('holesNumber', {
              rules: [
                { required: true, message: '穴数必填' },
                { validator: checkPositiveInteger() },
              ],
            })(<InputNumber style={{ width }} placeholder="请输入模具穴数" />)}
          </FormItem>
          <FormItem label="出厂日期">
            {getFieldDecorator('deliverDate')(
              <DatePicker style={{ width }} placeholder="请选择出厂日期" />,
            )}
          </FormItem>
          <FormItem label="入厂日期">
            {getFieldDecorator('admitDate')(
              <DatePicker style={{ width }} placeholder="请选择入厂日期" />,
            )}
          </FormItem>
          <FormItem label="首次启用日期">
            {getFieldDecorator('firstEnableDate')(
              <DatePicker style={{ width }} placeholder="请选择首次启用日期" />,
            )}
          </FormItem>
          <FormItem label="规格描述">
            {getFieldDecorator('description', {
              rules: [{ validator: lengthValidate(undefined, 200) }],
            })(<Textarea style={{ width }} placeholder="请输入规格描述" maxLength={200} />)}
          </FormItem>
          <FormItem label="附件">
            {getFieldDecorator('attachments', {})(<Attachment max={5} />)}
          </FormItem>
          <FormItem label=" ">
            <Button onClick={this.onSubmit}>保存</Button>
          </FormItem>
        </Form>
      </div>
    );
  }
}

export default withForm({}, AddMould);
