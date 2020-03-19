import React, { Component, Props } from 'react';
import { withRouter } from 'react-router-dom';
import { Button, haveAuthority } from 'components';
import PropTypes from 'prop-types';

import withForm from 'components/form';
import { addMaterial } from 'src/services/bom/material';
import BasicInfo from 'src/containers/material/commonComponent/form/index';
import styles from 'src/containers/material/commonComponent/styles.scss';
import { isFraction, getFractionCompose } from 'src/utils/number';
import { changeChineseToLocaleWithoutIntl } from 'utils/locale/utils';

class CreateMaterial extends Component {
  props: Props;

  state = {
    loading: false,
  };

  addMaterial = async payload => {
    const {
      data: { data },
    } = await addMaterial(payload);
    if (sensors) {
      sensors.track('web_bom_materials_create', {
        CreateMode: '手动创建',
        amount: 1,
      });
    }
    if (this.props.inModal) {
      const { onSuccess } = this.props;
      this.props.onClose();
      if (onSuccess) {
        onSuccess(data);
      }
    } else {
      this.context.router.history.push(`/bom/materials/${encodeURIComponent(data.code)}/detail`);
    }
  };

  submit = () => {
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        try {
          const payload = this.formInstance.getPayload();
          const { attachments, qcConfigDetails, replaceMaterialList, materialCustomFields, specifications } = payload;
          if (attachments) {
            const filterAttachments = [];
            attachments.forEach(node => {
              filterAttachments.push(node.restId);
            });
            payload.attachments = filterAttachments;
          }
          if (qcConfigDetails) {
            qcConfigDetails.forEach(n => {
              if (n.checkType === 0) {
                if (!payload.inputFactoryQcConfigs) {
                  payload.inputFactoryQcConfigs = [n.id];
                } else {
                  payload.inputFactoryQcConfigs.push(n.id);
                }
              }
              if (n.checkType === 1) {
                if (!payload.outputFactoryQcConfigs) {
                  payload.outputFactoryQcConfigs = [n.id];
                } else {
                  payload.outputFactoryQcConfigs.push(n.id);
                }
              }
            });
          }
          payload.replaceMaterialList = replaceMaterialList && replaceMaterialList.map(({ key }) => key);
          payload.materialCustomFields = Array.isArray(materialCustomFields)
            ? materialCustomFields.filter(i => i && i.keyValue)
            : [];
          payload.specifications = Array.isArray(specifications)
            ? specifications.map(i => {
                const { amount, unit } = i || {};
                if (isFraction(amount)) {
                  return {
                    ...getFractionCompose(amount),
                    unitId: unit,
                  };
                }
                return {
                  numerator: Number(amount),
                  denominator: 1,
                  unitId: unit,
                };
              })
            : null;
          this.addMaterial(payload);
        } catch (e) {
          console.error(e);
        }
      }
    });
  };

  render() {
    const { form, inModal, status } = this.props;
    return (
      <div id="create_material" className={styles.createMaterial} style={{ paddingBottom: 40 }}>
        <p className={inModal ? styles.modalNoHeader : styles.header}>{changeChineseToLocaleWithoutIntl('创建物料')}</p>
        <BasicInfo
          status={status}
          inModal={inModal}
          create
          ref={e => {
            this.formInstance = e;
          }}
          form={form}
          qcConfigDetails={[]}
          submit={this.submit}
          action={'create'}
        />
        <div style={{ paddingLeft: 160, paddingTop: 5 }}>
          <div className={inModal ? styles.inModalFotter : styles.footer}>
            <Button
              className={styles.cancel}
              type="ghost"
              onClick={() => {
                if (inModal) {
                  return this.props.onClose();
                }
                const { router } = this.context;
                if (router) {
                  router.history.go(-1);
                }
              }}
            >
              取消
            </Button>
            <Button
              type="primary"
              className={styles.ok}
              onClick={() => {
                this.submit(true);
              }}
            >
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

export default withRouter(withForm({ showPageFooter: true, footerStyle: { marginLeft: 150 } }, CreateMaterial));
