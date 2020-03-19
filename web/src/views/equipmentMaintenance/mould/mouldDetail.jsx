import * as React from 'react';
import {
  SimpleTable,
  Link,
  Button,
  Icon,
  Spin,
  Popconfirm,
  Textarea,
  message,
  ImagePreview,
  Attachment,
  authorityWrapper,
  OpenModal,
} from 'components';
import { getMouldDetail, getMouldLog, enableMould, disableMould, scrapMould } from 'services/equipmentMaintenance/mould';
import auth from 'utils/auth';
import { Dropdown, Menu } from 'antd';
import { alertYellow, error } from 'styles/color';
import _ from 'lodash';
import { DEVICE_ENABLE_STATUS, replaceSign } from 'constants';
import { formatUnixMoment } from 'utils/time';
import EditDeviceCode from '../device/editDeviceCode';
import styles from './index.scss';

Menu.Item = authorityWrapper(Menu.Item);

type propsType = {
  match: {
    params: {
      id: string,
    },
  },
  form: any,
  location: any,
  history: any,
};

class MouldDetail extends React.Component<propsType> {
  state = {
    data: {},
    moduleDataSource: [],
    logDataSource: [],
    changeModal: false,
    loading: false,
    deviceCode: null,
    reasonDesc: '',
  };
  componentDidMount() {
    if (document.getElementById('mouldDetail')) {
      document.getElementById('mouldDetail').scrollIntoView();
    }
    this.setPageDetail();
  }

  setPageDetail = async () => {
    this.setState({ loading: true });
    const { match: { params: { id } } } = this.props;
    const { data: { data } } = await getMouldDetail(id);
    const { data: { data: logData } } = await getMouldLog(id, { page: 1, size: 3 });
    this.setState({ data, logDataSource: logData, loading: false });
  };

  getLogColumns = () => [
    {
      title: '时间',
      dataIndex: 'createdAt',
      render: time => formatUnixMoment(time).format('YYYY-MM-DD'),
    },
    { title: '日志类型', dataIndex: 'logTypeDisplay' },
    { title: '操作人', dataIndex: 'operator.name' },
    { title: '描述', dataIndex: 'description' },
  ];

