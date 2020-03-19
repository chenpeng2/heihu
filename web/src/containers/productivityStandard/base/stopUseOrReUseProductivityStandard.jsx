import React, { Component } from 'react';
import { message, Popover, Button, Icon } from 'src/components';
import { queryWorkstation } from 'src/services/workstation';
import { changeProductivityStandardStatus } from 'src/services/knowledgeBase/productivityStandard';
import { primary, blacklakeGreen } from 'src/styles/color';

const StatusDisplay = {
  1: '启用',
  0: '停用',
};

type Props = {
  statusNow: {},
  render: () => {},
  code: string,
  fetchData: () => {},
};

class StopUseOrReUseProductivityStandard extends Component {
  props: Props;
  state = {
    statusNext: null,
    visible: false,
    workstations: [],
  };

  componentWillMount() {
    const { statusNow } = this.props;

    this.setState({
      statusNext: statusNow === 0 ? 1 : 0,
    });
  }

  componentWillReceiveProps(nextProps) {
    const { statusNow } = nextProps;

    this.setState({
      statusNext: statusNow === 0 ? 1 : 0,
    });
  }

  baseRender = () => {
    const { statusNext } = this.state;

    return <span>{StatusDisplay[statusNext]}</span>;
  };

  render() {
    const { render, code, fetchData } = this.props;
    const { statusNext, visible, popOverText, workstations } = this.state;

    return (
      <Popover
        visible={visible}
        content={
          <div style={{ paddingBottom: 30 }}>
            <div style={{ display: 'flex', paddingBottom: 15 }}>
              <Icon type="check-circle" color={blacklakeGreen} style={{ paddingRight: 4 }} />
              <div>
                {popOverText}成功！工位{workstations && workstations.map(e => e.name).join(',')}已有排程如果受影响请手动调整！
              </div>
            </div>
            <Button style={{ float: 'right' }} onClick={() => this.setState({ visible: false })}>
              知道了
            </Button>
          </div>
        }
      >
        <div
          style={{ display: 'inline-block', color: primary, cursor: 'pointer' }}
          onClick={() => {
            if (!code) return;
            changeProductivityStandardStatus(code, { status: statusNext, code }).then(async res => {
              const { data: { data: { task: workstationIds } } } = res;
              if (workstationIds && workstationIds.length) {
                const { data: { data: workstations } } = await queryWorkstation({ ids: workstationIds.join(',') });
                this.setState({ visible: true, workstations, popOverText: StatusDisplay[statusNext] });
              } else {
                message.success(`${StatusDisplay[statusNext]}标准产能成功`);
              }
              // 改变了状态后需要更新列表
              if (fetchData && typeof fetchData === 'function') fetchData();
            });
          }}
        >
          {render ? render(StatusDisplay[statusNext]) : this.baseRender()}
        </div>
      </Popover>
    );
  }
}

export default StopUseOrReUseProductivityStandard;
