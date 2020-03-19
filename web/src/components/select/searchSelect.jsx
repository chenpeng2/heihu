import React from 'react';
import debounce from 'lodash.debounce';
import _ from 'lodash';
import { injectIntl } from 'react-intl';
import { changeChineseToLocale } from 'src/utils/locale/utils';

import { Link, OpenModal, Spin, FormattedMessage } from 'src/components';
import { getProcessRoutings } from 'src/services/bom';
import { getMboms } from 'src/services/bom/mbom';
import { queryMaterial } from 'src/services/bom/material';
import { queryMaterialTypeList } from 'src/services/bom/materialType';
import { getProjectList } from 'src/services/cooperate/project';
import { getPurchaseOrders } from 'src/services/cooperate/purchaseOrder';
import { queryProcess, getBatchTemplateList } from 'src/services/process';
import { queryWorkstation, queryWorkstations, queryWorkstationGroup } from 'src/services/workstation';
import { queryStorages } from 'src/services/stock/lgUnits';
import { getSparePartsValidList } from 'src/services/equipmentMaintenance/spareParts';
import { getDevices, getMetricList } from 'src/services/equipmentMaintenance/device';
import { queryDeliverTraceSelectRange } from 'src/services/cooperate/trace';
import { get_purchase_list_list } from 'src/services/cooperate/purchase_list';
import { getEbomList, getEbomListWithExactSearch } from 'src/services/bom/ebom';
import { getCustomers } from 'src/services/knowledgeBase/customer';
import { queryProducedMaterial } from 'src/services/datagram/material';
import { getRoles } from 'src/services/auth/role';
import { getWorkgroups } from 'src/services/auth/workgroup';
import { getUsers } from 'src/services/auth/user';
import { queryQcItemsGroupList } from 'src/services/knowledgeBase/qcItems';

import {
  getValidDeviceCategoryList,
  getValidDeviceList,
  getReportTemplate,
  getEquipProdList,
  getToolingList,
} from 'src/services/equipmentMaintenance/base';
import { getMouldList } from 'src/services/equipmentMaintenance/mould';
import { getManufacturer } from 'src/services/equipmentMaintenance/manufacturer';
import { getSearchFaultCausesList, getEquipmentCategoryList } from 'src/services/knowledgeBase/equipment';
import { units as getUnits } from 'src/services/knowledgeBase/unit';
import { getDefects } from 'src/services/knowledgeBase/defect';
import { queryQcPlanList } from 'src/services/qualityManagement/qcPlan';
import { getWorkshops } from 'services/knowledgeBase/workshop';
import CreateWorkstationModal from 'src/views/knowledgeManagement/workstationGroup/create';
import { getParkingList, getPlateNumbers, getCarriers, getDrivers } from 'services/shipment/carrier';
import { getStoreHouseList } from 'src/services/knowledgeBase/storeHouse';
import { getReceiptCategory } from 'services/shipment/receipt';
import { getSendCategories } from 'services/shipment/send';
import { getQcConfigList } from 'services/qcConfig';
import { getReceiptDamageReason } from 'services/shipment/damage';
import { getReceiveTaskList } from 'services/shipment/receiptTask';
import { getProjectFinishReasonList } from 'services/knowledgeBase/projectFinishReason';
import { getProviderList } from 'services/provider';
import { queryPlannedTicketList, queryWorkOrderListAllLike } from 'services/cooperate/plannedTicket';
import { getMachiningMaterial } from 'services/knowledgeBase/equipment';
import { getQcDefectReasonList } from 'src/services/knowledgeBase/qcModeling/qcDefectReason';
import { sopTemplateList } from 'services/knowledgeBase/sopTemplate';
import CreateDowntimeCausesType from 'views/knowledgeManagement/factoryModeling/downTimeCauses/base/CreateDowntimeCausesType';
import { getDowntimeCauseType } from 'services/knowledgeBase/downtimeCause';
import Select from '../select';

const Option = Select.Option;
const MATERIAL_SIZE = 10;

