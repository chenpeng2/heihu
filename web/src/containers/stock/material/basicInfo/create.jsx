import React, { Component, Props } from 'react';
import { withRouter } from 'react-router-dom';
import { Button } from 'components';
import PropTypes from 'prop-types';
import withForm from 'components/form';
import { addMaterial } from 'src/services/bom/material';
import BasicInfo from './basicInfoBase/index';
import styles from './styles.scss';

export class CreateMaterial extends Component {
  props: Props;

  state = {
    loading: false,
  };

  addMaterial = async payload => {
    const { data } = await addMaterial(payload);
    if (this.props.inModal) {
      this.props.onClose();
    } else {
      this.context.router.history.push(`/bom/materials/${data.data.code}/detail`);
    }
  };

  submit = () => {
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        const payload = this.formInstance.props.form.getFieldsValue();
        const { attachments } = payload;
        if (attachments) {
          const filterAttachments = [];
          attachments.forEach(node => {
            filterAttachments.push(node.id);
          });
          payload.attachments = filterAttachments;
        }
        this.addMaterial(payload);
      }
      return null;
    });
  };

  render() {
    const { form, inModal, status } = this.props;
    return (
      <div id="create_material" className={styles.createMaterial}>
        <p className={inModal ? styles.modalNoHeader : styles.header}>创建物料</p>
        <BasicInfo
          status={status}
          ref={e => {
            this.formInstance = e;
          }}
          form={form}
        />
        <div style={{ paddingLeft: 160, paddingTop: 5 }}>
          <div className={inModal ? styles.inModalFotter : styles.footer}>
            <Button
              className={styles.cancel}
              type="ghost"
              onClick={() => (inModal ? this.props.onClose() : this.context.router.history.push('/bom/materials/list'))}
            >
              取消
            </Button>
            <Button type="primary" className={styles.ok} onClick={() => this.submit()}>
              保存
            </Button>
          </div>
        </div>
      </div>
    );
  }
}

CreateMaterial.contextTypes = {
  router: PropTypes.object.isRequired,
};

export const CreateMaterialForm = withRouter(withForm({ showPageFooter: true, footerStyle: { marginLeft: 150 } }, CreateMaterial));

export default 'dummy';
