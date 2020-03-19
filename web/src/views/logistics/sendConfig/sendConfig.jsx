import React from 'react';
import { Tag, Link, Icon, openModal, Drawer, Popconfirm, message } from 'components';
import { getSendCategories, getSendChecks, toggleSendCheckStatus } from 'services/shipment/send';
import { getSendDamageReason } from 'services/shipment/damage';
import Item from '../component/Item';
import TransportTypeForm from '../component/TransportTypeForm';
import styles from '../receiptConfig/receiptConfig.scss';
import BrokenReasonForm from '../component/BrokenReasonForm';
import { getCheckHistory } from '../../../services/shipment/receipt';
import CheckItemHistory from '../component/checkItemHistory';
import { OutputCheckCategory } from '../../../constants';
import Colors from '../../../styles/color';

class SendConfig extends React.PureComponent {
  state = {
    category: [],
    damageReason: [],
    check: [],
    showDrawer: false,
    history: [],
  };

  componentDidMount() {
    this.setCategory();
    this.setDamageReason();
    this.setCheck();
  }

  setCategory = async () => {
    const { data: { data } } = await getSendCategories({ size: 100 });
    this.setState({
      category: data,
    });
  };

  setDamageReason = async () => {
    const { data: { data } } = await getSendDamageReason({ size: 100 });
    this.setState({
      damageReason: data,
    });
  };

  setCheck = async () => {
    const { data: { data } } = await getSendChecks({ size: 100 });
    this.setState({
      check: data,
    });
  };

  handleTransportType = ({ edit, value }) => {
    openModal({
      title: `${edit ? '编辑' : '新建'}发运类型`,
      children: (
        <TransportTypeForm
          type="send"
          edit={edit}
          value={value}
          wrappedComponentRef={inst => (this.typeFormInst = inst)}
          callback={this.setCategory}
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
          type="send"
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

  render() {
    const { category, damageReason, check, showDrawer, history } = this.state;
    return (
      <div className={styles.wrapper}>
        <Item title="发运类型">
          {category.map(value => {
            const { name, id, unit } = value;
            return (
              <Tag
                key={id}
                style={{ marginBottom: 5 }}
                onClick={() => this.handleTransportType({ edit: true, value })}
              >
                {name}：{unit && unit.name}
                <Icon type="edit" />
              </Tag>
            );
          })}
          <Link
            icon="plus-circle-o"
            className={styles.linkBorder}
            onClick={() => this.handleTransportType({ edit: false })}
          >
            发运类型
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
                {description}&nbsp; {desc}
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
        <Item title="出厂检查方案" className={styles.item}>
          {check.map(({ ioCategories, id, checkCategory, checkItems, status }) => {
            return (
              <div style={{ marginBottom: 20 }} key={id}>
                <div className={styles.checkHead}>
                  <div style={{ lineHeight: '22px' }}>
                    <span className={styles.name}>{OutputCheckCategory[checkCategory]}</span>
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
                  <div className="child-gap">
                    {status ? (
                      <React.Fragment>
                        <Link icon="form" to={`${location.pathname}/check-item/edit/send/${id}`}>
                          编辑
                        </Link>
                        <Popconfirm
                          okType="danger"
                          okText="停用"
                          title={`停用之后所有相关发运流程将不做此项检查，确定停用该${
                            OutputCheckCategory[checkCategory]
                          }吗？`}
                          onConfirm={async () => {
                            await toggleSendCheckStatus(id, 0);
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
                        to={`${location.pathname}/check-item/edit/send/${id}`}
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
            to={`${location.pathname}/check-item/create/send`}
          >
            发运检查
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

export default SendConfig;