type propsType = {
  id: any,
  type: 'account' | 'processRouting',
  style: mixed,
  params: mixed,
  secondParams: mixed, // 一个type中有两个接口且接口所需参数各不相同
  handleData: () => {}, // 对select的数据做进一步处理
  extraSearch: () => {}, // extraSearch为了处理当默认的label，key组合无法满足要求的时候。可以自己处理请求，处理label和key
  labelInValue: boolean,
  onChange: () => {},
  createButton: any,
  getKey: () => {},
  onSelect: () => {},
  disabled: boolean,
  clearOnFocus: boolean, // focus的时候清除options
  renderOption: () => {}, // 对option的自定义渲染
  notFoundContent: React.node,
  converter: (data: any) => {},
  fetchOnDidMount: boolean,
};

class SearchSelect extends React.Component<propsType> {
  constructor(props) {
    super(props);
    this.lastFetchId = 0;
    this.handleSearch = debounce(this.handleSearch, 800);
    this.state = {
      data: [],
      fetching: false,
    };
  }

  componentDidMount() {
    if (this.props.fetchOnDidMount) {
      this.handleSearch();
    }
  }

  handlePropsChange = (...rest) => {
    const { onChange } = this.props;
    if (typeof onChange === 'function') {
      onChange(...rest);
    }
  };

