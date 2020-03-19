import React, { Component } from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';

import moment from 'utils/time';
import {
  getOrganizationConfigFromLocalStorage,
  ORGANIZATION_CONFIG,
  TASK_DISPATCH_TYPE,
} from 'utils/organizationConfig';
import { getQuery } from 'routes/getRouteParams';
import { getAttachments } from 'services/attachment';
import { FormattedMessage, Spin, Attachment, Link, PlainText } from 'src/components';
import SaleOrderDetailModel from 'models/cooperate/saleOrder/SaleOrderDetailModel';
import { replaceSign } from 'constants';
import { black, middleGrey, primary } from 'styles/color';
import { getSOCustomProperty } from 'models/cooperate/saleOrder/service';
import { getPurchaseOrderDetailById, getPurchaseOrderDetail } from 'services/cooperate/purchaseOrder';

import CustomOrderField from './CustomOrderField';
import FinishPurchaseOrder from '../base/finishPurchaseOrder';
import LinkToEditPage from '../base/linkToEditPurchaseOrder';
import DeletePurchaseOrder from '../base/deletePurchaseOrder';
import MaterialList from '../base/materialListTable';
import { getCreateNestTaskPageUrl } from '../utils';

const AttachmentFile = Attachment.AttachmentFile;

type Props = {
  match: {},
};

type State = {
  model: SaleOrderDetailModel,
};

class Detail extends Component {
  props: Props;
  state: State;

  constructor(props: Props) {
    super(props);
    const model = SaleOrderDetailModel.of();
    this.state = {
      loading: false,
      detailData: null,
      attachments: [],
      materialList: [],
      model,
    };
  }

  componentDidMount() {
    const fetchCustomProperty = async () => {
      try {
        const properties = await getSOCustomProperty();
        const { model } = this.state;
        model.customProperty = properties;
        this.setState({ model });
      } catch (error) {
        //
      }
    };
    fetchCustomProperty();

    const { match } = this.props;
    const { code } = getQuery(match);
    const id = _.get(match, 'params.id');
    if (code) {
      this.fetchDataByCode(code);
    } else {
      this.fetchDataById(id);
    }
  }

  fetchAttachmentsData = async ids => {
    const {
      data: { data },
    } = await getAttachments(ids);
    return data.map(x => {
      x.originalFileName = x.original_filename;
      x.originalExtension = x.original_extension;
      return x;
    });
  };

  fetchDataByCode = async code => {
    if (!code) return null;

    this.setState({ loading: true });
    await getPurchaseOrderDetail(decodeURIComponent(code))
      .then(async ({ data: { data } }) => {
        const { attachments, materialList, orderCustomFields } = data || {};
        const files = attachments && attachments.length > 0 ? await this.fetchAttachmentsData(attachments) : [];

        const { model } = this.state;
        model.orderCustomFields = orderCustomFields;
        model.materialList = materialList;
        this.setState({
          detailData: data,
          attachments: files,
          model,
        });
      })
      .finally(() => {
        this.setState({ loading: false });
      });
  };

  fetchDataById = async id => {
    if (!id) return null;

    this.setState({ loading: true });
    await getPurchaseOrderDetailById(id)
      .then(async ({ data: { data } }) => {
        const { attachments, materialList, orderCustomFields } = data || {};
        const files = attachments && attachments.length > 0 ? await this.fetchAttachmentsData(attachments) : [];

        const { model } = this.state;
        model.orderCustomFields = orderCustomFields;
        model.materialList = materialList;
        this.setState({
          detailData: data,
          attachments: files,
          materialList,
          model,
        });
      })
      .finally(() => {
        this.setState({ loading: false });
      });
  };

  // 获取物料请求类型工厂配置
  getTaskDispatchConfig = () => {
    const config = getOrganizationConfigFromLocalStorage();

    return config && config[ORGANIZATION_CONFIG.taskDispatchType]
      ? config[ORGANIZATION_CONFIG.taskDispatchType].configValue
      : null;
  };

  renderItem = (label, component) => {
    const { changeChineseToLocale } = this.context;
    const labelStyle = {
      color: middleGrey,
      width: 100,
      display: 'inline-block',
      textAlign: 'right',
    };
    const componentStyle = {
      display: 'inline-block',
      marginLeft: 10,
      verticalAlign: 'top',
      maxWidth: 1000,
      overflowWrap: 'break-word',
    };
    const containerStyle = {
      margin: '20px 0 20px 20px',
    };

    return (
      <div style={containerStyle}>
        <div style={labelStyle}> {typeof label === 'string' ? changeChineseToLocale(label) : label} </div>{' '}
        <div style={componentStyle}>
          {' '}
          {typeof label === 'string' ? changeChineseToLocale(component) : component || replaceSign}{' '}
        </div>
      </div>
    );
  };

