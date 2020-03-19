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
  Textarea,
  RecordHistorySelect,
} from 'components';
import { injectIntl } from 'react-intl';
import { changeChineseToLocale } from 'utils/locale/utils';
import { lengthValidate, equipCodeFormat } from 'components/form';
import SearchSelect from 'components/select/searchSelect';
import { setDayStart, formatToUnix } from 'utils/time';
import _ from 'lodash';
import { addDevice, addModule } from 'services/equipmentMaintenance/device';
import styles from './index.scss';

type propsType = {
  form: any,
  intl: any,
  location: any,
  history: {
    push: () => {},
  },
};

const { ImgAttachments } = Attachment;
const width = 300;
class AddDevice extends React.Component<propsType> {
  state = {
    isSubmit: null,
  };

  onSubmit = () => {
    const {
      form: { validateFieldsAndScroll },
      location: { query },
      history: { push },
    } = this.props;
    validateFieldsAndScroll((err, values) => {
      if (!err) {
        const { deliverDate, admitDate, firstEnableDate, attachments, picture, categoryId, workshopId } = values;
        const submitValue = {
          ...values,
          deliverDate: deliverDate && formatToUnix(setDayStart(deliverDate)),
          admitDate: admitDate && formatToUnix(setDayStart(admitDate)),
          firstEnableDate: firstEnableDate && formatToUnix(setDayStart(firstEnableDate)),
          attachments: attachments && attachments.map(({ restId }) => restId),
          picture: _.get(picture, '[0].restId'),
          categoryId: categoryId.key,
          workshopId: workshopId.key,
        };
        this.setState({ isSubmit: true });
        if (query.deviceId) {
          submitValue.equipmentProdId = query.deviceId;
          addModule(submitValue).then(({ data: { data: { id } } }) => {
            push(`/equipmentMaintenance/device/detail/device/${query.deviceId}?type=device`);
            message.success('创建成功！');
          });
        } else {
          addDevice(submitValue).then(({ data: { data: { id } } }) => {
            push(`/equipmentMaintenance/device/detail/device/${id}?type=device`);
            message.success('创建成功！');
          });
        }
      }
    });
  };

  render() {
    const {
      form: { getFieldDecorator },
      location: {
        query: { deviceId, workshop },
      },
      intl,
    } = this.props;
    const _workshop = workshop && JSON.parse(workshop);
    return (
      <div>
        <p className={styles.header}>{changeChineseToLocale(deviceId ? '创建设备组件' : '创建设备', intl)}</p>
        <Form className={styles.form}>
          <FormItem label="图片">
            {getFieldDecorator('picture', {})(<ImgAttachments listType="picture-card" maxCount={1} />)}
          </FormItem>
          <FormItem label="类型">
            {getFieldDecorator('categoryId', {
              rules: [{ required: true, message: changeChineseToLocale('类型必填', intl) }],
            })(
              <RecordHistorySelect
                placeholder={'请选择类型'}
                style={{ width }}
                type="deviceCategory"
                params={{ searchResourceCategory: deviceId ? 'equipmentModule' : 'equipmentProd' }}
                isSubmit={this.state.isSubmit}
                storageType={deviceId ? 'equipmentModuleCategory' : 'equipmentProdCategory'}
                newUrl={'/knowledgeManagement/equipmentType/create'}
              />,
            )}
          </FormItem>
          <FormItem label="编码">
            {getFieldDecorator('code', {
              rules: [
                { required: true, message: changeChineseToLocale('编码必填', intl) },
                {
                  validator: lengthValidate(6, 32),
                },
                {
                  validator: equipCodeFormat(changeChineseToLocale('编码', intl)),
                },
              ],
            })(<Input style={{ width }} placeholder="请输入编码" trim />)}
          </FormItem>
          <FormItem label="名称">
            {getFieldDecorator('name', {
              rules: [
                { required: true, message: changeChineseToLocale('名称必填', intl) },
                { validator: lengthValidate(2, 30) },
              ],
            })(<Input style={{ width }} placeholder="请输入名称" trim />)}
          </FormItem>
          <FormItem label="外部ID">
            {getFieldDecorator('outerId', {
              rules: [{ validator: lengthValidate(6, 32) }],
            })(<Input style={{ width }} placeholder="该ID将用于设备数据对接" trim />)}
          </FormItem>
          <FormItem label="电子标签">
            {getFieldDecorator('qrcode', {
              rules: [{ validator: lengthValidate(6, 32) }],
            })(<Input style={{ width }} placeholder="请输入的厂内电子标签号码" trim />)}
          </FormItem>
          <FormItem label="车间">
            {getFieldDecorator('workshopId', {
              initialValue: (_workshop && { label: _workshop.name, key: _workshop.id }) || [],
            })(<SearchSelect style={{ width }} type="workshop" placeholder="请选择车间" />)}
          </FormItem>
          <FormItem label="制造商">
            {getFieldDecorator('manufacturerId')(
              <SearchSelect style={{ width }} type="manufacturer" placeholder="请选择制造商" labelInValue={false} />,
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
          <FormItem label="出厂日期">
            {getFieldDecorator('deliverDate')(
              <DatePicker style={{ width }} placeholder={changeChineseToLocale('请选择出厂日期', intl)} />,
            )}
          </FormItem>
          <FormItem label="入厂日期">
            {getFieldDecorator('admitDate')(
              <DatePicker style={{ width }} placeholder={changeChineseToLocale('请选择入厂日期', intl)} />,
            )}
          </FormItem>
          <FormItem label="首次启用日期">
            {getFieldDecorator('firstEnableDate')(
              <DatePicker style={{ width }} placeholder={changeChineseToLocale('请选择首次启用日期', intl)} />,
            )}
          </FormItem>
          <FormItem label="规格描述">
            {getFieldDecorator('description', {
              rules: [{ validator: lengthValidate(undefined, 200) }],
            })(<Textarea style={{ width, height: 200 }} placeholder="请输入规格描述" maxLength={200} />)}
          </FormItem>
          <FormItem label="附件">
            {getFieldDecorator('attachments', {})(<Attachment max={deviceId ? 5 : 3} />)}
          </FormItem>
          <FormItem label=" ">
            <Button onClick={this.onSubmit}>保存</Button>
          </FormItem>
        </Form>
      </div>
    );
  }
}

export default withForm({}, injectIntl(AddDevice));
