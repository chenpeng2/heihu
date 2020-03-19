import * as React from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';

import { Spin, Link, Popconfirm, FormattedMessage } from 'src/components';
import { getEbomDetail } from 'src/services/bom/ebom';
import auth from 'src/utils/auth';
import { replaceSign } from 'src/constants';
import { changeChineseToLocaleWithoutIntl } from 'utils/locale/utils';
import EBomPop from './EBomPop';
import styles from './index.scss';
import MaterialListTable from './baseComponent/materialListTable';

const Popiknow = Popconfirm.Popiknow;

type EBomDetailType = {
  children: any,
  viewer: any,
  routeParams: {
    id: string,
  },
  match: {
    params: any,
  },
};

type stateType = {};

class EBomDetail extends React.Component<EBomDetailType, stateType> {
  state = {
    popoverVisible: false,
    popoverContent: null,
    data: {},
    loading: false,
  };

  componentDidMount() {
    this.setData();
  }

  setData = () => {
    const id = _.get(this.props, 'match.params.id');
    this.setState({ loading: true });
    getEbomDetail(id)
      .then(({ data: { data } }) => {
        this.setState({ data });
      })
      .finally(() => {
        this.setState({ loading: false });
      });
  };

  render(): React.Node {
    const { children } = this.props;
    const { data, loading } = this.state;
    const {
      currentUnit,
      unit,
      defNum,
      productMaterialCode,
      productMaterialName,
      version,
      rawMaterialList,
      status,
      id,
      processRoutingCode,
      processRoutingName,
    } = data;

    const dataSource =
      rawMaterialList &&
      rawMaterialList.map(({ material, ...rest }) => ({
        ...rest,
        key: material.id,
        ...material,
        ebom: data,
      }));

    return (
      children || (
        <Spin spinning={loading}>
          <div className={styles.detailHeader}>
            <div className={styles.operation}>
              {status === 1 ? (
                <Popiknow title="已经启用的物料清单不可编辑，请先停用该物料清单。">
                  <Link auth={auth.WEB_EDIT_EBOM_DEF} type="error">
                    编辑
                  </Link>
                </Popiknow>
              ) : (
                <Link
                  auth={auth.WEB_EDIT_EBOM_DEF}
                  disabled={status === 1}
                  icon="edit"
                  onClick={() => {
                    this.context.router.history.push(`/bom/eBom/ebomdetail/${id}/editebom`);
                  }}
                >
                  编辑
                </Link>
              )}
              <Link
                icon="bars"
                style={{ marginLeft: 30 }}
                onClick={() => {
                  this.context.router.history.push(`/bom/eBom/ebomdetail/${id}/operationlog/${id}`);
                }}
              >
                查看操作记录
              </Link>
            </div>
            <div className={styles.title}>{changeChineseToLocaleWithoutIntl('物料清单详情')}</div>
            <div className={styles.detail}>
              <div className={styles.row}>
                <FormattedMessage defaultMessage={'成品物料编号/名称'} />
                <span>
                  {productMaterialCode && productMaterialName
                    ? `${productMaterialCode}/ ${productMaterialName}`
                    : replaceSign}
                </span>
              </div>
              <div className={styles.row}>
                <FormattedMessage defaultMessage={'数量'} />
                <span>{defNum}</span>
              </div>
              <div className={styles.row}>
                <FormattedMessage defaultMessage={'单位'} />
                <span>{_.get(currentUnit || unit, 'name')}</span>
              </div>
              <div className={styles.row}>
                <FormattedMessage defaultMessage={'状态'} />
                {status === 1 ? (
                  <span style={{ marginRight: 10 }} key="enable">
                    {changeChineseToLocaleWithoutIntl('启用中')}
                  </span>
                ) : (
                  <span style={{ marginRight: 10 }} key="disable">
                    {changeChineseToLocaleWithoutIntl('停用中')}
                  </span>
                )}
                <EBomPop
                  ebom={data}
                  enableDom={
                    <Link key="disable" type="error">
                      停用
                    </Link>
                  }
                  disableDom={<Link key="enable">启用</Link>}
                  status={status}
                  id={id}
                  refetch={this.setData}
                />
              </div>
              <div className={styles.row}>
                <FormattedMessage defaultMessage={'版本号'} />
                <span>{version}</span>
              </div>
              <div className={styles.row}>
                <FormattedMessage defaultMessage={'工艺路线'} />
                <span>
                  {processRoutingCode || replaceSign}/{processRoutingName || replaceSign}
                </span>
              </div>
              <div className={styles.row} style={{ display: 'block' }}>
                <FormattedMessage defaultMessage={'物料列表'} style={{ float: 'left' }} />
                <MaterialListTable ebomId={_.get(this.props, 'match.params.id')} data={dataSource} />
              </div>
            </div>
          </div>
        </Spin>
      )
    );
  }
}

EBomDetail.contextTypes = {
  router: PropTypes.object,
};

export default EBomDetail;
