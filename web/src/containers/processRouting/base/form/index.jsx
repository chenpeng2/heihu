import * as React from 'react';
import { withRouter } from 'react-router-dom';
import _ from 'lodash';
import PropType from 'prop-types';

import { DatePicker, FormItem, Form, Input, Button, Row, Col, FormattedMessage } from 'src/components';
import withForm, {
  checkStringLength,
  nullCharacterVerification,
  chineseValidator,
  specialCharacterValidator,
  requiredRule,
} from 'src/components/form';
import { getWorkstations } from 'components/select/workstationAndAreaSelect';
import { changeChineseToLocaleWithoutIntl } from 'utils/locale/utils';
import moment from 'src/utils/time';

import ProcessRouteGraphAndEditFrom from './container';
import styles from './styles.scss';

export const INPUT_WIDTH = 200;

type Props = {
  style: {},
  form: {
    getFieldDecorator: () => {},
    getFieldsValue: () => {},
    setFieldsValue: () => {},
  },
  editingProcessRouteGraph: boolean,
  isEdit: boolean,
  data: [],
  viewer: any,
  onSaveButtonClick: () => {},
  processRoutingData: any,
  saveButtonText: string,
  isCodeDisable: boolean,
  router: any,
};

const disabledDate = current => {
  // Can not select days before today
  return (
    current &&
    current <
      moment()
        .subtract(1, 'days')
        .endOf('day')
  );
};
const getDateForValid = date => {
  if (!date) {
    return null;
  }
  return moment(Number(date));
};

class CreateProcessRoute extends React.Component {
  props: Props;
  state = {
    validFrom: null,
    validTo: null,
  };

  validateAndGetFormValue = async () => {
    const { form } = this.props;
    const { validateFieldsAndScroll } = form;
    let res = null;
    validateFieldsAndScroll((error, value) => {
      if (!error) {
        res = _.cloneDeep(value);
      }
    });
    if (res) {
      for (const process of res.processList) {
        for (const node of process.nodes) {
          const workstations = _.cloneDeep(node.workstations);
          node.workstations = await getWorkstations(workstations);
          node.workstationGroups = [];
        }
      }
    }

    return res;
  };

  handleSubmit = async () => {
    const { onSaveButtonClick } = this.props;
    const refComponent = this.processRouteGraphAndEditFormRef;
    if (!refComponent) return;

    const isUpdate = await refComponent.isUpdate();

    // 如果更新了保存当前的节点数据
    if (isUpdate) {
      const saveSuccess = await refComponent.saveProcess();
      if (!saveSuccess) return;
    }

    // 保存数据。没有更新也保存是因为复制的时候第一个节点的数据直接就存在
    const value = await this.validateAndGetFormValue();
    if (value && onSaveButtonClick) {
      onSaveButtonClick(value);
    }
  };

  renderProcessList = () => {
    const { form, isEdit, editingProcessRouteGraph, processRoutingData, router } = this.props;
    const { getFieldDecorator } = form;
    const { processList } = processRoutingData || {};

    return (
      <div>
        <div style={{ width: 100, marginRight: 20, textAlign: 'right', display: 'inline-block' }}>
          <FormattedMessage defaultMessage="工序列表" />
        </div>
        <div style={{ width: 'calc( 100% - 150px )', display: 'inline-block', verticalAlign: 'top' }}>
          {getFieldDecorator('processList', {
            initialValue: processList || null,
          })(
            <ProcessRouteGraphAndEditFrom
              ref={ref => (this.processRouteGraphAndEditFormRef = ref)}
              editGraph={editingProcessRouteGraph}
              isEdit={isEdit}
              form={form}
              router={router}
            />,
          )}
        </div>
      </div>
    );
  };

  render() {
    const { router } = this.context;
    const { form, processRoutingData, isCodeDisable, saveButtonText } = this.props;
    const { getFieldDecorator } = form;

    const { code, name, validFrom, validTo } = processRoutingData || {};

    return (
      <div className={styles.createProcessRouteContainer}>
        <Form>
          <Row>
            <Col>
              <FormItem label="编号">
                {getFieldDecorator('code', {
                  initialValue: code,
                  rules: [
                    requiredRule('编号'),
                    { validator: checkStringLength(20) },
                    {
                      validator: chineseValidator('工艺路线编号'),
                    },
                    {
                      validator: specialCharacterValidator('工艺路线编号'),
                    },
                  ],
                })(<Input style={{ width: INPUT_WIDTH }} disabled={isCodeDisable} />)}
              </FormItem>
            </Col>
            <Col>
              <FormItem label="名称">
                {getFieldDecorator('name', {
                  initialValue: name,
                  rules: [
                    requiredRule('名称'),
                    { validator: checkStringLength(150) },
                    { validator: nullCharacterVerification('名称') },
                  ],
                })(<Input style={{ width: INPUT_WIDTH }} />)}
              </FormItem>
            </Col>
            <Col>
              <FormItem label="有效期">
                {getFieldDecorator('validFrom', {
                  initialValue: getDateForValid(validFrom),
                  onChange: value => {
                    this.setState({ validFrom: value }, () => {
                      form.validateFields(['validFrom', 'validTo'], { force: true });
                    });
                  },
                  rules: [
                    {
                      validator: (rule, value, cb) => {
                        const { validTo: endTime } = this.state;

                        if (endTime && moment(endTime).isBefore(value)) {
                          cb(changeChineseToLocaleWithoutIntl('开始时间晚于结束时间'));
                        }
                        cb();
                      },
                    },
                  ],
                })(
                  <DatePicker
                    placeholder={'开始时间'}
                    style={{ width: 125, marginRight: 5 }}
                    disabledDate={disabledDate}
                  />,
                )}
              </FormItem>
            </Col>
            <Col>
              <FormItem>
                {getFieldDecorator('validTo', {
                  initialValue: getDateForValid(validTo),
                  onChange: value => {
                    this.setState({ validTo: value }, () => {
                      form.validateFields(['validFrom', 'validTo'], { force: true });
                    });
                  },
                  rules: [
                    {
                      validator: (rule, value, cb) => {
                        const { validFrom: startTime } = this.state;

                        if (startTime && moment(startTime).isAfter(value)) {
                          cb(changeChineseToLocaleWithoutIntl('开始时间晚于结束时间'));
                        }
                        cb();
                      },
                    },
                  ],
                })(<DatePicker placeholder={'结束时间'} style={{ width: 125 }} disabledDate={disabledDate} />)}
              </FormItem>
            </Col>
          </Row>
        </Form>
        {this.renderProcessList()}
        <div style={{ marginLeft: 120, width: 'calc( 100% - 150px )' }}>
          <div style={{ width: 288, padding: '40px 0px', margin: 'auto' }}>
            <Button
              onClick={() => {
                if (router) {
                  router.history.go(-1);
                }
              }}
              style={{ marginRight: 60, width: 114 }}
              type={'default'}
            >
              取消
            </Button>
            <Button style={{ width: 114 }} onClick={this.handleSubmit}>
              {saveButtonText || '保存'}
            </Button>
          </div>
        </div>
      </div>
    );
  }
}

CreateProcessRoute.contextTypes = {
  router: PropType.func,
};

export default withRouter(withForm({}, CreateProcessRoute));
