import * as React from 'react';
import { FormItem, withForm, message } from 'components';
import { Modal } from 'antd';
import WorkstationSelect from 'components/select/workstationSelect';
import { changeWorkStation } from 'services/equipmentMaintenance/device';

type propsType = {
  form: any,
  deviceId: string,
  visible: boolean,
  toggleVisible: boolean,
  refetch: () => {},
};

class ChangeWorkstation extends React.Component<propsType> {
  state = {};

  submit = () => {
    const {
      form: { validateFields },
      deviceId,
      toggleVisible,
      refetch,
    } = this.props;
    validateFields(async (err, values) => {
      const {
        data: { data },
      } = await changeWorkStation(deviceId, values.workStationId);
      refetch();
      toggleVisible(false);
      message.success('绑定设备成功');
    });
  };

  render() {
    const {
      form: { getFieldDecorator },
      visible,
      toggleVisible,
    } = this.props;
    return (
      <Modal
        visible={visible}
        title="绑定设备"
        onCancel={() => toggleVisible(false)}
        onOk={this.submit}
        cancelText="放弃"
      >
        <FormItem label="区域节点">
          {getFieldDecorator('workStationId')(<WorkstationSelect style={{ width: 300 }} treeDefaultExpandAll />)}
        </FormItem>
      </Modal>
    );
  }
}

export default withForm({}, ChangeWorkstation);
