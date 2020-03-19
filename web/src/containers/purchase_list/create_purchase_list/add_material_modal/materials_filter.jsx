import React, { Component } from 'react';
import { injectIntl } from 'react-intl';

import { Button, withForm, Searchselect, Select } from 'components';
import { getProjectList, getPurchaseProject } from 'services/cooperate/project';
import { changeChineseToLocale } from 'src/utils/locale/utils';
import { queryPlannedTicketList } from 'services/cooperate/plannedTicket';
import { middleGrey, error, fontSub } from 'styles/color';

type Props = {
  on_search: () => {},
  form: {},
  configValue: string,
  intl: any,
};

class Materials_Filter extends Component {
  props: Props;
  state = {
    showHelp: false,
    purchaseCode: '',
    showPrompt: false,
    project: [],
    purchaseProject: [],
  };

  componentDidMount() {
    const { configValue } = this.props;
    if (configValue === 'manager') {
      this.fetchWorkOrder({});
    } else {
      this.fetchProject();
    }
  }

  fetchProject = variables => {
    getProjectList({ projectCode: variables, statuses: '2,3' }).then(res => {
      this.setState({ project: res.data && res.data.data.map(({ projectCode }) => ({ value: projectCode })) });
    });
  };

  fetchPurchaseProject = purchaseOrderCode => {
    getPurchaseProject({ purchaseOrderCode }).then(res => {
      const { form } = this.props;
      const { setFieldsValue, getFieldValue } = form;
      const currentProjectCode = getFieldValue('project');
      const purchaseProject = res.data && res.data.data.map(({ projectCode }) => ({ value: projectCode }));
      this.setState({ purchaseProject });
      if (typeof currentProjectCode === 'string' && !purchaseProject.map(n => n.value).includes(currentProjectCode)) {
        this.setState({ showPrompt: true });
        setFieldsValue({ project: [] });
      } else {
        this.setState({ showPrompt: false });
      }
    });
  };

  fetchWorkOrder = variables => {
    const { form } = this.props;
    const { setFieldsValue, getFieldValue } = form;
    queryPlannedTicketList(variables).then(res => {
      const currentProjectCode = getFieldValue('project');
      const purchaseProject = res.data && res.data.data.map(({ code }) => ({ value: code }));
      this.setState({ purchaseProject });
      if (typeof currentProjectCode === 'string' && !purchaseProject.map(n => n.value).includes(currentProjectCode)) {
        this.setState({ showPrompt: true });
        setFieldsValue({ project: [] });
      } else {
        this.setState({ showPrompt: false });
      }
    });
  };

  render() {
    const { on_search, form, configValue, intl } = this.props;
    const { showHelp, project, purchaseProject, purchaseCode, showPrompt } = this.state;

    const { getFieldDecorator, getFieldsValue } = form;

    const form_item_style = { margin: '0 60px 20px 0', display: 'inline-block' };
    const label_style = { color: middleGrey, width: 64, textAlign: 'right', marginRight: 5, display: 'inline-block' };
    const search_select_style = { width: 200 };

    return (
      <div style={{ margin: '5px auto', width: 786 }}>
        <div style={form_item_style}>
          <span style={label_style}>{changeChineseToLocale('销售订单编号', intl)}</span>
          {getFieldDecorator('purchaseOrder', {
            onChange: value => {
              if (!value) {
                this.setState({ purchaseCode: '', showPrompt: false });
              } else {
                this.setState({ purchaseCode: value.key });
                if (configValue === 'manager') {
                  this.fetchWorkOrder({ purchaseCode: value.key });
                } else {
                  this.fetchPurchaseProject(value.key);
                }
              }
              this.setState({ showHelp: false });
            },
          })(<Searchselect type={'purchaseOrder'} style={search_select_style} />)}
        </div>
        <div style={form_item_style}>
          <span style={{ ...label_style, width: configValue === 'manager' ? 75 : 64 }}>
            {configValue === 'manager'
              ? `${changeChineseToLocale('计划工单编号', intl)}`
              : `${changeChineseToLocale('项目编号', intl)}`}
          </span>
          {getFieldDecorator('project', {
            onChange: value => {
              if (!value) {
                if (configValue === 'manager') {
                  this.fetchWorkOrder({});
                } else {
                  this.fetchProject();
                }
              }
              this.setState({ showHelp: false });
            },
          })(
            <Select
              style={search_select_style}
              onSelect={value => {
                if (purchaseProject.map(n => n.value).includes(value)) {
                  this.setState({ showPrompt: false });
                }
              }}
              allowClear
              onSearch={value => {
                if (purchaseCode) {
                  if (configValue === 'manager') {
                    this.fetchWorkOrder({ purchaseCode });
                  } else {
                    this.fetchPurchaseProject(purchaseCode);
                  }
                } else if (configValue === 'manager') {
                  this.fetchWorkOrder({ workOrderCode: value });
                } else {
                  this.fetchProject(value);
                }
              }}
            >
              {configValue !== 'manager'
                ? !purchaseCode
                  ? project.map(({ value }) => (
                      <Select.Option key={value} value={value}>
                        {value}
                      </Select.Option>
                    ))
                  : purchaseProject.map(({ value }) => (
                      <Select.Option key={value} value={value}>
                        {value}
                      </Select.Option>
                    ))
                : purchaseProject.map(({ value }) => (
                    <Select.Option key={value} value={value}>
                      {value}
                    </Select.Option>
                  ))}
            </Select>,
          )}
        </div>
        {showPrompt ? (
          <span style={{ color: fontSub, position: 'absolute', top: 35, right: 265 }}>请输入当前订单号下的项目号</span>
        ) : null}
        <Button
          icon={'search'}
          onClick={() => {
            const value = getFieldsValue();

            if (!value.purchaseOrder && !value.project) {
              this.setState({ showHelp: true });
            }

            const { project, purchaseOrder } = value || {};

            on_search({
              projectCode: project,
              purchaseOrderCode: purchaseOrder ? purchaseOrder.key : null,
            });
          }}
        >
          查询
        </Button>
        {showHelp ? <div style={{ color: error, textAlign: 'right' }}>请至少输入一个查询条件</div> : null}
      </div>
    );
  }
}

export default withForm({}, injectIntl(Materials_Filter));
