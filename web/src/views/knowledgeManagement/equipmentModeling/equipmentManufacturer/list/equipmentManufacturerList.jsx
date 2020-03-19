import React, { Component } from 'react';
import _ from 'lodash';
import { withRouter } from 'react-router-dom';
import { Modal } from 'antd';
import PropTypes from 'prop-types';
import { getQuery } from 'src/routes/getRouteParams';
import { setLocation, getParams } from 'utils/url';
import { injectIntl } from 'react-intl';
import { changeChineseToLocale } from 'utils/locale/utils';
import { queryEquipmentManufacturerList, deleteEquipmentManufacturer } from 'src/services/knowledgeBase/equipment';
import { Button, RestPagingTable, Link, Tooltip } from 'components';
import { replaceSign } from 'src/constants';
import styles from './styles.scss';

const equipmentManufacturerItem = {
  value: 'equipmentManufacturer',
  display: '设备制造商',
};

type Props = {
  match: {},
  intl: any,
};

class EquipmentManufacturerList extends Component {
  props: Props;
  state = {
    loading: false,
    dataSource: [],
    total: 0,
  };

  componentDidMount() {
    const { match } = this.props;
    const queryMatch = getQuery(match);
    this.fetchData(queryMatch);
  }

  showDeleteConfirm = id => {
    const { intl } = this.props;
    Modal.confirm({
      iconType: 'exclamation-circle',
      className: `${styles.deleteModal}`,
      title: changeChineseToLocale('删除设备制造商', intl),
      content: changeChineseToLocale('删除该设备制造商将不可用于设备信息的维护，请确认！', intl),
      okText: changeChineseToLocale('删除', intl),
      cancelText: changeChineseToLocale('放弃', intl),
      onOk: () => {
        deleteEquipmentManufacturer(id)
          .then(res => {
            if (res.data.statusCode === 200) {
              const { match } = this.props;
              const queryMatch = getQuery(match);
              this.fetchData(queryMatch);
            }
          })
          .catch(console.log);
      },
    });
  };

  fetchData = async (params = {}) => {
    this.setState({ loading: true });
    setLocation(this.props, p => ({ ...p, ...params }));
    const {
      data: { data, total },
    } = await queryEquipmentManufacturerList({ ...params });
    this.setState({ dataSource: data, total, loading: false });
  };

  getColumns = () => {
    const columns = [
      {
        title: '名称',
        dataIndex: 'name',
        key: 'name',
        render: name => (name ? <Tooltip text={name} length={18} /> : replaceSign),
      },
      {
        title: '简称',
        dataIndex: 'shortName',
        key: 'shortName',
        render: shortName => (shortName ? <Tooltip text={shortName} length={20} /> : replaceSign),
      },
      {
        title: '联系人',
        dataIndex: 'contact',
        key: 'contact',
        render: contact => (contact ? <Tooltip text={contact} length={15} /> : replaceSign),
      },
      {
        title: '联系人电话',
        dataIndex: 'contactNumber',
        key: 'contactNumber',
        render: contactNumber => (contactNumber ? <Tooltip text={contactNumber} length={20} /> : replaceSign),
      },
      {
        title: '传真',
        dataIndex: 'fax',
        key: 'fax',
        render: fax => (fax ? <Tooltip text={fax} length={15} /> : replaceSign),
      },
      {
        title: '地址',
        dataIndex: 'address',
        key: 'address',
        render: address => (address ? <Tooltip text={address} length={18} /> : replaceSign),
      },
      {
        title: '操作',
        dataIndex: 'id',
        render: (id, record) => {
          return (
            <div key={`action-${record.id}`}>
              <Link
                style={{ marginRight: 10 }}
                onClick={() => {
                  this.context.router.history.push(`/knowledgeManagement/equipmentManufacturer/${id}/detail`);
                }}
              >
                详情
              </Link>
              <Link
                style={{ marginRight: 10 }}
                onClick={() => {
                  this.showDeleteConfirm(id);
                }}
              >
                删除
              </Link>
            </div>
          );
        },
      },
    ];
    return columns;
  };

  render() {
    const { dataSource, total, loading } = this.state;
    const columns = this.getColumns();
    return (
      <div>
        <div style={{ display: 'flex', margin: '20px 20px', justifyContent: 'space-between' }}>
          <Button
            icon="plus-circle-o"
            onClick={() => {
              this.context.router.history.push('/knowledgeManagement/equipmentManufacturer/create');
            }}
          >
            {`创建${equipmentManufacturerItem.display}`}
          </Button>
        </div>
        <RestPagingTable
          loading={loading}
          dataSource={dataSource}
          columns={columns}
          total={total}
          refetch={this.fetchData}
        />
      </div>
    );
  }
}

EquipmentManufacturerList.contextTypes = {
  router: PropTypes.object.isRequired,
};

export default withRouter(injectIntl(EquipmentManufacturerList));