  handleSearch = async search => {
    const { id, extraSearch, getKey, params: _params, labelInValue, converter } = this.props;
    this.lastFetchId += 1;
    const fetchId = this.lastFetchId;
    let selectData = [];
    const { handleData } = this.props;
    const params = {
      search,
      ..._params,
    };
    this.setState({ data: [], fetching: true });
    // extraSearch为了处理当默认的label，key组合无法满足要求的时候。可以自己处理请求，处理label和key
    if (extraSearch && typeof extraSearch === 'function') {
      selectData = await extraSearch(params);
    }

    // 当选择type的时候的处理逻辑
    switch (this.props.type) {
      case 'unit': {
        const {
          data: { data },
        } = await getUnits(params);
        selectData = data.map(unit => ({
          key: labelInValue === false ? unit.name : JSON.stringify(unit.id),
          label: unit.name,
        }));
        break;
      }
      case 'defect': {
        const {
          data: { data },
        } = await getDefects({ ...params, size: 100 });
        selectData = data.map(defect => ({
          key: defect.id,
          label: defect.name,
        }));
        break;
      }
      case 'project': {
        const { data } = await getProjectList(params);
        selectData = data.data.map(({ projectCode }) => ({
          key: projectCode,
          label: projectCode,
        }));
        break;
      }
      case 'productCode': {
        const variables = { search: params.search, searchType: 'productCode' };
        const { data } = await getProjectList(variables);
        const codes = [];
        const _data = [];
        const x =
          data.data &&
          data.data.forEach(({ product }) => {
            if (codes.indexOf(product.code) === -1) {
              codes.push(product.code);
              _data.push({
                label: `${product.code}`,
                key: product.code,
              });
            }
          });
        selectData = _data;
        break;
      }
      case 'productName': {
        const variables = { search: params.search, searchType: 'productName' };
        const { data } = await getProjectList(variables);
        const names = [];
        const _data = [];
        const x =
          data.data &&
          data.data.forEach(({ product }) => {
            if (names.indexOf(product.name) === -1) {
              names.push(product.name);
              _data.push({
                label: `${product.name}`,
                key: product.name,
              });
            }
          });
        selectData = _data;
        break;
      }
      case 'processRouting': {
        const { data } = await getProcessRoutings(params);
        selectData = data.data.map(({ code, name }) => ({
          label: `${code}/${name}`,
          key: code,
        }));
        break;
      }
      case 'purchaseOrder': {
        const { data } = await getPurchaseOrders({
          purchaseOrderCode: params.search || '',
        });
        selectData = data.data.map(({ purchaseOrderCode }) => ({
          label: purchaseOrderCode,
          key: purchaseOrderCode,
        }));
        break;
      }
      case 'mbom': {
        const { data } = await getMboms(params);
        selectData = data.data.map(({ materialCode, version }) => ({
          label: version,
          key: version,
        }));
        break;
      }
      case 'processName': {
        const variables = { search: params.search, status: 1 };
        const { data } = await queryProcess({ ...variables, ..._params });
        selectData = data.data.map(e => ({
          label: e.name,
          key: e.code,
          data: e,
        }));
        break;
      }
      case 'workstation': {
        const { search, ...rest } = params || {};
        const variables = { name: search, size: 200, ...rest };
        const { data } = await queryWorkstation(variables);
        selectData = data.data.map(workstation => ({
          label: workstation.name,
          key: workstation.id,
          data: workstation,
        }));
        break;
      }
      case 'workstationCodeAndName': {
        const { search, ...rest } = params || {};
        const variables = { search, ...rest };

        const { data } = await queryWorkstation(variables);
        selectData = data.data.map(({ id, name, code }) => ({
          label: `${name}(${code})`,
          key: id,
        }));
        break;
      }
      case 'workstationGroup': {
        const variables = { search: params.search };
        const { data } = await queryWorkstationGroup(variables);
        selectData = data.data.map(({ id, name }) => ({
          label: name,
          key: id,
        }));
        selectData.unshift({
          label: (
            <Link
              style={{ width: '100%' }}
              icon="plus-circle-o"
              onClick={() => {
                OpenModal(
                  {
                    children: (
                      <CreateWorkstationModal
                        isGroup
                        onSuccess={value => {
                          if (_.get(value, 'name')) {
                            this.handlePropsChange({
                              key: value.id,
                              label: value.name,
                            });
                          }
                        }}
                      />
                    ),
                    title: '添加工位组',
                    footer: null,
                  },
                  this.context,
                );
              }}
            >
              创建工位组
            </Link>
          ),
          disabled: true,
          key: 'create',
        });
        break;
      }
      case 'location': {
        const variables = { name: params.search };
        const { data: workstations } = await queryWorkstations(variables);
        const { data: storages } = await queryStorages(variables);
        selectData = workstations.data
          .filter(({ location }) => location)
          .map(({ location, name }) => ({
            label: name,
            key: location.id,
          }))
          .concat(
            storages.data.map(({ location, name }) => ({
              label: name,
              key: location.id,
            })),
          );
        break;
      }
      case 'materialBySearch': {
        const variables = { size: MATERIAL_SIZE, ...params };
        const { data } = await queryMaterial(variables);
        selectData = data.data.map(material => {
          const { code, name, ...rest } = material;
          return {
            label: `${code}/${name}`,
            key: getKey ? getKey({ code, name, ...rest }) : code,
            title: `${code}/${name}`,
            data: material,
          };
        });
        break;
      }
      case 'materialByCode': {
        const variables = { size: MATERIAL_SIZE, ...params };
        const { data } = await queryMaterial(variables);
        selectData = data.data.map(({ code, name }) => ({
          label: `${code}`,
          key: code,
        }));
        break;
      }
      case 'materialByName': {
        const variables = { size: MATERIAL_SIZE, ...params };
        const { data } = await queryMaterial(variables);
        selectData = data.data.map(({ code, name }) => ({
          label: `${name}`,
          key: name,
        }));
        break;
      }
      case 'materialTypeByName': {
        const variables = { ...params, name: params.search };
        const { data } = await queryMaterialTypeList(variables);
        selectData = data.data.map(({ id, code, name }) => ({
          label: `${name}`,
          key: getKey ? getKey({ id, code, name }) : code,
        }));
        break;
      }
      case 'producedMaterialByName': {
        const variables = { materialName: params.search };
        const { data } = await queryProducedMaterial(variables);
        selectData = data.data.map(({ materialCode, materialName }) => ({
          label: `${materialName}`,
          key: materialName,
        }));
        break;
      }
      case 'deliverTrace': {
        const variables = {
          field_name: `${id}`,
          pre_value: params.search || '',
        };
        const { data } = await queryDeliverTraceSelectRange(variables);
        selectData = data.data.map(value => ({
          label: value,
          key: value,
        }));
        break;
      }
      case 'procureOrder': {
        const variables = { procureOrderCode: params.search };
        const { data } = await get_purchase_list_list(variables);
        selectData = data.data.map(({ procureOrderCode }) => ({
          label: procureOrderCode,
          key: procureOrderCode,
        }));
        break;
      }
      case 'ebom': {
        const { data } = await getEbomList(params);
        selectData = data.data.map(({ version, id }) => ({
          label: version,
          key: id,
        }));
        break;
      }
      // ebom的精确查询
      case 'ebomExact': {
        const { data } = await getEbomListWithExactSearch(params);
        selectData = data.data.map(({ version, id, rawMaterialList }) => {
          return {
            label: version,
            key: id,
            rawMaterialList,
          };
        });
        break;
      }
      case 'role': {
        const {
          data: { data },
        } = await getRoles({ name: params.search });
        selectData = data.map(({ name, id }) => ({
          label: name,
          key: id,
        }));
        break;
      }
      case 'workgroup': {
        const {
          data: { data },
        } = await getWorkgroups({
          name: search,
          active: true,
          ...this.props.params,
        });
        selectData = data.map(({ name, id }) => ({
          key: id,
          label: name,
        }));
        break;
      }
      case 'userAndWorkgroup': {
        const {
          data: { data: workgroups },
        } = await getWorkgroups({
          name: search,
          ...this.props.params,
        });
        const {
          data: { data: users },
        } = await getUsers({
          name: search,
          size: 50,
          active: true,
          ...(this.props.secondParams || this.props.params),
        });
        workgroups.forEach(n => (n.id = `workgroup:${n.id}`));
        users.forEach(n => (n.id = `user:${n.id}`));
        const data = workgroups.concat(users);
        selectData = data.map(({ name, id }) => ({
          key: id,
          label: name,
        }));
        break;
      }
      case 'user':
      case 'account': {
        const {
          data: { data },
        } = await getUsers({
          name: search,
          size: 50,
          active: true,
          ...this.props.params,
        });
        selectData = data.map(({ name, id }) => ({
          key: id,
          label: name,
        }));
        break;
      }
      case 'planner': {
        const {
          data: { data },
        } = await getUsers({
          name: search,
          size: 50,
          active: true,
          roleId: 4,
          ...this.props.params,
        });
        selectData = data.map(({ name, id }) => ({
          key: id,
          label: name,
        }));
        break;
      }
      case 'productionManager': {
        const {
          data: { data },
        } = await getUsers({
          name: search,
          size: 50,
          active: true,
          roleId: 5,
          ...this.props.params,
        });
        selectData = data.map(({ name, id }) => ({
          key: id,
          label: name,
        }));
        break;
      }
      case 'target': {
        const {
          data: { data },
        } = await getValidDeviceList({
          searchContent: params.search,
        });
        selectData = data.map(({ name, id, category }) => ({
          key: `${id};${category.type}`,
          label: name,
        }));
        break;
      }
      case 'prodEquip': {
        const {
          data: { data },
        } = await getEquipProdList({
          searchContent: params.search,
        });
        selectData = data.map(({ name, id, category }) => ({
          key: id,
          label: name,
        }));
        break;
      }
      // 目标类型(设备、模具)
      case 'targetType': {
        const {
          data: { data },
        } = await getValidDeviceCategoryList({
          searchContent: params.search,
          ..._params,
        });
        selectData = data.map(({ name, id, code }) => ({
          // 工装备件类只有code
          key: id || code,
          label: name,
        }));
        break;
      }
      case 'faultCase': {
        const {
          data: { data },
        } = await getSearchFaultCausesList({
          searchContent: params.search,
          ..._params,
        });
        selectData = data.map(({ name, id, code }) => ({
          key: String(id),
          label: `${code}(名称：${name})`,
        }));
        break;
      }
      case 'reportTemplate': {
        const {
          data: { data },
        } = await getReportTemplate({
          searchName: params.search,
        });
        selectData = data.map(({ name, id }) => ({
          key: id,
          label: name,
        }));
        break;
      }
      // 制造商
      case 'manufacturer': {
        const {
          data: { data },
        } = await getManufacturer({
          searchName: params.search,
          size: 50,
        });
        selectData = data.map(({ name, id }) => ({
          key: id,
          label: name,
        }));
        break;
      }
      case 'deviceCategory': {
        const variables = {
          searchContent: params.search,
          page: 1,
          size: 50,
          ...params,
        };
        delete variables.search;
        const {
          data: { data },
        } =
          variables.searchType === 'mould'
            ? await getValidDeviceCategoryList(variables)
            : await getEquipmentCategoryList(variables);
        selectData = data.map(({ name, id }) => ({
          key: id,
          label: name,
        }));
        break;
      }
      case 'workshop': {
        const {
          data: { data },
        } = await getWorkshops({
          size: 50,
          key: params.search,
          enabled: true,
        });
        selectData = data.map(({ name, id }) => ({
          key: id,
          label: name,
        }));
        break;
      }
      case 'qcTaskCode': {
        const {
          data: { data },
        } = await getReportTemplate({
          searchName: params.search,
        });
        selectData = data.map(({ name, id }) => ({
          key: id,
          label: name,
        }));
        break;
      }
      case 'qcItemsGroup': {
        const {
          data: { data },
        } = await queryQcItemsGroupList({
          nameSearch: params.search,
          size: params.search ? undefined : 1000,
        });
        selectData = data.map(({ name, id }) => ({
          key: id,
          label: name,
        }));
        break;
      }
      case 'qcMembers': {
        const {
          data: { data },
        } = await getUsers({
          name: params.search,
          roleId: 11,
          size: 50,
          active: true,
          ...this.props.params,
        });
        selectData = data.map(({ name, id }) => ({
          key: id,
          label: name,
        }));
        break;
      }
      // 包含所有qa和qc人员
      case 'qualityMembers': {
        const {
          data: { data },
        } = await getUsers({
          name: params.search,
          roleIds: '10,11',
          size: 50,
          active: true,
          ...this.props.params,
        });
        selectData = data.map(({ name, id }) => ({
          key: id,
          label: name,
        }));
        break;
      }
      case 'storages': {
        const {
          data: { data },
        } = await queryStorages({
          name: params.search,
        });
        selectData = data.map(({ name, id }) => ({
          key: id,
          label: name,
        }));
        break;
      }
      case 'parking': {
        const {
          data: { data },
        } = await getParkingList({
          name: params.search,
        });
        selectData = data.map(({ name, id }) => ({
          key: id,
          label: name,
        }));
        break;
      }
      case 'plateNumber': {
        const {
          data: { data },
        } = await getPlateNumbers({
          code: params.search,
        });
        selectData = data.map(({ code }) => ({
          key: code,
          label: code,
        }));
        break;
      }
      case 'carrier': {
        const {
          data: { data },
        } = await getCarriers({
          name: params.search,
        });
        selectData = data.map(({ name, id }) => ({
          key: id,
          label: name,
        }));
        break;
      }
      case 'driver': {
        const {
          data: { data },
        } = await getDrivers({
          name: params.search,
        });
        selectData = data.map(({ name, id }) => ({
          key: id,
          label: name,
        }));
        break;
      }
      case 'wareHouse': {
        const {
          data: {
            data: { data },
          },
        } = await getStoreHouseList({ size: 50, ...params });
        selectData = data.map(({ name, id }) => ({
          key: id,
          label: name,
        }));
        break;
      }
      case 'wareHouseWithCode': {
        const {
          data: {
            data: { data },
          },
        } = await getStoreHouseList(params);
        selectData = data.map(({ name, code }) => ({
          key: code,
          label: name,
        }));
        break;
      }
      case 'receiptCategory': {
        const {
          data: { data },
        } = await getReceiptCategory({ name: params.search, size: 50 });
        selectData = data.map(data => ({
          key: data.id,
          label: data.name,
          data,
        }));
        break;
      }
      case 'sendCategory': {
        const {
          data: { data },
        } = await getSendCategories({ name: params.search, size: 50 });
        selectData = data.map(data => ({
          key: data.id,
          label: data.name,
          data,
        }));
        break;
      }
      case 'qcConfig': {
        const {
          data: { data },
        } = await getQcConfigList({
          nameSearch: params.search,
          size: 50,
        });
        selectData = data.map(({ name, id }) => ({
          key: id,
          label: name,
        }));
        break;
      }
      case 'receiveDamageReason': {
        const {
          data: { data },
        } = await getReceiptDamageReason({
          description: params.search,
        });
        selectData = data.map(({ id, description }) => ({
          key: id,
          label: description,
        }));
        break;
      }
      case 'receiveTask': {
        const {
          data: { data },
        } = await getReceiveTaskList({
          taskId: params.search,
        });
        selectData = data.map(({ id }) => ({
          key: id,
          label: id,
        }));
        break;
      }
      case 'customer': {
        const {
          data: { data },
        } = await getCustomers({
          size: 50,
          search: params.search,
          ...params,
        });
        selectData = data.map(({ id, name, code }) => ({
          key: id,
          label: `${name}/${code || '无编号'}`,
        }));
        break;
      }
      case 'customerByCode': {
        const {
          data: { data },
        } = await getCustomers({
          size: 50,
          search: params.search,
          ...params,
        });
        selectData = data.map(({ name, code }) => ({
          key: code,
          label: `${name}/${code || '无编号'}`,
        }));
        break;
      }
      // case 'qcMembersOnWorkstation': {
      //   console.log('qcMembersOnWorkstation');
      //   const { data: { data } } = await queryQcMembersByWorkstation({
      //     workstationId: this.props.workstationId,
      //   });
      //   selectData = data.map(({ name, id }) => ({
      //     key: id,
      //     label: name,
      //   }));
      //   console.log({ selectData });
      //   break;
      // }
      case 'spareParts': {
        const {
          data: { data },
        } = await getSparePartsValidList({
          searchContent: params.search,
        });
        selectData = data.map(({ name, code }) => ({
          key: code,
          label: `${name}(编码${code})`,
        }));
        break;
      }
      case 'device': {
        const {
          data: { data },
        } = await getDevices({
          searchContent: params.search,
        });
        selectData = data.map(({ entity: { id, name, code } }) => ({
          key: id,
          label: `${name}(编号${code})`,
        }));
        break;
      }
      case 'projectFinishReason': {
        const {
          data: { data },
        } = await getProjectFinishReasonList({
          name: params.search,
          ...params,
        });
        selectData = data.map(({ name, id }) => ({ label: name, key: id }));
        break;
      }
      // 供应商列表
      case 'metric': {
        const {
          data: { data },
        } = await getMetricList({
          searchCategoryType: _params.searchCategoryType,
          searchContent: params.search,
        });
        selectData = data.map(({ id, metricName, metricUnitName }) => ({
          key: `${id}/${metricUnitName}`,
          label: metricName,
        }));
        break;
      }
      case 'supplier': {
        const {
          data: { data },
        } = await getProviderList({
          search: params.search,
          ...params,
        });
        selectData = data.map(({ name, code }) => ({
          key: code,
          label: `${code}/${name}`,
        }));
        break;
      }
      // 计划工单列表
      case 'plannedTicketList': {
        const {
          data: { data },
        } = await queryPlannedTicketList({
          workOrderCode: params.search,
          ...params,
        });
        if (converter) {
          selectData = converter(data);
        } else {
          selectData = data.map(({ code }) => ({
            key: code,
            label: code,
          }));
        }
        break;
      }
      // 模糊匹配所有计划工单
      case 'workOrderListAllLike': {
        const search = _.get(params, 'search', '');
        const p = { code: search, ...params };
        const {
          data: { data },
        } = await queryWorkOrderListAllLike(p);
        if (converter) {
          selectData = converter(data);
        } else {
          selectData = data.map(({ code }) => ({
            key: code,
            label: code,
          }));
        }
        break;
      }
      // 工装备件类
      case 'machiningMaterial': {
        const {
          data: { data },
        } = await getMachiningMaterial({
          searchContent: params.search,
          ...params,
        });
        selectData = data.map(data => ({
          key: data.code,
          label: `${data.code}/${data.name}`,
          data,
        }));
        break;
      }
      // 工装
      case 'tooling': {
        const {
          data: { data },
        } = await getToolingList({
          searchName: params.search,
          ...params,
        });
        selectData = data.map(data => ({
          key: data.code,
          label: `${data.code}/${data.name}`,
        }));
        break;
      }
      // 不良原因
      case 'qcDefectReasonList': {
        const {
          data: { data },
        } = await getQcDefectReasonList({
          searchName: params.search,
          ...params,
        });
        selectData = data.map(({ id, name }) => ({
          key: id,
          label: name,
        }));
        break;
      }
      // 质检计划
      case 'qcPlan': {
        const {
          data: { data },
        } = await queryQcPlanList({
          qcPlanCode: params.search,
          ...params,
        });
        selectData = data.map(({ code }) => ({
          key: code,
          label: code,
        }));
        break;
      }
      // 电子批记录模板
      case 'batchTemplate': {
        const {
          data: { data },
        } = await getBatchTemplateList({
          templateName: params.search,
          page: 1,
          size: 50,
        });
        selectData = data.map(({ templateName, templateUrl, id }) => ({
          key: id,
          label: `${templateName}/${templateUrl}`,
        }));
        break;
      }
      // sop template
      case 'sopTemplate': {
        const data = await sopTemplateList({
          code: params.search,
          page: 1,
          size: 50,
        });
        selectData = data.data.data.map(({ code, id }) => ({
          key: id,
          label: code,
        }));
        break;
      }
      // 任务优先级标记
      case 'taskPriority': {
        selectData = [
          {
            key: null,
            label: '无',
          },
          {
            key: 1,
            label: '优先',
          },
        ];
        break;
      }
      // 停机类型
      case 'downtimeCauses': {
        const {
          data: { data },
        } = await getDowntimeCauseType({
          size: 50,
          page: 1,
          search: params.search,
        });
        selectData = data.map(({ id, name }) => ({ key: id, label: name }));
        selectData = [
          {
            label: (
              <Link
                onClick={() => {
                  OpenModal(
                    {
                      title: '新建停机类型',
                      children: <CreateDowntimeCausesType />,
                      footer: null,
                    },
                    this.context,
                  );
                }}
              >
                新建停机类型
              </Link>
            ),
            key: 'new',
            disabled: true,
          },
          ...selectData,
        ];
        break;
      }
      default:
        if (!extraSearch) {
          throw Error('type不能为空');
        }
    }

    if (typeof handleData === 'function') {
      selectData = handleData(selectData);
    }
    if (fetchId !== this.lastFetchId) {
      return;
    }
    this.setState({
      data: selectData || [],
      fetching: false,
    });
  };