  renderOperation = purchaseOrderCode => {
    const id = _.get(this.props, 'match.params.id');
    const { detailData } = this.state;
    const status = _.get(detailData, 'status.value');

    return (
      <div>
        {status ? (
          <React.Fragment>
            <Link
              style={{ display: 'inline-block', color: primary, marginRight: 10 }}
              to={getCreateNestTaskPageUrl(id)}
              icon={'chuangjian'}
              iconType={'gc'}
            >
              {'创建嵌套任务'}
            </Link>
            <LinkToEditPage style={{ marginLeft: 10 }} code={id} icon="edit" />
            <FinishPurchaseOrder
              code={id}
              data={detailData}
              page="detail"
              type="error"
              icon="poweroff"
              style={{
                marginLeft: 30,
              }}
              refetch={this.fetchDataById}
            />
            <DeletePurchaseOrder
              code={id}
              type="error"
              icon="delete"
              page="detail"
              style={{
                marginLeft: 30,
              }}
              data={detailData}
            />
          </React.Fragment>
        ) : null}
        <Link
          icon="bars"
          style={{
            marginLeft: 30,
          }}
          onClick={() => {
            this.context.router.history.push(
              `/cooperate/purchaseOrders/${id}/detail/logs/operation?purchaseOrderCode=${purchaseOrderCode}`,
            );
          }}
        >
          查看操作记录
        </Link>
      </div>
    );
  };

  render() {
    const { loading, detailData, attachments, model } = this.state;
    const {
      customer,
      finishReason,
      remark,
      materialList,
      purchaseOrderCode,
      workOrders,
      projects,
      createdAt,
      updatedAt,
      status,
    } = detailData || {};
    const taskDispatchType = this.getTaskDispatchConfig();
    const projectCodes = projects && projects.length ? projects.map(x => x && x.projectCode) : null;
    const id = _.get(this.props, 'match.params.id');

    return (
      <Spin spinning={loading}>
        <div
          style={{
            margin: '20px 0 30px 20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <PlainText text="销售订单详情" />
          <div
            style={{
              marginRight: 20,
            }}
          >
            {this.renderOperation(purchaseOrderCode)}
          </div>
        </div>
        {this.renderItem('订单号', purchaseOrderCode || replaceSign)}
        {this.renderItem('创建时间', createdAt ? moment(createdAt).format('YYYY/MM/DD HH:mm:ss') : replaceSign)}
        {this.renderItem('更新时间', updatedAt ? moment(updatedAt).format('YYYY/MM/DD HH:mm:ss') : replaceSign)}
        {this.renderItem('状态', status ? status.display : replaceSign)}
        {status && status.value === 0 ? this.renderItem('结束原因', finishReason || replaceSign) : null}
        {this.renderItem(
          '客户',
          <div>
            <span> {customer ? customer.name : replaceSign} </span>
          </div>,
        )}
        {taskDispatchType === TASK_DISPATCH_TYPE.manager
          ? this.renderItem(
              '全部计划工单',
              workOrders && workOrders.length > 0 ? _.join(workOrders, '，') : replaceSign,
            )
          : this.renderItem(
              '全部项目',
              projectCodes && projectCodes.length > 0 ? _.join(projectCodes, ',') : replaceSign,
            )}
        {this.renderItem(
          '物料',
          <MaterialList
            purchaseOrder={{
              purchaseOrderCode,
              id,
            }}
            data={materialList}
            taskDispatchType={taskDispatchType}
            lineCustomFields={model.customLineFields}
          />,
        )}
        <CustomOrderField fields={model.customOrderFields} />
        {this.renderItem('备注', remark || replaceSign)}
        {this.renderItem(
          '附件',
          Array.isArray(attachments) && attachments.length ? AttachmentFile(attachments) : replaceSign,
        )}
      </Spin>
    );
  }
}

Detail.contextTypes = {
  router: PropTypes.object.isRequired,
  changeChineseToLocale: PropTypes.function,
};

export default withRouter(Detail);
