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
import SearchSelect from 'components/select/searchSelect';
import { setDayStart, formatToUnix, formatUnixMoment } from 'utils/time';
import { lengthValidate, orderNumberFormat } from 'components/form';
import { injectIntl } from 'react-intl';
import { changeChineseToLocale } from 'utils/locale/utils';
import { wrapUrl } from 'utils/attachment';
import { showLoading } from 'utils/loading';
import { MODULE } from 'src/views/equipmentMaintenance/constants';
import { getDeviceEditDetail, getModuleDetail, updateDevice, updateModule } from 'services/equipmentMaintenance/device';
import _ from 'lodash';
import styles from './index.scss';

type propsType = {
  form: any,
  match: {
    params: {
      id: string,
      type: 'module' | 'device',
    },
  },
  intl: any,
  location: any,
  history: any,
};
const { ImgAttachments } = Attachment;
const width = 300;
class EditDevice extends React.Component<propsType> {
  state = {
    isSubmit: null,
    initialCategory: {},
  };

  componentDidMount() {
    this.setPageData();
  }

  setPageData = async () => {
    const {
      match: {
        params: { id, type },
      },
      form: { setFieldsValue },
    } = this.props;
    showLoading(true);
    const {
      data: { data },
    } = type === MODULE ? await getModuleDetail(id) : await getDeviceEditDetail(id);
    const _data = type === 'module' ? data.entity : data;
    const {
      category: { id: categoryId, name: categoryName },
      code,
      name,
      outerId,
      qrcode,
      model,
      serialNumber,
      deliverDate,
      admitDate,
      firstEnableDate,
      description,
      attachmentsFile,
      pictureFile,
    } = _data;
    const manufacturerId =
      _data.manufacturer && _data.manufacturer.id !== 0
        ? { key: _data.manufacturer.id, label: _data.manufacturer.name }
        : [];
    const fieldsValue = {
      categoryId: { key: categoryId, label: categoryName },
      code,
      name,
      outerId,
      qrcode,
      manufacturerId,
      model,
      serialNumber,
      deliverDate: deliverDate === null ? undefined : formatUnixMoment(deliverDate),
      admitDate: admitDate === null ? undefined : formatUnixMoment(admitDate),
      firstEnableDate: firstEnableDate === null ? undefined : formatUnixMoment(firstEnableDate),
      description,
      attachments:
        attachmentsFile &&
        attachmentsFile.map(({ original_filename, id }) => ({
          id,
          restId: id,
          originalFileName: original_filename,
        })),
      picture: pictureFile && [
        {
          id: pictureFile.id,
          restId: pictureFile.id,
          originalFileName: pictureFile.original_filename,
          url: wrapUrl(pictureFile.id),
        },
      ],
    };
    showLoading(false);
    this.setState({ initialCategory: { key: categoryId, label: categoryName } });
    setFieldsValue(fieldsValue);
  };

  onSubmit = () => {
    const {
      form: { validateFieldsAndScroll },
      match: {
        params: { id, type },
      },
      history: { push },
    } = this.props;
    validateFieldsAndScroll((err, values) => {
      if (!err) {
        const {
          deliverDate,
          admitDate,
          firstEnableDate,
          attachments,
          picture,
          categoryId,
          manufacturerId,
          workshopId,
        } = values;
        const submitValue = {
          ...values,
          deliverDate: deliverDate && formatToUnix(setDayStart(deliverDate)),
          admitDate: admitDate && formatToUnix(setDayStart(admitDate)),
          firstEnableDate: firstEnableDate && formatToUnix(setDayStart(firstEnableDate)),
          attachments: attachments && attachments.map(({ restId }) => restId),
          picture: _.get(picture, '[0].restId'),
          categoryId: categoryId.key,
          workshopId: workshopId.key,
          manufacturerId: (manufacturerId && manufacturerId.key) || '',
        };
        if (!manufacturerId) {
          delete submitValue.manufacturerId;
        }
        this.setState({ isSubmit: true });
        if (type === 'module') {
          updateModule(id, submitValue).then(() => {
            message.success('更新设备成功！');
            push(`/equipmentMaintenance/device/detail/module/${id}?type=module`);
          });
        } else {
          updateDevice(id, submitValue).then(() => {
            push(`/equipmentMaintenance/device/detail/device/${id}?type=device`);
          });
        }
      }
    });
  };

  render() {
    const {
      form: { getFieldDecorator },
      match: {
        params: { type },
      },
      location: {
        query: { workshop },
      },
      intl,
    } = this.props;
    const _workshop = workshop && JSON.parse(workshop);
    return (
      <div>
        <p className={styles.header}>{changeChineseToLocale(`编辑${type === 'device' ? '设备' : '设备组件'}`, intl)}</p>
        <Form className={styles.form}>
          <FormItem label="图片">
            {getFieldDecorator('picture', {})(<ImgAttachments listType="picture-card" maxCount={1} />)}
          </FormItem>
          <FormItem label="类型">
            {getFieldDecorator('categoryId', {
              rules: [{ required: true, message: changeChineseToLocale('必填', intl) }],
            })(
              <RecordHistorySelect
                disabled
                placeholder={'请选择类型'}
                style={{ width }}
                type="deviceCategory"
                params={{ searchResourceCategory: type === 'device' ? 'equipmentProd' : 'equipmentModule' }}
                isSubmit={this.state.isSubmit}
                initialValue={[this.state.initialCategory]}
                storageType={'equipmentCategory'}
              />,
            )}
          </FormItem>
          <FormItem label="编码">
            {getFieldDecorator('code', {
              rules: [
                { required: true, message: changeChineseToLocale('必填', intl) },
                {
                  validator: lengthValidate(6, 32),
                },
                {
                  validator: orderNumberFormat(changeChineseToLocale('编码', intl)),
                },
              ],
            })(<Input style={{ width }} placeholder="请输入编码" trim disabled />)}
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
              <SearchSelect style={{ width }} type="manufacturer" placeholder="请选择制造商" />,
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
            })(<Textarea style={{ width }} placeholder="请输入规格描述" maxLength={200} />)}
          </FormItem>
          <FormItem label="附件">
            {getFieldDecorator('attachments', {})(<Attachment max={type !== 'device' ? 5 : 3} />)}
          </FormItem>
          <FormItem label=" ">
            <Button onClick={this.onSubmit}>保存</Button>
          </FormItem>
        </Form>
      </div>
    );
  }
}

export default withForm({}, injectIntl(EditDevice));
