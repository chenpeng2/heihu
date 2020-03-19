import * as React from 'react';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import { withForm, FormItem, Input, Textarea } from 'components';
import { injectIntl } from 'react-intl';
import { changeChineseToLocale } from 'utils/locale/utils';
import { nullCharacterVerification, telValidator } from 'components/form';
import { queryEquipmentManufacturerList } from 'src/services/knowledgeBase/equipment';
import _ from 'lodash';
import styles from './styles.scss';

type propsType = {
  router: any,
  form: any,
  intl: any,
  params: {},
  formData: {},
  submit: () => {},
  title: String,
};

class EquipmentManufacturerBase extends React.Component<propsType> {
  state = {
    reportTemplates: [],
  };

  componentDidMount = () => {
    this.fetchEquipmentManufacturer();
  };

  fetchEquipmentManufacturer = async () => {
    const {
      data: { total },
    } = await queryEquipmentManufacturerList({ page: 1, size: 10 });
    const {
      data: { data },
    } = await queryEquipmentManufacturerList({ page: 1, size: total });
    this.setState({
      reportTemplates: data,
    });
  };

  render() {
    const { form, formData, title, intl } = this.props;
    const { getFieldDecorator } = form;

    return (
      <div className={styles.baseEquipmentManufacturer}>
        <div className={styles.baseSetting}>
          <div className={styles.baseHeaders}>{changeChineseToLocale(title, intl)}</div>
          <FormItem label="制造商名称" required>
            {getFieldDecorator('name', {
              rules: [
                { required: true, message: changeChineseToLocale('请输入制造商全称', intl) },
                { max: 100, message: changeChineseToLocale('最多可输入100个字符', intl) },
                { validator: nullCharacterVerification('制造商名称') },
              ],
              initialValue: formData && formData.name,
            })(<Input placeholder={'请输入制造商全称'} style={{ width: 300 }} />)}
          </FormItem>
          <FormItem label="制造商简称">
            {getFieldDecorator('shortName', {
              rules: [
                { max: 16, message: changeChineseToLocale('最多可输入16个字符', intl) },
                { validator: nullCharacterVerification('制造商简称') },
              ],
              initialValue: formData && formData.shortName,
            })(<Input placeholder={'请输入制造商简称'} style={{ width: 300 }} />)}
          </FormItem>
          <FormItem label="地址">
            {getFieldDecorator('address', {
              rules: [{ max: 120, message: changeChineseToLocale('最多可输入120个字符', intl) }],
              initialValue: formData && formData.address,
            })(<Input placeholder={'请输入制造商地址'} style={{ width: 300 }} />)}
          </FormItem>
          <FormItem label="联系人">
            {getFieldDecorator('contact', {
              rules: [
                { max: 10, message: changeChineseToLocale('最多可输入10个字符', intl) },
                { validator: nullCharacterVerification('制造商联系人') },
              ],
              initialValue: formData && formData.contact,
            })(<Input placeholder={'请输入制造商联系人'} style={{ width: 300 }} />)}
          </FormItem>
          <FormItem label="联系人电话">
            {getFieldDecorator('contactNumber', {
              rules: [
                { max: 15, message: changeChineseToLocale('最多可输入15个字符', intl) },
                { validator: nullCharacterVerification('制造商联系人电话') },
                { validator: telValidator('联系人电话') },
              ],
              initialValue: formData && formData.contactNumber,
            })(<Input placeholder={'请输入制造商联系人电话'} style={{ width: 300 }} />)}
          </FormItem>
          <FormItem label="电子邮件">
            {getFieldDecorator('email', {
              rules: [{ max: 60, message: changeChineseToLocale('最多可输入60个字符', intl) }],
              initialValue: formData && formData.email,
            })(<Input placeholder={'请输入制造商联系人邮件地址'} style={{ width: 300 }} />)}
          </FormItem>
          <FormItem label="传真">
            {getFieldDecorator('fax', {
              rules: [
                { max: 15, message: changeChineseToLocale('最多可输入15个字符', intl) },
                { validator: nullCharacterVerification('制造商联系人传真号码') },
              ],
              initialValue: formData && formData.fax,
            })(<Input placeholder={'请输入制造商联系人传真号码'} style={{ width: 300 }} />)}
          </FormItem>
          <FormItem label="备注">
            {getFieldDecorator('remark', {
              // rules: [{ validator: lengthValidate(undefined, 150) }],
              initialValue: formData && formData.remark,
            })(<Textarea maxLength={150} style={{ width: 300, height: 100 }} placeholder="请输入规格描述" />)}
          </FormItem>
        </div>
      </div>
    );
  }
}

EquipmentManufacturerBase.contextTypes = {
  router: PropTypes.object.isRequired,
};

export default withRouter(withForm({}, injectIntl(EquipmentManufacturerBase)));
