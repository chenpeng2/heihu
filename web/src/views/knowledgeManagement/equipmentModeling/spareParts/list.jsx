import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { RestPagingTable, Button, Spin, Link, Tooltip, Badge, ImportModal } from 'components';
import { replaceSign } from 'src/constants';
import { getQuery } from 'src/routes/getRouteParams';
import { disableSpareParts, enableSpareParts, importSpareParts } from 'src/services/equipmentMaintenance/spareParts';
import { primary, error } from 'src/styles/color/index';
import styles from './styles.scss';

type Props = {
  loading: boolean,
  match: {},
  data: any,
  fetchData: () => {},
};

class SparePartsList extends Component {
  props: Props;
  state = {};

  componentDidMount() {}

  getColumns = () => {
    const { fetchData } = this.props;
    return [
      {
        title: '备件编码',
        width: 200,
        dataIndex: 'code',
        key: 'code',
        render: code => <Tooltip text={code} length={20} />,
      },
      {
        title: '备件名称',
        width: 200,
        dataIndex: 'name',
        key: 'name',
        render: name => <Tooltip text={name} length={15} />,
      },
      {
        title: '状态',
        width: 120,
        dataIndex: 'enableStatus',
        key: 'enableStatus',
        render: enableStatus =>
          <Badge.MyBadge text={enableStatus === 1 ? '启用中' : '停用中' || replaceSign} color={enableStatus === 1 ? primary : error} />,
      },
      {
        title: '单位',
        width: 100,
        dataIndex: 'unit',
        key: 'unit',
        render: unit => <Tooltip text={unit} length={5} />,
      },
      {
        title: '规格描述',
        dataIndex: 'desc',
        key: 'desc',
        render: desc => <Tooltip text={desc} length={23} />,
      },
      {
        title: '操作',
        key: 'action',
        width: 230,
        render: (_, record) => (
          <React.Fragment>
            <Link
              onClick={() => {
                const query = getQuery(this.props.match);
                if (record.enableStatus === 1) {
                  disableSpareParts(record.code)
                    .then(() => {
                      fetchData(query);
                    });
                } else {
                  enableSpareParts(record.code)
                    .then(() => {
                      fetchData(query);
                    });
                }
              }}
            >
              {record.enableStatus === 1 ? '停用' : '启用'}
            </Link>
            <Link
              style={{ marginLeft: 10 }}
              onClick={() => {
                this.context.router.history.push(`/knowledgeManagement/spareParts/edit?code=${record.code}`);
              }}
            >
              {'编辑'}
            </Link>
            {/* <Link
              style={{ marginLeft: 10 }}
              onClick={() => {
                // this.context.router.history.push(`/knowledgeManagement/spareParts/edit?code=${record.code}`);
              }}
            >
              {'操作记录'}
            </Link> */}
          </React.Fragment>
        ),
      },
    ];
  }

  renderAction = () => {
    const { match, fetchData } = this.props;
    const queryMatch = getQuery(match);

    return (
      <div className={styles.operationLine}>
        <Button
          icon="plus-circle-o"
          style={{ marginRight: '20px' }}
          onClick={() => {
            this.context.router.history.push('/knowledgeManagement/spareParts/create');
          }}
        >
          创建备件
        </Button>
        <Button
          icon="download"
          ghost
          style={{ marginRight: '20px' }}
          onClick={() =>
            ImportModal({
              item: '备件',
              titles: ['code', 'name', 'unit', 'desc'],
              templateUrl: 'https://s3.cn-northwest-1.amazonaws.com.cn/public-template/%E5%A4%87%E4%BB%B6%E5%AF%BC%E5%85%A5%E6%A8%A1%E6%9D%BF.csv',
              logUrl: '/knowledgeManagement/spareParts/importLog',
              method: importSpareParts,
              fileTypes: '.csv',
              context: this.context,
              listName: 'list',
              refetch: {
                func: fetchData,
                params: queryMatch,
              },
            })
          }
        >
          导入
        </Button>
        <Link
          icon="eye"
          style={{ lineHeight: '30px', height: '28px' }}
          onClick={() => {
            this.context.router.history.push('/knowledgeManagement/spareParts/importLog');
          }}
        >
          查看导入日志
        </Link>
      </div>
    );
  }

  render() {
    const { data, loading, fetchData } = this.props;
    const columns = this.getColumns();

    return (
      <Spin spinning={loading}>
        {this.renderAction()}
        <RestPagingTable
          bordered
          dataSource={data && data.data || []}
          total={data && data.total}
          rowKey={record => record.id}
          columns={columns}
          refetch={fetchData}
        />
      </Spin>
    );
  }
}

SparePartsList.contextTypes = {
  router: PropTypes.object.isRequired,
};

export default withRouter(SparePartsList);
