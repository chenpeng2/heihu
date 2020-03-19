import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import withForm from 'components/form';
import { Form, Button, FormattedMessage } from 'components';
import { alertYellow } from 'src/styles/color';
import { queryMaterialDetail, updateMaterial } from 'src/services/bom/material';
import { changeChineseToLocaleWithoutIntl } from 'utils/locale/utils';
import BasicInfo from '../basicInfo/basicInfoBase/index';
import styles from './styles.scss';

type Props = {
  form: any,
  match: {
    params: {
      materialId: string,
    },
  },
  location: {
    pathname: String,
  },
};

export class EditMaterial extends Component {
  props: Props;

  state = {
    loading: false,
  };

  componentDidMount() {
    const {
      match: {
        params: { materialCode },
      },
    } = this.props;
    this.setState({ loading: true });
    this.fetchData(materialCode);
  }

  fetchData = async code => {
    const { form } = this.props;
    const { data } = await queryMaterialDetail(code);
    this.setState(
      {
        loading: false,
      },
      () => {
        const node = data && data.data;
        const val = {
          name: node.name,
          code: node.code,
          unitId: node.unit.id,
          status: node.status.num,
          desc: node.desc,
          attachments: node.attachments,
        };
        form.setFieldsValue(val);
      },
    );
  };

  getAttachmentValues = attachments => {
    return attachments.originalFileName;
  };

  submit = () => {
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        const payload = this.formInstance.props.form.getFieldsValue();
        const { attachments } = payload;
        const attachmentsId = [];
        if (attachments.length > 0) {
          attachments.forEach(node => {
            if (node.restId) {
              attachmentsId.push(node.restId);
            } else {
              attachmentsId.push(node.id);
            }
          });
          delete payload.attachments;
          payload.attachments = attachmentsId;
        }
        const { code } = payload;
        updateMaterial(code, payload)
          .then(res => {
            const { data } = res.data;
            const path = this.props.location.pathname;
            if (path.indexOf('bom') !== -1) {
              return this.context.router.history.push(`/bom/materials/${data.code}/detail`);
            }
            if (path.indexOf('lgUnits') !== -1) {
              return this.context.router.history.push(`/stock/lgUnits/${data.code}/detail`);
            }
            if (path.indexOf('produceUnits') !== -1) {
              return this.context.router.history.push(`/stock/produceUnits/${data.code}/detail`);
            }
            return null;
          })
          .catch(console.log);
      }
      //   const { data } = this.state;
      //   const material = data.length > 0 && data[0];
      //   const payload = this.formInstance.refs.component.getPayload(values);
      //   return updateMaterial({ code: material.code, material: payload })
      //           .then(res => {
      //             this.context.router.history.push(`/bom/materials/detail/${material.code}`);
      //           });
      // }
      // return null;
    });
  };

  render() {
    const { form } = this.props;

    return (
      <div id="edit_material" className={styles.editMaterial}>
        <p className={styles.header}>{changeChineseToLocaleWithoutIntl('编辑物料')}</p>
        <BasicInfo
          ref={e => {
            if (!this.formInstance) {
              this.formInstance = e;
            }
          }}
          edit="true"
          form={form}
        />
        <div className={styles.footer}>
          <Button
            className={styles.cancel}
            type="ghost"
            onClick={() => {
              const path = this.props.location.pathname;
              if (path.indexOf('bom') !== -1) {
                this.context.router.history.push('/bom/materials/list');
              }
              if (path.indexOf('lgUnits') !== -1) {
                this.context.router.history.push('/stock/lgUnits');
              }
              if (path.indexOf('produceUnits') !== -1) {
                this.context.router.history.push('/stock/produceUnits');
              }
            }}
          >
            取消
          </Button>
          <Button type="primary" className={styles.ok} onClick={() => this.submit()}>
            保存
          </Button>
        </div>
        <p style={{ color: alertYellow, marginTop: 24, paddingLeft: 160 }}>
          <FormattedMessage
            defaultMessage={'保存后所有调用该物料的物料清单、生产BOM、二维码、项目和任务，都会更新为最新信息。'}
          />
        </p>
      </div>
    );
  }
}

EditMaterial.contextTypes = {
  router: PropTypes.object.isRequired,
};

export const EditMaterialForm = withForm(
  {
    showFooter: false,
  },
  EditMaterial,
);

export default withRouter(EditMaterialForm);
