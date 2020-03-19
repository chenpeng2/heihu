import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import _ from 'lodash';
import { Steps } from 'antd';

import { Button, FormItem, openModal, Radio, Textarea, withForm } from 'components';
import LocalStorage from 'utils/localStorage';
import { FIELDS, replaceSign } from 'src/constants';
import { success } from 'src/styles/color';
import { getQuery } from 'src/routes/getRouteParams';
import { auditPlannedTicket } from 'src/services/cooperate/plannedTicket';
import { hashPassword } from 'src/utils/string';

import ESignatureForm from '../base/ESignatureForm';
import styles from '../styles.scss';

const Step = Steps.Step;
const RadioGroup = Radio.Group;
const buttonStyle = { width: 114, height: 32, marginRight: 40 };

type Props = {
  history: any,
  match: any,
  form: any,
};

class AuditPlannedTicket extends Component {
  props: Props;
  state = {
    data: {},
    textArea: null,
  };

  componentDidMount = () => {
    const { match } = this.props;
    const query = getQuery(match);
    this.setState({ data: query });
  };

  getAuditProcess = auditProcess => {
    const { failFlag, currPos, auditors, remark } = auditProcess || {};
    const currAuditorId = _.get(auditors, `[${currPos}].id`);
    const userId = _.get(LocalStorage.get(FIELDS && FIELDS.USER_INFO), 'id');

    const getProcess = diff => {
      if (diff > 0) {
        return { status: 'wait', result: '未审批' };
      }
      if (diff < 0) {
        return { status: 'finish', result: '已通过' };
      }
      if (diff === 0) {
        if (failFlag) return { status: 'error', result: '已驳回' };
        return { status: 'process', result: '审批中' };
      }
      return { status: 'wait', result: '未审批' };
    };
    if (auditors && auditors.length > 0) {
      return (
        <Steps
          className={styles.auditProcess}
          style={{ paddingTop: 10 }}
          direction="vertical"
          size="small"
          current={currPos}
        >
          {auditors.map(({ id, name, remark }, i) => {
            const process = getProcess(i - currPos);
            const { status, result, icon } = process || {};
            const title = (
              <div>
                {name}
                <span className="auditPageTip">{result}</span>
              </div>
            );
            return status === 'finish' ? (
              <Step icon={icon} status={status} title={title} description={remark || replaceSign} />
            ) : (
              <Step icon={icon} status={status} title={title} />
            );
          })}
        </Steps>
      );
    }
    return replaceSign;
  };

  onAuditResultChange = e => {
    const res = e.target.value;
    this.setState({ textArea: Number(res) === 1 ? 'auditRemark' : 'failReason' });
  };

  onSubmit = () => {
    this.props.form.validateFieldsAndScroll((err, vals) => {
      console.log('audit: ', { vals });
      if (!err) {
        openModal(
          {
            title: '电子签名',
            children: <ESignatureForm onRef={inst => (this.eSignatureForm = inst)} />,
            onOk: async () => {
              const res = await this.eSignatureForm.checkESignature();
              if (res) {
                const { isPass, ...rest } = vals;
                const { username, password } = res;
                const pw = hashPassword(password);
                const code = _.get(this.props, 'match.params.id');

                await auditPlannedTicket({ code, username, password: pw, isPass: Boolean(isPass), ...rest })
                  .then(res => {
                    const statusCode = _.get(res, 'data.statusCode');
                    if (statusCode === 200) {
                      this.props.history.push(`/cooperate/plannedTicket/detail/${code}`);
                    }
                  })
                  .catch(err => console.log(err));
              }
            },
            width: 500,
            style: { top: '25%' },
          },
          this.context,
        );
      }
    });
  };

  render() {
    const { textArea, data } = this.state;
    const {
      form: { getFieldDecorator },
    } = this.props;

    return (
      <div style={{ padding: 20 }}>
        <div style={{ fontSize: 16, marginBottom: 10 }}>审批计划工单</div>
        <FormItem label="审批进度">{this.getAuditProcess(data)}</FormItem>
        <FormItem label="审批结果">
          {getFieldDecorator('isPass', {
            rules: [
              {
                required: true,
                message: '审批结果必填',
              },
            ],
          })(
            <RadioGroup onChange={this.onAuditResultChange}>
              <Radio value={1}>通过</Radio>
              <Radio value={0}>驳回</Radio>
            </RadioGroup>,
          )}
        </FormItem>
        {textArea === 'failReason' ? (
          <FormItem label="不通过原因">
            {getFieldDecorator('failReason')(
              <Textarea maxLength={250} style={{ width: 300, height: 100 }} placeholder="请输入不通过原因" />,
            )}
          </FormItem>
        ) : null}
        {textArea === 'auditRemark' ? (
          <FormItem label="审批备注">
            {getFieldDecorator('remark')(
              <Textarea maxLength={250} style={{ width: 300, height: 100 }} placeholder="请输入审批备注" />,
            )}
          </FormItem>
        ) : null}
        <div style={{ paddingLeft: 120, marginTop: 30 }}>
          <Button
            type="default"
            style={buttonStyle}
            onClick={() => {
              const { history } = this.props;
              if (history) {
                history.go(-1);
              }
            }}
          >
            取消
          </Button>
          <Button type="primary" style={buttonStyle} onClick={this.onSubmit}>
            保存
          </Button>
        </div>
      </div>
    );
  }
}

export default withRouter(withForm({}, AuditPlannedTicket));