  render() {
    const { data, fetching } = this.state;
    const {
      onBlur,
      onFocus,
      renderOption,
      style,
      createButton,
      onSelect,
      disabled,
      useTooltipOption,
      clearOnFocus,
      intl,
      placeholder,
      ...rest
    } = this.props;
    const innerStyle = { width: 120, ...style };
    const notFoundContent = fetching ? <Spin size="small" /> : <FormattedMessage defaultMessage={'暂无数据'} />;

    const onInnerSelect = (value, option) => {
      if (typeof onSelect === 'function') {
        onSelect(value, option);
      }
    };

    const onInnerFocus = () => {
      if (clearOnFocus) {
        this.setState({ data: [] });
      }
      this.handleSearch();
      if (typeof onFocus === 'function') {
        onFocus();
      }
    };

    const onInnerBlur = (data, option) => {
      this.setState({ data: [] });
      if (typeof onBlur === 'function') {
        onBlur(data, option);
      }
    };

    return (
      <Select
        allowClear
        disabled={disabled}
        labelInValue
        placeholder={changeChineseToLocale(placeholder || '请选择', intl)}
        onSearch={this.handleSearch}
        onSelect={onInnerSelect}
        style={innerStyle}
        filterOption={false}
        notFoundContent={notFoundContent}
        onFocus={onInnerFocus}
        onBlur={onInnerBlur}
        {...rest}
      >
        {createButton}
        {data.map(params => {
          const { key, label, ...rest } = params || {};

          if (typeof renderOption === 'function') return renderOption(params);
          return (
            <Option key={`key-${key}`} value={key} title={typeof label === 'string' && label} {...rest}>
              {label}
            </Option>
          );
        })}
      </Select>
    );
  }
}

export default injectIntl(SearchSelect);
