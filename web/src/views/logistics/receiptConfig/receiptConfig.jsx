import React from 'react';
import { Tag, Link, Icon, openModal, SimpleTable, Popconfirm, message, Drawer } from 'components';
import {
  getReceiptCategory,
  getReceiptChecks,
  toggleReceiptCheckStatus,
  getCheckHistory,
  getSortPlans,
} from 'services/shipment/receipt';
import { getReceiptDamageReason } from 'services/shipment/damage';
import { InputCheckCategory } from 'constants';
import Colors from 'styles/color';
import Item from '../component/Item';
import TransportTypeForm from '../component/TransportTypeForm';
import BrokenReasonForm from '../component/BrokenReasonForm';
import CheckItemHistory from '../component/checkItemHistory';
import styles from './receiptConfig.scss';

const LogicMap = {
  1: '=',
  2: '>',
  3: '>=',
  4: '<=',
  5: '<',
};

class ReceiptConfig extends React.PureComponent {
  state = {
    receiptCategory: [],
    damageReason: [],
    check: [],
    sortPlans: [],
    showDrawer: false,
    history: [],
  };

  componentDidMount() {
    this.setReceiptCategory();
    this.setDamageReason();
    this.setCheck();
    this.setSortPlan();
  }

  setReceiptCategory = async () => {
    const { data: { data } } = await getReceiptCategory({ size: 100 });
    console.log(data);
    this.setState({
      receiptCategory: data,
    });
  };

  setDamageReason = async () => {
    const { data: { data } } = await getReceiptDamageReason({ size: 100 });
    this.setState({
      damageReason: data,
    });
  };

  setCheck = async () => {
    const { data: { data } } = await getReceiptChecks({ size: 100 });
    this.setState({
      check: data,
    });
  };

  setSortPlan = async () => {
    const { data: { data } } = await getSortPlans({ size: 100 });
    this.setState({
      sortPlans: data,
    });
  };

  renderSort = planItem => {
    const { logic, min, max, base, followUp } = planItem;
    let desc;
    if (followUp === 0) {
      return '';
    }
    if (logic === 6) {
      desc = `${min}%<抽样不合格率<${max}%`;
    } else {
      desc = `抽样不合格率 ${LogicMap[logic]} ${base} %`;
    }
    return desc;
  };

  handleTransportType = ({ edit, value }) => {
    openModal({
      title: `${edit ? '编辑' : '新建'}收货类型`,
      children: (
        <TransportTypeForm
          type="receipt"
          edit={edit}
          value={value}
          wrappedComponentRef={inst => (this.typeFormInst = inst)}
          callback={this.setReceiptCategory}
        />
      ),
      onOk: async () => {
        await this.typeFormInst.submit();
      },
    });
  };

  handleBrokenReasonForm = ({ edit, value }) => {
    openModal({
      title: `${edit ? '编辑' : '新建'}破损原因`,
      children: (
        <BrokenReasonForm
          type="receipt"
          value={value}
          edit={edit}
          callback={this.setDamageReason}
          wrappedComponentRef={inst => (this.brokenReasonInst = inst)}
        />
      ),
      onOk: async () => {
        await this.brokenReasonInst.submit();
      },
    });
  };

  renderHistory = async id => {
    const { data: { data } } = await getCheckHistory(id);
    this.setState({
      history: data,
      showDrawer: true,
    });
  };