  toggleChangeModal = visible => this.setState({ changeModal: visible });
  render() {
    const { data, logDataSource, loading, reasonDesc } = this.state;
    const { match: { params: { id } }, history: { push } } = this.props;
    const list = [
      {
        title: '图片',
        dataIndex: 'pictureFile',
        render: picture => (picture ? <ImagePreview url={picture.id} filename={picture.original_filename} /> : replaceSign),
      },
      { title: '类型', dataIndex: 'category.name' },
      { title: '名称', dataIndex: 'name' },
      {
        title: '编码',
        dataIndex: 'code',
        render: text => {
          return (
            <div style={{ display: 'flex', justifyContent: 'unset' }}>
              {this.state.deviceCode || text || replaceSign}
              <Link
                style={{ float: 'right', marginRight: 20, marginLeft: 30 }}
                onClick={() => {
                  OpenModal(
                    {
                      title: '编码变更',
                      children: (
                        <EditDeviceCode
                          targetId={id}
                          editCode={deviceCode => {
                            this.setState({ deviceCode });
                          }}
                          targetType={'mould'}
                          initialValue={this.state.deviceCode || text}
                        />
                      ),
                      footer: null,
                    },
                    this.context,
                  );
                }}
              >
                编辑
              </Link>
            </div>
          );
        },
      },
      { title: '电子标签', dataIndex: 'qrcode' },
      { title: '制造商', dataIndex: 'manufacturer.name' },
      { title: '型号', dataIndex: 'model' },
      { title: '序列号', dataIndex: 'serialNumber' },
      { title: '规格描述', dataIndex: 'description' },
      { title: '穴数', dataIndex: 'holesNumber' },
      {
        title: '出厂日期',
        dataIndex: 'deliverDate',
        render: time => time && formatUnixMoment(time).format('YYYY-MM-DD'),
      },
      {
        title: '入厂日期',
        dataIndex: 'admitDate',
        render: time => time && formatUnixMoment(time).format('YYYY-MM-DD'),
      },
      {
        title: '首次启用日期',
        dataIndex: 'firstEnableDate',
        render: time => time && formatUnixMoment(time).format('YYYY-MM-DD'),
      },
      {
        title: '更新时间',
        dataIndex: 'updatedAt',
        render: time => time && formatUnixMoment(time).format('YYYY-MM-DD HH:mm:ss'),
      },
      {
        title: '创建时间',
        dataIndex: 'createdAt',
        render: time => time && formatUnixMoment(time).format('YYYY-MM-DD HH:mm:ss'),
      },
      {
        title: '附件',
        dataIndex: 'attachmentsFile',
        render: file => (_.get(file, 'length', 0) > 0 ? <div style={{ width: 350 }}>{Attachment.AttachmentFile(file)}</div> : replaceSign),
      },
    ];
    const menu = (
      <Menu
        onClick={({ item, key }) => {
          push(`/equipmentMaintenance/${key}/create?targetType=mould&targetId=${id}
            &targetName=${data.name}&categoryId=${data.category.id}`);
        }}
      >
        <Menu.Item key="repairTask" auth={auth.WEB_CREATE_REPAIR_TASK}>
          维修任务
        </Menu.Item>
        <Menu.Item key="maintenanceTask" auth={auth.WEB_CREATE_MAINTAIN_TASK}>
          保养任务
        </Menu.Item>
      </Menu>
    );
    return (
      <div id="mouldDetail">
        <Spin spinning={loading}>
          <div>
            <div className={styles.tab}>
              <p className={styles.title}>
                模具详情
                <Link icon="edit" to={`${location.pathname}/edit/${id}`} style={{ float: 'right', marginRight: 20 }} auth={auth.WEB_EDIT_MOULD}>
                  编辑
                </Link>
              </p>
              <div>
                {_.get(data, 'enableStatus', 3) !== 3 && (
                  <div className={styles.basicOperation}>
                    <Dropdown overlay={menu}>
                      <Button icon="plus-circle-o">
                        创建任务<Icon type="down" />
                      </Button>
                    </Dropdown>
                  </div>
                )}
                {data &&
                  list.map(({ title, dataIndex, render }) => {
                    const desc = _.get(data, dataIndex);
                    return (
                      <div className={styles.row} key={dataIndex}>
                        <span className={styles.key}>{title}</span>
                        <span className={styles.desc}>{(typeof render === 'function' ? render(desc) : desc) || replaceSign}</span>
                      </div>
                    );
                  })}
              </div>
            </div>

            <div className={styles.tab}>
              <p className={styles.title}>启用状态</p>
              <div className={styles.row}>
                <span className={styles.key}>启用状态</span>
                <span className={styles.desc} style={{ flex: 'none' }}>
                  {DEVICE_ENABLE_STATUS[data.enableStatus]}
                </span>
                {data.enableStatus !== 3 && (
                  <React.Fragment>
                    {data.enableStatus === 1 ? (
                      <Link
                        onClick={async () => {
                          await enableMould(id);
                          message.success('启用成功！');
                          this.setPageDetail();
                        }}
                      >
                        启用
                      </Link>
                    ) : (
                      <Popconfirm
                        title={
                          <div>
                            <span>停用该模具后，该模具将无法在系统中使用，请确认并填写停用原因。</span>
                            <Textarea
                              value={reasonDesc}
                              onChange={({ target: { value } }) => {
                                this.setState({ reasonDesc: value.slice(0, 50) });
                              }}
                              placeholder="请输入停机原因必填"
                              style={{ marginTop: 10, height: 100 }}
                            />
                          </div>
                        }
                        cancelText="放弃"
                        onConfirm={async () => {
                          await disableMould(id, reasonDesc);
                          this.setPageDetail();
                          message.success('停用成功！');
                        }}
                      >
                        <Link style={{ color: error }}>停用</Link>
                      </Popconfirm>
                    )}
                    <Popconfirm
                      title="设备报废后，将无法重新启用，请确认！"
                      cancelText="放弃"
                      onConfirm={async () => {
                        await scrapMould(id);
                        message.success('报废成功！');
                        this.setPageDetail();
                      }}
                    >
                      <Link style={{ color: alertYellow, marginLeft: 20 }}>报废</Link>
                    </Popconfirm>
                  </React.Fragment>
                )}
              </div>
            </div>
            <div className={styles.tab}>
              <p className={styles.title}>
                最新日志
                <Link to={`${location.pathname}/mould-log/${id}`} icon="eye-o" style={{ float: 'right', marginRight: 20 }}>
                  查看
                </Link>
              </p>
              <div style={{ marginBottom: 20 }}>
                <SimpleTable rowKey="id" dataSource={logDataSource} columns={this.getLogColumns()} pagination={false} />
              </div>
            </div>
          </div>
        </Spin>
      </div>
    );
  }
}

export default MouldDetail;
