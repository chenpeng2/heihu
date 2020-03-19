import React, { Component } from 'react';
import _ from 'lodash';
import withForm, { checkStringLength } from 'components/form';
import { FormItem, Form, Input } from 'components';
import Select from 'components/select';
import { createWorkstationGroup } from 'src/services/workstation';
import { isFunction } from 'util';

const Option = Select.Option;

type Props = {
  viewer: any,
  form: any,
  relay: any,
  match: {},
  // 父级id
  variables: {
    parentWorkStationId: string,
  },
  isGroup: boolean,
  onSuccess: () => {},
};

class CreateWorkstation extends Component {
  props: Props;
  state = {
    type: 'workstation',
  };

  static getDerivedStateFromProps(props, state) {
    if (props.isGroup) {
      return { type: 'workstationGroup' };
    }
  }

  submitForWorkstationGroup = async values => {
    if (!values) return null;
    const { workstationGroupName, workstationGroupDesc } = values;
    const { onSuccess } = this.props;
    const payload = {
      name: workstationGroupName,
      desc: workstationGroupDesc,
    };
    const { data: { data } } = await createWorkstationGroup(payload);
    if (data && isFunction(onSuccess)) {
      onSuccess(data);
    }
  };

  submitForWorkstation = values => {
    if (!values) return null;
    const { viewer } = this.props;
    const { organization } = viewer || {};

    const { workstationWorkstationGroup, workstationName, workstationDesc, workstationQrCode } = values;
    const res = {
      groupId: workstationWorkstationGroup,
      desc: workstationDesc,
      qrCode: workstationQrCode,
      name: workstationName,
    };
    // return addWorkstationMutation({ variables: res }, organization && organization.id)();
  };

  submit = values => {
    const { type } = this.state;
    if (type === 'workstationGroup') {
      return this.submitForWorkstationGroup(values);
    }
    if (type === 'workstation') {
      return this.submitForWorkstation(values);
    }
    return null;
  };

  createWorkstationGroup = () => {
    const { form } = this.props;
    const { getFieldDecorator } = form;
    return (
      <React.Fragment>
        <FormItem label="名字" key="workstationGroupName">
          {getFieldDecorator('workstationGroupName', {
            rules: [{ required: true, message: '工位组名称必填' }, { validator: checkStringLength(12) }],
          })(<Input />)}
        </FormItem>
        <FormItem label="备注" key="workstationGroupDesc">
          {getFieldDecorator('workstationGroupDesc', {
            rules: [{ validator: checkStringLength(50) }],
          })(<Input.TextArea placeholder="最多输入50字" />)}
        </FormItem>
      </React.Fragment>
    );
  };

  createWorkstation = () => {
    // const { form, viewer } = this.props;
    // const { organization } = viewer || {};
    // const { workstationGroups } = organization || {};
    // const { getFieldDecorator } = form;
    // // 拉取回来的多个工位组
    // const _workstationGroups = getNodesFromConnection(workstationGroups) || [];
    // return (
    //   <React.Fragment>
    //     <FormItem label="工位组" key="workstation_workstationGroup_name">
    //       {getFieldDecorator('workstationWorkstationGroup', {
    //         rules: [{ required: true, message: '工位组名称必填' }],
    //       })(
    //         <Select>
    //           {_workstationGroups.map(({ id, name }) => {
    //             return (
    //               <Option value={id} key={id}>
    //                 {name}
    //               </Option>
    //             );
    //           })}
    //         </Select>,
    //       )}
    //     </FormItem>
    //     <FormItem label="名字" key="workstationName">
    //       {getFieldDecorator('workstationName', {
    //         rules: [{ required: true, message: '工位名称必填' }, { validator: checkStringLength(12) }],
    //       })(<Input />)}
    //     </FormItem>
    //     <FormItem label="二维码" key="workstationQrCode">
    //       {getFieldDecorator('workstationQrCode', {
    //         rules: [
    //           { required: true, message: '二维码必填' },
    //           { validator: checkStringLength(20) },
    //           // { validator: orderNumberFormat('二维码') }
    //         ],
    //       })(<Input />)}
    //     </FormItem>
    //     <FormItem label="备注" key="workstationDesc">
    //       {getFieldDecorator('workstationDesc', {
    //         rules: [{ validator: checkStringLength(50) }],
    //       })(<Input.TextArea placeholder="最多输入50字" />)}
    //     </FormItem>
    //   </React.Fragment>
    // );
  };

  render() {
    const { form } = this.props;

    const { type } = this.state;
    const { isGroup } = this.props;
    const { getFieldDecorator } = form || {};

    return (
      <Form layout="vertical">
        <FormItem label={'类型选择'}>
          {getFieldDecorator('type', {
            rules: [{ required: true, message: '请选择工位类型' }],
            initialValue: type,
            onChange: value => {
              this.setState({
                type: value,
              });
            },
          })(
            <Select disabled={isGroup}>
              <Option value={'workstationGroup'} key={'workstationGroup'}>
                工位组
              </Option>
              <Option value={'workstation'} key={'workstation'}>
                工位
              </Option>
            </Select>,
          )}
        </FormItem>
        {type === 'workstationGroup' ? this.createWorkstationGroup() : this.createWorkstation()}
      </Form>
    );
  }
}

const CreateWorkStationForm = withForm({ showFooter: true }, CreateWorkstation);

export default CreateWorkStationForm;