  getPickColumns = () => {
    return [
      { title: '序号', dataIndex: 'seq' },
      { title: '质检方案', dataIndex: 'qcConfigName' },
      {
        title: '是否有后续方案',
        dataIndex: 'followUp',
        render: followUp => (followUp ? '是' : '否'),
      },
      {
        title: '后续触发逻辑',
        dataIndex: 'planItem',
        render: planItem => this.renderSort(planItem),
      },
    ];
  };
  render() {
    const { receiptCategory, damageReason, check, showDrawer, history, sortPlans } = this.state;
    return (
      <div className={styles.wrapper}>
        <Item title="收货类型">
          {receiptCategory.map(value => {
            const { name, id, unit } = value;
            return (
              <Tag
                key={id}
                style={{ marginBottom: 5 }}
                onClick={() => this.handleTransportType({ edit: true, value })}
              >
                {name}：{unit.name}
                <Icon type="edit" />
              </Tag>
            );
          })}
          <Link
            icon="plus-circle-o"
            className={styles.linkBorder}
            onClick={() => this.handleTransportType({ edit: false })}
          >
            收货类型
          </Link>
        </Item>
        <Item title="破损原因" className={styles.item}>
          {damageReason.map(value => {
            const { description, unit, notifyCount, id } = value;
            const desc =
              notifyCount !== null ? `> ${notifyCount} ${unit ? unit.name : ''}通知` : '';
            return (
              <Tag
                key={id}
                style={{ marginBottom: 5 }}
                onClick={() => this.handleBrokenReasonForm({ edit: true, value })}
              >
                {description}&nbsp;{desc}
                <Icon type="edit" />
              </Tag>
            );
          })}
          <Link
            icon="plus-circle-o"
            className={styles.linkBorder}
            onClick={() => this.handleBrokenReasonForm({ edit: false })}
          >
            破损原因
          </Link>
        </Item>
        <Item title="收货检查方案" className={styles.item}>
          {check.map(({ ioCategory, id, checkCategory, checkItems, status, ioCategories }) => {
            return (
              <div style={{ marginBottom: 20 }} key={id}>
                <div className={styles.checkHead}>
                  <div style={{ lineHeight: '22px' }}>
                    <span className={styles.name}>{InputCheckCategory[checkCategory]}</span>
                    <span
                      style={{ color: status ? Colors.primary : Colors.error, marginRight: 10 }}
                    >
                      ({status ? '启用中' : '停用中'})
                    </span>
                  </div>
                  <div style={{ flex: 1 }}>
                    {ioCategories &&
                      ioCategories.map(({ name, markColor }) => (
                        <span
                          className={styles.type}
                          key={name}
                          style={{ borderColor: markColor, color: markColor }}
                        >
                          {name}
                        </span>
                      ))}
                  </div>
                  <div className="child-gap" style={{ width: 160, textAlign: 'right' }}>
                    {status ? (
                      <React.Fragment>
                        <Link icon="edit" to={`${location.pathname}/check-item/edit/receipt/${id}`}>
                          编辑
                        </Link>
                        <Popconfirm
                          okType="danger"
                          okText="停用"
                          title={`停用之后所有相关收货流程将不做此项检查，确定停用该${
                            InputCheckCategory[checkCategory]
                          }吗？`}
                          onConfirm={async () => {
                            await toggleReceiptCheckStatus(id, 0);
                            message.success('停用成功！');
                            this.setCheck();
                          }}
                        >
                          <Link icon="tingyong" iconType="gc" type="error">
                            停用
                          </Link>
                        </Popconfirm>
                      </React.Fragment>
                    ) : (
                      <Link
                        icon="qiyong"
                        iconType="gc"
                        to={`${location.pathname}/check-item/edit/receipt/${id}`}
                      >
                        启用
                      </Link>
                    )}
                    <Link icon="bars" onClick={() => this.renderHistory(id)}>
                      记录
                    </Link>
                  </div>
                </div>
                <div className={styles.content}>
                  {checkItems.map(({ name, qualifiedStandard }) => (
                    <span className={styles.qcItem} key={name}>
                      <span className={styles.label}>
                        <span className="circle" />&nbsp; {name}：
                      </span>
                      {qualifiedStandard ? '是' : '否'}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
          <Link
            icon="plus-circle-o"
            className={styles.addItem}
            to={`${location.pathname}/check-item/create/receipt`}
          >
            收货检查
          </Link>
        </Item>
        <Item title="分拣计划" className={styles.item}>
          {sortPlans.map(({ id, name, planItems, ioCategories }) => {
            return (
              <div key={id} style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <h3 style={{ marginRight: 10 }}>{name}</h3>
                  <div style={{ flex: 1 }}>
                    {ioCategories &&
                      ioCategories.map(({ name, markColor }) => (
                        <span
                          className={styles.type}
                          key={name}
                          style={{ color: markColor, borderColor: markColor }}
                        >
                          {name}
                        </span>
                      ))}
                  </div>
                  <Link icon="edit" to={`${location.pathname}/pick-plan/edit/${id}`}>
                    编辑
                  </Link>
                </div>
                <SimpleTable
                  pagination={false}
                  columns={this.getPickColumns()}
                  style={{ margin: 0 }}
                  dataSource={planItems.sort((a, b) => a.seq - b.seq).map(planItem => {
                    const { seq, qcConfig, followUp } = planItem;
                    return {
                      seq,
                      qcConfigName: qcConfig.name,
                      followUp,
                      planItem,
                    };
                  })}
                />
              </div>
            );
          })}
          <Link
            style={{ marginTop: 20 }}
            icon="plus-circle-o"
            className={styles.addItem}
            to={`${location.pathname}/pick-plan/create`}
          >
            创建分拣计划
          </Link>
        </Item>
        <Drawer
          open={showDrawer}
          title="历史记录"
          onCancel={() => {
            this.setState({ showDrawer: false });
          }}
          sidebar={<CheckItemHistory data={history} />}
        />
      </div>
    );
  }
}

export default ReceiptConfig;
