import React, { Component } from 'react';
import withForm from 'components/form';
import { Form, Input, AddControl, FormItem } from 'components';
import { withRouter } from 'react-router-dom';
import { injectIntl } from 'react-intl';
import { changeChineseToLocale } from 'utils/locale/utils';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { addReportTemplate } from 'src/services/knowledgeBase/equipment';
import LeaveConfirmModal from '../leaveConfirmModal';
import styles from './styles.scss';

type Props = {
  form: {
    getFieldDecorator: () => {},
    validateFields: () => {},
  },
  intl: any,
  history: any,
};

class CreateReportTemplate extends Component {
  props: Props;
  state = {
    visible: false,
    isSaved: false,
    nextRoute: null,
  };

  componentDidMount = () => {
    this.removeTransitionHook = this.props.history.block(val => {
      if (val) {
        this.setState({ visible: true, nextRoute: val });
      }
      return this.state.isSaved;
    });
  };

  componentWillUnmount() {
    this.removeTransitionHook();
  }

  addReportTemplate = async data => {
    await addReportTemplate(data)
      .then(res => {
        if (res.data.statusCode === 200) {
          this.context.router.history.push('/knowledgeManagement/reportTemplate');
        }
      })
      .catch(console.log);
  };

  submit = (e, value) => {
    e.preventDefault();
    this.props.form.validateFields((err, val) => {
      if (!err) {
        const values = {};
        values.controls = value;
        values.controls.forEach(x => {
          if (x.attachment && x.attachment.length) {
            x.attachment = x.attachment.map(n => ({
              id: n.restId,
              name: n.originalFileName,
            }));
          }
        });
        values.name = val.name;
        this.addReportTemplate(values);
        this.setState({ isSaved: true });
      }
    });
  };

  render() {
    const {
      form: { getFieldDecorator },
      form,
      intl,
    } = this.props;
    const { nextRoute, visible } = this.state;

    return (
      <div className={styles.createReportTemplate}>
        <div className={styles.createHeaders}>{changeChineseToLocale('创建模板', intl)}</div>
        <Form layout="horizontal">
          <FormItem label="模板名称" required>
            {getFieldDecorator('name', {
              rules: [
                { required: true, message: changeChineseToLocale('请输入模板名称', intl) },
                { min: 4, message: changeChineseToLocale('至少输入4个字符', intl) },
                { max: 30, message: changeChineseToLocale('最多输入30个字符', intl) },
              ],
            })(<Input placeholder={'请输入模板名称'} style={{ borderColor: '#E5E5E5', width: 300 }} />)}
          </FormItem>
          <FormItem>
            <AddControl form={form} isChild={false} action={'add'} onSubmit={this.submit} />
          </FormItem>
        </Form>
        <LeaveConfirmModal
          onVisibleChange={value => {
            this.setState({ visible: value });
          }}
          visible={visible}
          nextRoute={nextRoute}
          onConfirm={() => {
            this.setState({ isSaved: true });
          }}
        />
      </div>
    );
  }
}

CreateReportTemplate.contextTypes = {
  router: PropTypes.object.isRequired,
};

export default withRouter(withForm({}, injectIntl(CreateReportTemplate)));
