import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { Button, message } from 'components';
import PropTypes from 'prop-types';
import withForm from 'components/form';
import { craeteSpareParts } from 'src/services/equipmentMaintenance/spareParts';
import BasicInfo from './base';
import styles from './styles.scss';

type Props = {
  form: any,
};

class CreateSpareParts extends Component {
  props: Props;

  state = {
    loading: false,
  };

  submit = () => {
    const { router } = this.context;
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (err) return null;
      if (values.attachments && values.attachments.length) {
        values.attachments = values.attachments.map(n => n.restId);
      }
      craeteSpareParts(values)
        .then(() => {
          message.success('创建备件成功');
          router.history.go(-1);
        });
    });
  };

  render() {
    const { form } = this.props;
    return (
      <div id="create_material" className={styles.createSpareParts}>
        <p className={styles.header}>创建备件</p>
        <BasicInfo form={form} />
        <div style={{ paddingLeft: 160, paddingTop: 5 }}>
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
            <Button type="primary" className={styles.ok} onClick={this.submit}>
              保存
            </Button>
          </div>
        </div>
      </div>
    );
  }
}

CreateSpareParts.contextTypes = {
  router: PropTypes.object.isRequired,
};

export default withRouter(withForm({ showPageFooter: true, footerStyle: { marginLeft: 150 } }, CreateSpareParts));
