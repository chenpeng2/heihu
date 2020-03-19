import React, { Component } from 'react';
import _ from 'lodash';

import { Select, Link, OpenModal, Button, message } from 'src/components';
import { closeModal } from 'src/components/modal';
import { queryProcess, createProcess } from 'src/services/process';
import BaseForm from 'src/containers/newProcess/base/Form';
import { borderGrey } from 'src/styles/color';

import { INPUT_WIDTH } from '../../../constant';

const getProcesses = async (p) => {
  const res = await queryProcess(p);
  return _.get(res, 'data.data');
};

class ProcessSelect extends Component {
  props: {
    form: any,
    onChange: () => {},
    codeScanNum: number
  };

  state = {
    processes: [],
  };

  componentDidMount() {
    const { codeScanNum } = this.props;

    getProcesses({ status: 1, codeScanNum }).then(res => {
      this.setState({ processes: res });
    });
  }

  renderFooter = () => {
    const baseStyle = {
      width: 114,
      height: 32,
      borderColor: borderGrey,
      marginRight: 10,
    };

    return (
      <div style={{ textAlign: 'center' }}>
        <Button
          style={baseStyle}
          type="default"
          onClick={() => {
            closeModal();
          }}
        >
          取消
        </Button>
        <Button style={baseStyle} type="primary" onClick={this.submit}>
          保存
        </Button>
      </div>
    );
  };

  submit = async () => {
    const { form, onChange } = this.props;
    const { setFieldsValue } = form || {};
    const value = this.formRef ? await this.formRef.wrappedInstance.getFormValue() : null;

    if (value) {
      createProcess(value)
        .then(res => {
          message.success('创建工序成功');

          const code = _.get(res, 'data.data.code');
          if (code) {
            setFieldsValue({ code });
            onChange(code);
          }
        })
        .finally(() => {
          closeModal();
        });
    }
  };

  renderBaseForm = () => {
    return (
      <React.Fragment>
        <BaseForm wrappedComponentRef={inst => (this.formRef = inst)} />
        {this.renderFooter()}
      </React.Fragment>
    );
  };

  getSelectOptions = () => {
    const processes = this.state.processes;
    const options =
      Array.isArray(processes) && processes.length
        ? processes.map(({ code, name }) => {
            return <Select.Option value={code} key={code}>{`${code}/${name}`}</Select.Option>;
          })
        : [];

    options.unshift(
      <Select.Option value="create" key="add" disabled>
        <Link
          icon="plus-circle-o"
          onClick={() => {
            OpenModal({
              title: '创建工序',
              footer: null,
              children: this.renderBaseForm(),
            });
          }}
          style={{ width: '100%' }}
        >
          添加新工序
        </Link>
      </Select.Option>,
    );

    return options;
  };

  render() {
    const options = this.getSelectOptions();

    return (
      <Select style={{ width: INPUT_WIDTH }} {...this.props}>
        {options}
      </Select>
    );
  }
}

export default ProcessSelect;
