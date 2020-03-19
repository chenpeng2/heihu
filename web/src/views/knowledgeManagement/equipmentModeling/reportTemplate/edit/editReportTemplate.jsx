import React, { Component } from 'react';
import _ from 'lodash';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import { injectIntl } from 'react-intl';
import { changeChineseToLocale } from 'utils/locale/utils';
import { withForm, Form, FormItem, Input, AddControl } from 'components';
import { queryReportTemplateDetail, updateReportTemplate } from 'src/services/knowledgeBase/equipment';
import LeaveConfirmModal from '../leaveConfirmModal';
import styles from './styles.scss';

type Props = {
  form: any,
  intl: any,
  match: {
    params: {},
  },
  history: any,
};

class EditReportTemplate extends Component {
  props: Props;
  state = {
    data: {},
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
    this.fetchData();
  };

  componentWillUnmount() {
    this.removeTransitionHook();
  }

  fetchData = async () => {
    const {
      match: {
        params: { id },
      },
    } = this.props;
    const { data } = await queryReportTemplateDetail(id).catch(console.log);
    this.setState({
      data: data && data.data,
    });
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
        this.updateReportTemplate(values);
        this.setState({ isSaved: true });
      }
    });
  };

  updateReportTemplate = async data => {
    const {
      match: {
        params: { id },
      },
    } = this.props;
    await updateReportTemplate(id, data)
      .then(res => {
        if (res.data.statusCode === 200) {
          this.context.router.history.push('/knowledgeManagement/reportTemplate');
        }
      })
      .catch(console.log);
  };

  render() {
    const { data, nextRoute, visible } = this.state;
    const {
      form: { getFieldDecorator },
      intl,
      form,
    } = this.props;
    if (!data) {
      return null;
    }
    return (
      <div className={styles.editReportTemplate}>
        <div className={styles.editHeaders}>{changeChineseToLocale('编辑模板', intl)}</div>
        <Form layout="horizontal">
          <FormItem label="模板名称" required>
            {getFieldDecorator('name', {
              rules: [
                { required: true, message: changeChineseToLocale('请输入模板名称', intl) },
                { min: 4, message: changeChineseToLocale('至少输入4个字符', intl) },
                { max: 30, message: changeChineseToLocale('最多输入30个字符', intl) },
              ],
              initialValue: data.name,
            })(<Input placeholder={'请输入模板名称'} style={{ borderColor: '#E5E5E5', width: 300 }} />)}
          </FormItem>
          <FormItem>
            <AddControl form={form} isChild={false} data={data && data.controls} onSubmit={this.submit} />
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

EditReportTemplate.contextTypes = {
  router: PropTypes.object.isRequired,
};

export default withRouter(withForm({}, injectIntl(EditReportTemplate)));
