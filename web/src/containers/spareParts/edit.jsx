import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import withForm from 'components/form';
import { Button, message } from 'components';
import { getSpareParts, editSpareParts } from 'src/services/equipmentMaintenance/spareParts';
import BasicInfo from './base';
import styles from './styles.scss';

type Props = {
  form: any,
  location: {
    pathname: String,
    query: {},
  },
};

class EditSpareParts extends Component {
  props: Props;

  state = {
    loading: false,
    data: null,
  };

  submit = () => {
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (err) return null;
      const { location: { query } } = this.props;
      const { code } = query;
      const { router } = this.context;
      if (values.attachments) {
        values.attachments = values.attachments.map(n => n.restId);
      }
      editSpareParts(values, code)
        .then(() => {
          message.success('编辑备件成功');
          router.history.go(-1);
        });
    });
  };

  render() {
    const { form, location } = this.props;

    return (
      <div id="edit_material" className={styles.editSpareParts}>
        <p className={styles.header}>编辑备件</p>
        <BasicInfo
          edit
          location={location}
          form={form}
        />
        <div style={{ paddingLeft: 160 }}>
          <div className={styles.footer}>
            <Button
              className={styles.cancel}
              type="ghost"
              onClick={() => {
                const { router } = this.context;
                if (router) {
                  router.history.go(-1);
                }
              }}
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

EditSpareParts.contextTypes = {
  router: PropTypes.object.isRequired,
};

export default withRouter(withForm({ showPageFooter: true, footerStyle: { marginLeft: 150 } }, EditSpareParts));
