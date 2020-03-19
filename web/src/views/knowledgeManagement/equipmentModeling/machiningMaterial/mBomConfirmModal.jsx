import React, { Component } from 'react';
import _ from 'lodash';
import { withRouter } from 'react-router-dom';
import { getCustomLanguage } from 'src/utils/customLanguage';
import { Button, Icon, Table } from 'src/components';
import { error, fontSub } from 'src/styles/color/index';

const customLanguage = getCustomLanguage();

type Props = {
  visible: boolean,
  mBomVersion: [],
  onClose: () => {},
};

class MBomConfirmModal extends Component {
  props: Props;
  state = {
    visible: false,
  };

  renderFooter = () => {
    const { onClose } = this.props;
    return (
      <div style={{ padding: '24px 0 6px', display: 'flex', justifyContent: 'center' }}>
        <Button
          style={{ width: 114, marginBottom: 30 }}
          type="ghost"
          onClick={() => {
            onClose();
          }}
        >
          关闭
        </Button>
      </div>
    );
  };

  renderConfirm = () => {
    const { mBomVersion } = this.props;
    const columns = [
      {
        title: '编号',
        key: 'index',
        width: 100,
        render: (data, record, index) => `${index < 9 ? 0 : ''}${index + 1}`,
      },
      {
        title: 'MBOM版本号',
        key: 'version',
        dataIndex: 'version',
        render: version => `MBOM版本号${version}`,
      },
    ];
    return (
      <div>
        <div style={{ margin: '35px 0 15px 0', display: 'flex', padding: '0 20px' }}>
          <Icon type={'close-circle'} style={{ fontSize: 34, marginTop: 6, color: error, marginRight: 14 }} />
          <div>
            <div style={{ fontSize: 16 }}>停用失败！</div>
            <div style={{ color: fontSub }}>
              该{customLanguage.equipment_machining_material}
              已在生产BOM中被使用，请先删除相应生产BOM的产出物料配置！使用了该模具的MBOM有：
            </div>
          </div>
        </div>
        <Table dataSource={mBomVersion || []} columns={columns} scroll={{ y: 210 }} pagination={false} />
      </div>
    );
  };

  render() {
    return (
      <div>
        {this.renderConfirm()}
        {this.renderFooter()}
      </div>
    );
  }
}

export default withRouter(MBomConfirmModal);
