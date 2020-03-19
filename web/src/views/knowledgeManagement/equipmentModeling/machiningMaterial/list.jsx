import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { RestPagingTable, Button, Spin, Link, Tooltip, Badge, ImportModal } from 'components';
import { replaceSign } from 'src/constants';
import { injectIntl } from 'react-intl';
import { changeChineseToLocale } from 'utils/locale/utils';
import { getQuery } from 'src/routes/getRouteParams';
import { importMachiningMaterial, importUpdateMachiningMaterial } from 'src/services/knowledgeBase/equipment';
import { MACHINING_MATERIAL_TYPE } from 'src/views/equipmentMaintenance/constants';
import { primary, error } from 'src/styles/color/index';
import { getCustomLanguage } from 'src/utils/customLanguage';
import LinkToChangeStatus from './linkToChangeStatus';
import { getMachiningMaterialDetailUrl, getEditMachiningMaterialUrl } from './utils';
import styles from './styles.scss';

type Props = {
  loading: boolean,
  match: {},
  data: any,
  intl: any,
  fetchData: () => {},
};

const customLanguage = getCustomLanguage();

class MachiningMaterialList extends Component {
  props: Props;
  state = {};

  getColumns = () => {
    const { intl } = this.props;
    return [
      {
        title: '类型',
        width: 100,
        dataIndex: 'type',
        key: 'type',
        render: type => <Tooltip text={changeChineseToLocale(MACHINING_MATERIAL_TYPE[type], intl)} length={20} />,
      },
      {
        title: '编号',
        width: 200,
        dataIndex: 'code',
        key: 'code',
        render: code => <Tooltip text={code} length={15} />,
      },
      {
        title: '名称',
        width: 200,
        dataIndex: 'name',
        key: 'name',
        render: name => <Tooltip text={name} length={15} />,
      },
      {
        title: '单位',
        width: 100,
        dataIndex: 'unitName',
        key: 'unitName',
        render: unitName => <Tooltip text={unitName} length={5} />,
      },
      {
        title: '规格描述',
        dataIndex: 'specification',
        key: 'specification',
        render: specification => <Tooltip text={specification || replaceSign} length={23} />,
      },
      {
        title: '状态',
        width: 120,
        dataIndex: 'statusDisplay',
        key: 'statusDisplay',
        render: (statusDisplay, record) => (
          <Badge.MyBadge
            text={record.status === 1 ? '启用中' : '停用中' || replaceSign}
            color={record.status === 1 ? primary : error}
          />
        ),
      },
      {
        title: '操作',
        key: 'action',
        width: 150,
        render: (_, record) => (
          <React.Fragment>
            <Link
              style={{ marginRight: 10 }}
              onClick={() => {
                this.context.router.history.push(getMachiningMaterialDetailUrl(encodeURIComponent(record.code)));
              }}
            >
              {'查看'}
            </Link>
            <LinkToChangeStatus
              style={{ marginRight: 10 }}
              record={record}
              onUpdate={status => {
                this.setState({ status });
              }}
            />
            <Link
              onClick={() => {
                this.context.router.history.push(getEditMachiningMaterialUrl(encodeURIComponent(record.code)));
              }}
            >
              {'编辑'}
            </Link>
          </React.Fragment>
        ),
      },
    ];
  };

  renderAction = () => {
    const { match, fetchData, intl } = this.props;
    const queryMatch = getQuery(match);

    return (
      <div className={styles.operationLine}>
        <Button
          icon="plus-circle-o"
          style={{ marginRight: '20px' }}
          onClick={() => {
            this.context.router.history.push('/knowledgeManagement/machiningMaterial/create');
          }}
        >
          {`${changeChineseToLocale('创建', intl)}${customLanguage.equipment_machining_material}`}
        </Button>
        <Button
          icon="download"
          ghost
          style={{ marginRight: '20px' }}
          onClick={() =>
            ImportModal({
              item: customLanguage.equipment_machining_material,
              titles: ['typeDisplay', 'code', 'name', 'unitName', 'unitPrice', 'specification', 'toolingTypeDisplay'],
              templateUrl:
                'https://s3.cn-northwest-1.amazonaws.com.cn/public-template/20190304/%E9%9D%9E%E7%94%9F%E4%BA%A7%E7%89%A9%E6%96%99%E5%AE%9A%E4%B9%89%E5%AF%BC%E5%85%A5%E6%A8%A1%E6%9D%BF.csv',
              logUrl: '/knowledgeManagement/machiningMaterial/importLog',
              method: importMachiningMaterial,
              updateMethod: importUpdateMachiningMaterial,
              fileTypes: '.csv',
              context: this.context,
              listName: 'items',
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
            this.context.router.history.push('/knowledgeManagement/machiningMaterial/importLog');
          }}
        >
          查看导入日志
        </Link>
      </div>
    );
  };

  render() {
    const { data, loading, fetchData } = this.props;
    const columns = this.getColumns();

    return (
      <Spin spinning={loading}>
        {this.renderAction()}
        <RestPagingTable
          bordered
          dataSource={(data && data.data) || []}
          total={data && data.total}
          rowKey={record => record.id}
          columns={columns}
          refetch={fetchData}
        />
      </Spin>
    );
  }
}

MachiningMaterialList.contextTypes = {
  router: PropTypes.object.isRequired,
};

export default withRouter(injectIntl(MachiningMaterialList));
