import React from 'react';
import Loadable from 'react-loadable';
import { Redirect } from 'react-router-dom';
import { loading } from 'src/components';

import {
  QcItemsList,
  CreateQcItem,
  QcItemDetail,
  EditQcItem,
  QcItemsImportLog,
  QcItemOperationLog,
  QcItemsImportDetail,
} from 'src/views/qualityManagement/qcItems';
import { getCustomLanguage } from 'src/utils/customLanguage';
import AreaDefineRoute from './factoryModeling/areaDefine';
import WorkshopRoute from './factoryModeling/workshop';
import ProdLineRoute from './factoryModeling/prodLine';
import WorkstationRoute from './factoryModeling/workstation';

const customLanguage = getCustomLanguage();

const FilterForStoreHouseListLoadable = Loadable({
  loader: () => import('./storeHouseModeling/storeHouse/filter'),
  loading,
});
const StoreHouseListLoadable = Loadable({ loader: () => import('./storeHouseModeling/storeHouse/list'), loading });

const FilterForRelatedStorageListLoadable = Loadable({
  loader: () => import('./storeHouseModeling/relatedStorage/filter'),
  loading,
});
const RelatedStorageListLoadable = Loadable({
  loader: () => import('./storeHouseModeling/relatedStorage/list'),
  loading,
});

// 这么写的原因：https://github.com/gaearon/react-hot-loader/issues/1270
const NestSpecList = Loadable({ loader: () => import('./nestSpec/list/index'), loading });
const NestSpecCreate = Loadable({ loader: () => import('./nestSpec/create'), loading });
const NestSpecEdit = Loadable({ loader: () => import('./nestSpec/edit'), loading });
const NestSpecDetail = Loadable({ loader: () => import('./nestSpec/detail'), loading });

const router = [
  {
    path: '/knowledgeManagement',
    breadcrumbName: '知识引擎',
    render: () => <Redirect to="/knowledgeManagement/customers" />,
    routes: [
      {
        path: '/knowledgeManagement/customers',
        breadcrumbName: '客户',
        component: Loadable({ loader: () => import('./customers/list/customersList'), loading }),
      },
      {
        path: '/knowledgeManagement/units',
        breadcrumbName: '单位',
        component: Loadable({ loader: () => import('./units/list/unitsList'), loading }),
      },
      {
        path: '/knowledgeManagement/downtimeCauses',
        breadcrumbName: '停机原因',
        component: Loadable({
          loader: () => import('./factoryModeling/downTimeCauses/list/downTimeCausesList'),
          loading,
        }),
      },
      {
        path: '/knowledgeManagement/provider',
        breadcrumbName: '供应商',
        component: Loadable({ loader: () => import('./provider/list'), loading }),
        routes: [
          {
            path: '/knowledgeManagement/provider/create',
            breadcrumbName: '创建供应商',
            component: Loadable({ loader: () => import('./provider/create'), loading }),
          },
          {
            path: '/knowledgeManagement/provider/:code/edit',
            breadcrumbName: '编辑供应商',
            component: Loadable({ loader: () => import('./provider/edit'), loading }),
          },
        ],
      },
      {
        path: '/knowledgeManagement/qrCodeAdjustReason',
        breadcrumbName: '仓储事务配置',
        component: Loadable({ loader: () => import('./qrCodeAdjustReason/list'), loading }),
      },
      {
        path: '/knowledgeManagement/finish-cause',
        breadcrumbName: '项目结束原因',
        component: Loadable({ loader: () => import('./factoryModeling/FinishCause'), loading }),
      },
      {
        path: '/knowledgeManagement/produceTaskDelayReason',
        breadcrumbName: '生产任务延期原因',
        component: Loadable({ loader: () => import('./factoryModeling/produceTaskDelayReason'), loading }),
      },
      {
        path: '/knowledgeManagement/purchaseOrderFinishReason',
        breadcrumbName: '销售订单结束原因',
        component: Loadable({ loader: () => import('./factoryModeling/purchaseOrderFinishReason'), loading }),
      },
      {
        path: '/knowledgeManagement/defectCategory',
        breadcrumbName: '次品分类',
        component: Loadable({ loader: () => import('./defectCategory/list/index'), loading }),
      },
      {
        path: '/knowledgeManagement/defects',
        breadcrumbName: '次品项',
        component: Loadable({ loader: () => import('./defects/list/defectsList'), loading }),
        routes: [
          {
            path: '/knowledgeManagement/defects/importLog',
            breadcrumbName: '查看导入日志',
            component: Loadable({ loader: () => import('./defects/importLog/list/index'), loading }),
            routes: [
              {
                path: '/knowledgeManagement/defects/importLog/detail/:id',
                breadcrumbName: '日志详情',
                component: Loadable({ loader: () => import('./defects/importLog/detail/index'), loading }),
              },
            ],
          },
        ],
      },
      AreaDefineRoute,
      WorkshopRoute,
      ProdLineRoute,
      WorkstationRoute,
      {
        path: '/knowledgeManagement/qcConfigs',
        breadcrumbName: '质检方案',
        component: Loadable({ loader: () => import('src/views/qualityManagement/qcConfigs/list'), loading }),
        routes: [
          {
            path: '/knowledgeManagement/qcConfigs/importLog',
            breadcrumbName: '查看导入日志',
            component: Loadable({
              loader: () => import('src/views/qualityManagement/qcConfigs/list/import/importLog'),
              loading,
            }),
            routes: [
              {
                path: '/knowledgeManagement/qcConfigs/importLog/logdetail',
                breadcrumbName: '日志详情',
                component: Loadable({
                  loader: () => import('src/views/qualityManagement/qcConfigs/list/import/importLogDetail'),
                  loading,
                }),
              },
            ],
          },
          {
            path: '/knowledgeManagement/qcConfigs/:id/detail',
            breadcrumbName: '质检方案详情',
            component: Loadable({ loader: () => import('src/views/qualityManagement/qcConfigs/detail'), loading }),
            routes: [
              {
                path: '/knowledgeManagement/qcConfigs/:id/detail/operationLog',
                breadcrumbName: '操作记录',
                component: Loadable({
                  loader: () =>
                    import('src/views/qualityManagement/qcConfigs/operationHistory/qcConfigOperationHistory'),
                  loading,
                }),
              },
            ],
          },
          {
            path: '/knowledgeManagement/qcConfigs/create',
            breadcrumbName: '创建质检方案',
            component: Loadable({
              loader: () => import('src/views/qualityManagement/qcConfigs/create/createQcConfig'),
              loading,
            }),
          },
          {
            path: '/knowledgeManagement/qcConfigs/:id/edit',
            breadcrumbName: '编辑质检方案',
            component: Loadable({
              loader: () => import('src/views/qualityManagement/qcConfigs/edit/editQcConfig'),
              loading,
            }),
          },
          {
            path: '/knowledgeManagement/qcConfigs/:id/copy',
            breadcrumbName: '复制质检方案',
            component: Loadable({
              loader: () => import('src/views/qualityManagement/qcConfigs/copy/copyQcConfig'),
              loading,
            }),
          },
        ],
      },
      {
        path: '/knowledgeManagement/qcDefectRank',
        breadcrumbName: '不良等级',
        component: Loadable({ loader: () => import('src/views/qualityManagement/qcDefectRank'), loading }),
        routes: [
          {
            path: '/knowledgeManagement/qcDefectRank/importLog',
            breadcrumbName: '查看导入日志',
            component: Loadable({
              loader: () => import('src/views/qualityManagement/qcDefectRank/import/importLog'),
              loading,
            }),
            routes: [
              {
                path: '/knowledgeManagement/qcDefectRank/importLog/detail',
                breadcrumbName: '日志详情',
                component: Loadable({
                  loader: () => import('src/views/qualityManagement/qcDefectRank/import/importLogDetail'),
                  loading,
                }),
              },
            ],
          },
        ],
      },
      {
        path: '/knowledgeManagement/qcDefectReason',
        breadcrumbName: '不良原因字典',
        component: Loadable({ loader: () => import('src/views/qualityManagement/qcDefectReason'), loading }),
        routes: [
          {
            path: '/knowledgeManagement/qcDefectReason/importLog',
            breadcrumbName: '查看导入日志',
            component: Loadable({
              loader: () => import('src/views/qualityManagement/qcDefectReason/import/importLog'),
              loading,
            }),
            routes: [
              {
                path: '/knowledgeManagement/qcDefectReason/importLog/detail',
                breadcrumbName: '日志详情',
                component: Loadable({
                  loader: () => import('src/views/qualityManagement/qcDefectReason/import/importLogDetail'),
                  loading,
                }),
              },
            ],
          },
        ],
      },
      {
        path: '/knowledgeManagement/qcItems',
        breadcrumbName: '质检项',
        component: QcItemsList,
        routes: [
          {
            path: '/knowledgeManagement/qcItems/copy/:id',
            breadcrumbName: '创建质检项',
            component: CreateQcItem,
          },
          {
            path: '/knowledgeManagement/qcItems/create',
            breadcrumbName: '创建质检项',
            component: CreateQcItem,
          },
          {
            path: '/knowledgeManagement/qcItems/importLog',
            breadcrumbName: '查看导入日志',
            component: QcItemsImportLog,
            routes: [
              {
                path: '/knowledgeManagement/qcItems/importLog/logdetail',
                breadcrumbName: '日志详情',
                component: QcItemsImportDetail,
              },
            ],
          },
          {
            path: '/knowledgeManagement/qcItems/edit/:id',
            breadcrumbName: '编辑质检项',
            component: EditQcItem,
          },
          {
            path: '/knowledgeManagement/qcItems/detail/:id',
            breadcrumbName: '质检项详情',
            component: QcItemDetail,
            routes: [
              {
                path: '/knowledgeManagement/qcItems/detail/:id/operationLog',
                breadcrumbName: '操作记录',
                component: QcItemOperationLog,
              },
            ],
          },
        ],
      },
      {
        path: '/knowledgeManagement/qcItemsGroup',
        breadcrumbName: '质检项分类',
        component: Loadable({ loader: () => import('src/views/qualityManagement/qcItemsGroup/list'), loading }),
      },
      {
        path: '/knowledgeManagement/AQL',
        breadcrumbName: 'AQL',
        component: Loadable({ loader: () => import('src/views/qualityManagement/aql'), loading }),
      },
      {
        path: '/knowledgeManagement/preparationTime',
        breadcrumbName: '动态准备时间',
        component: Loadable({ loader: () => import('./preparationTime/list'), loading }),
      },
      {
        path: '/knowledgeManagement/productivityStandards',
        breadcrumbName: '标准产能',
        component: Loadable({ loader: () => import('./productivityStandard/list'), loading }),
        routes: [
          {
            path: '/knowledgeManagement/productivityStandards/create',
            breadcrumbName: '新建标准产能',
            component: Loadable({ loader: () => import('./productivityStandard/create'), loading }),
          },
          {
            path: '/knowledgeManagement/productivityStandards/:code/edit',
            breadcrumbName: '编辑标准产能',
            component: Loadable({ loader: () => import('./productivityStandard/edit'), loading }),
          },
          {
            path: '/knowledgeManagement/productivityStandards/import-list',
            breadcrumbName: '标准产能导入日志',
            component: Loadable({ loader: () => import('./productivityStandard/ImportList'), loading }),
            routes: [
              {
                path: '/knowledgeManagement/productivityStandards/import-list/:id',
                breadcrumbName: '导入日志详情',
                component: Loadable({ loader: () => import('./productivityStandard/ImportDetail'), loading }),
              },
            ],
          },
          {
            path: '/knowledgeManagement/productivityStandards/:code/detail',
            breadcrumbName: '标准产能详情',
            component: Loadable({ loader: () => import('./productivityStandard/detail'), loading }),
            routes: [
              {
                path: '/knowledgeManagement/productivityStandards/:code/detail/operationHistory',
                breadcrumbName: '操作历史记录',
                component: Loadable({ loader: () => import('./productivityStandard/operationHistory'), loading }),
              },
            ],
          },
        ],
      },
      {
        path: '/knowledgeManagement/capacityConstraint',
        breadcrumbName: '产能约束',
        component: Loadable({ loader: () => import('./capacityConstraint/list'), loading }),
        routes: [
          {
            path: '/knowledgeManagement/capacityConstraint/create',
            breadcrumbName: '创建产能约束',
            component: Loadable({ loader: () => import('./capacityConstraint/create'), loading }),
          },
          {
            path: '/knowledgeManagement/capacityConstraint/:id/edit',
            breadcrumbName: '编辑产能约束',
            component: Loadable({ loader: () => import('./capacityConstraint/edit'), loading }),
          },
        ],
      },
      {
        path: '/knowledgeManagement/workingTime',
        breadcrumbName: '工作时间',
        component: Loadable({ loader: () => import('./workingTime/list'), loading }),
        routes: [
          {
            path: '/knowledgeManagement/workingTime/create',
            breadcrumbName: '创建工作时间',
            component: Loadable({ loader: () => import('./workingTime/create'), loading }),
          },
          {
            path: '/knowledgeManagement/workingTime/:id/detail',
            breadcrumbName: '工作时间详情',
            component: Loadable({ loader: () => import('./workingTime/detail'), loading }),
            routes: [
              {
                path: '/knowledgeManagement/workingTime/:id/detail/operationHistory',
                breadcrumbName: '操作记录',
                component: Loadable({ loader: () => import('./workingTime/operationHistory'), loading }),
              },
            ],
          },
        ],
      },
      {
        path: '/knowledgeManagement/workingCalendar',
        breadcrumbName: '生产日历',
        component: Loadable({ loader: () => import('./workingCalendar/list'), loading }),
        routes: [
          {
            path: '/knowledgeManagement/workingCalendar/create',
            breadcrumbName: '创建生产日历',
            component: Loadable({ loader: () => import('./workingCalendar/create'), loading }),
          },
          {
            path: '/knowledgeManagement/workingCalendar/:id/edit',
            breadcrumbName: '编辑生产日历',
            component: Loadable({ loader: () => import('./workingCalendar/edit'), loading }),
          },
          {
            path: '/knowledgeManagement/workingCalendar/:id/detail',
            breadcrumbName: '生产日历详情',
            component: Loadable({ loader: () => import('./workingCalendar/detail'), loading }),
            routes: [
              {
                path: '/knowledgeManagement/workingCalendar/:id/detail/operationHistory',
                breadcrumbName: '操作记录',
                component: Loadable({ loader: () => import('./workingCalendar/operationHistory'), loading }),
              },
            ],
          },
        ],
      },
      {
        path: '/knowledgeManagement/storeHouse',
        breadcrumbName: '仓库定义',
        render: props => (
          <FilterForStoreHouseListLoadable>
            <StoreHouseListLoadable {...props} />
          </FilterForStoreHouseListLoadable>
        ),
        routes: [
          {
            path: '/knowledgeManagement/storeHouse/create',
            breadcrumbName: '创建仓库',
            component: Loadable({ loader: () => import('src/containers/storeHouse/create'), loading }),
          },
          {
            path: '/knowledgeManagement/storeHouse/edit',
            breadcrumbName: '编辑仓库',
            component: Loadable({ loader: () => import('src/containers/storeHouse/edit'), loading }),
          },
          {
            path: '/knowledgeManagement/storeHouse/:code/detail',
            breadcrumbName: '仓库详情',
            component: Loadable({
              loader: () => import('src/views/knowledgeManagement/storeHouseModeling/storeHouse/detail/index'),
              loading,
            }),
          },
          {
            path: '/knowledgeManagement/storeHouse/record/:code',
            breadcrumbName: '操作记录',
            component: Loadable({ loader: () => import('src/containers/storeHouse/record'), loading }),
          },
        ],
      },
      {
        path: '/knowledgeManagement/storage',
        breadcrumbName: '仓位定义',
        component: Loadable({ loader: () => import('./storeHouseModeling/storage'), loading }),
        routes: [
          {
            path: '/knowledgeManagement/storage/create',
            breadcrumbName: '创建仓位',
            component: Loadable({ loader: () => import('src/containers/storage/create'), loading }),
          },
          {
            path: '/knowledgeManagement/storage/edit',
            breadcrumbName: '编辑仓位',
            component: Loadable({ loader: () => import('src/containers/storage/edit'), loading }),
          },
          {
            path: '/knowledgeManagement/storage/record/:code',
            breadcrumbName: '操作记录',
            component: Loadable({ loader: () => import('src/containers/storage/record'), loading }),
          },
          {
            path: '/knowledgeManagement/storage/importLogs',
            breadcrumbName: '导入日志',
            component: Loadable({ loader: () => import('./storeHouseModeling/storage/importLog'), loading }),
            routes: [
              {
                path: '/knowledgeManagement/storage/importLogs/:importId',
                breadcrumbName: '日志详情',
                component: Loadable({ loader: () => import('./storeHouseModeling/storage/logDetail'), loading }),
              },
            ],
          },
        ],
      },
      {
        path: '/knowledgeManagement/relatedStorage',
        breadcrumbName: '关联仓位',
        render: props => (
          <FilterForRelatedStorageListLoadable>
            <RelatedStorageListLoadable {...props} />
          </FilterForRelatedStorageListLoadable>
        ),
      },
      {
        path: '/knowledgeManagement/spareParts',
        breadcrumbName: '备件定义',
        component: Loadable({ loader: () => import('./equipmentModeling/spareParts'), loading }),
        routes: [
          {
            path: '/knowledgeManagement/spareParts/importLog',
            breadcrumbName: '导入日志',
            component: Loadable({ loader: () => import('src/containers/spareParts/importHistory'), loading }),
            routes: [
              {
                path: '/knowledgeManagement/spareParts/importLog/detail/:id',
                breadcrumbName: '日志详情',
                component: Loadable({ loader: () => import('src/containers/spareParts/importDetail'), loading }),
              },
            ],
          },
          {
            path: '/knowledgeManagement/spareParts/create',
            breadcrumbName: '创建备件',
            component: Loadable({ loader: () => import('src/containers/spareParts/create'), loading }),
          },
          {
            path: '/knowledgeManagement/spareParts/edit',
            breadcrumbName: '编辑备件',
            component: Loadable({ loader: () => import('src/containers/spareParts/edit'), loading }),
          },
        ],
      },
      {
        path: '/knowledgeManagement/equipmentType',
        breadcrumbName: '设备类型',
        component: Loadable({
          loader: () => import('./equipmentModeling/equipmentType/list/equipmentTypeList'),
          loading,
        }),
        routes: [
          {
            path: '/knowledgeManagement/equipmentType/create',
            breadcrumbName: '创建设备类型',
            component: Loadable({
              loader: () => import('./equipmentModeling/equipmentType/create/createEquipmentType'),
              loading,
            }),
          },
          {
            path: '/knowledgeManagement/equipmentType/:id/detail',
            breadcrumbName: '设备类型详情',
            component: Loadable({
              loader: () => import('./equipmentModeling/equipmentType/detail/equipmentTypeDetail'),
              loading,
            }),
          },
          {
            path: '/knowledgeManagement/equipmentType/:id/edit',
            breadcrumbName: '编辑设备类型',
            component: Loadable({
              loader: () => import('./equipmentModeling/equipmentType/edit/editEquipmentType'),
              loading,
            }),
          },
        ],
      },
      {
        path: '/knowledgeManagement/machiningMaterial',
        breadcrumbName: customLanguage.equipment_machining_material,
        component: Loadable({ loader: () => import('./equipmentModeling/machiningMaterial'), loading }),
        routes: [
          {
            path: '/knowledgeManagement/machiningMaterial/create',
            breadcrumbName: `创建${customLanguage.equipment_machining_material}`,
            component: Loadable({ loader: () => import('./equipmentModeling/machiningMaterial/create'), loading }),
          },
          {
            path: '/knowledgeManagement/machiningMaterial/:code/detail',
            breadcrumbName: `${customLanguage.equipment_machining_material}详情`,
            component: Loadable({ loader: () => import('./equipmentModeling/machiningMaterial/detail'), loading }),
          },
          {
            path: '/knowledgeManagement/moldType/create',
            breadcrumbName: '创建模具类型',
            component: Loadable({
              loader: () => import('./equipmentModeling/moldType/create/createMoldType'),
              loading,
            }),
          },
          {
            path: '/knowledgeManagement/moldType/:id/detail',
            breadcrumbName: '模具类型详情',
            component: Loadable({
              loader: () => import('./equipmentModeling/moldType/detail/moldTypeDetail'),
              loading,
            }),
          },
          {
            path: '/knowledgeManagement/machiningMaterial/:code/edit',
            breadcrumbName: `编辑${customLanguage.equipment_machining_material}`,
            component: Loadable({ loader: () => import('./equipmentModeling/machiningMaterial/edit'), loading }),
          },
          {
            path: '/knowledgeManagement/machiningMaterial/importLog',
            breadcrumbName: '导入日志',
            component: Loadable({ loader: () => import('./equipmentModeling/machiningMaterial/importLog'), loading }),
            routes: [
              {
                path: '/knowledgeManagement/machiningMaterial/importLog/:id/detail',
                breadcrumbName: '日志详情',
                component: Loadable({
                  loader: () => import('./equipmentModeling/machiningMaterial/importDetail'),
                  loading,
                }),
              },
            ],
          },
        ],
      },
      {
        path: '/knowledgeManagement/faultCauses',
        breadcrumbName: '故障原因',
        component: Loadable({ loader: () => import('./equipmentModeling/faultCauses/list/faultCausesList'), loading }),
      },
      {
        path: '/knowledgeManagement/maintainStrategy',
        breadcrumbName: '维护策略组',
        component: Loadable({ loader: () => import('./equipmentModeling/maintainStrategy/list'), loading }),
      },
      {
        path: '/knowledgeManagement/metric',
        breadcrumbName: '读数定义',
        component: Loadable({ loader: () => import('./equipmentModeling/metric/list'), loading }),
      },
      {
        path: '/knowledgeManagement/reportTemplate',
        breadcrumbName: '报告模板',
        component: Loadable({
          loader: () => import('./equipmentModeling/reportTemplate/list/reportTemplateList'),
          loading,
        }),
        routes: [
          {
            path: '/knowledgeManagement/reportTemplate/create',
            breadcrumbName: '创建报告模板',
            component: Loadable({
              loader: () => import('./equipmentModeling/reportTemplate/create/createReportTemplate'),
              loading,
            }),
          },
          {
            path: '/knowledgeManagement/reportTemplate/:id/edit',
            breadcrumbName: '编辑报告模板',
            component: Loadable({
              loader: () => import('./equipmentModeling/reportTemplate/edit/editReportTemplate'),
              loading,
            }),
          },
        ],
      },
      {
        path: '/knowledgeManagement/equipmentManufacturer',
        breadcrumbName: '设备制造商',
        component: Loadable({
          loader: () => import('./equipmentModeling/equipmentManufacturer/list/equipmentManufacturerList'),
          loading,
        }),
        routes: [
          {
            path: '/knowledgeManagement/equipmentManufacturer/create',
            breadcrumbName: '创建设备制造商',
            component: Loadable({
              loader: () => import('./equipmentModeling/equipmentManufacturer/create/createEquipmentManufacturer'),
              loading,
            }),
          },
          {
            path: '/knowledgeManagement/equipmentManufacturer/:id/edit',
            breadcrumbName: '编辑设备制造商',
            component: Loadable({
              loader: () => import('./equipmentModeling/equipmentManufacturer/edit/editEquipmentManufacturer'),
              loading,
            }),
          },
          {
            path: '/knowledgeManagement/equipmentManufacturer/:id/detail',
            breadcrumbName: '设备制造商详情',
            component: Loadable({
              loader: () => import('./equipmentModeling/equipmentManufacturer/detail/equipmentManufacturerDetail'),
              loading,
            }),
          },
        ],
      },
      {
        path: '/knowledgeManagement/typeDefinition',
        breadcrumbName: '异常类型定义',
        component: Loadable({ loader: () => import('./exceptionalEvent/typeDefinitionList'), loading }),
      },
      {
        path: '/knowledgeManagement/handleLabel',
        breadcrumbName: '异常处理标签',
        component: Loadable({ loader: () => import('./exceptionalEvent/handleLabelList'), loading }),
      },
      {
        path: '/knowledgeManagement/subjectDefinition',
        breadcrumbName: '异常主题定义',
        component: Loadable({ loader: () => import('./exceptionalEvent/subjectDefinitionList'), loading }),
      },
      {
        path: '/knowledgeManagement/subscribeManage',
        breadcrumbName: '异常订阅管理',
        component: Loadable({ loader: () => import('./exceptionalEvent/subscribeManageList'), loading }),
      },
      {
        path: '/knowledgeManagement/documents',
        breadcrumbName: '文档列表',
        component: Loadable({ loader: () => import('./documentManagement/documents/documentList'), loading }),
        routes: [
          {
            path: '/knowledgeManagement/documents/create',
            breadcrumbName: '创建文件',
            component: Loadable({ loader: () => import('./documentManagement/documents/createDocument'), loading }),
          },
          {
            path: '/knowledgeManagement/documents/:id/detail',
            breadcrumbName: '文件详情',
            component: Loadable({ loader: () => import('./documentManagement/documents/documentDetail'), loading }),
          },
          {
            path: '/knowledgeManagement/documents/:id/edit',
            breadcrumbName: '编辑文件',
            component: Loadable({ loader: () => import('./documentManagement/documents/editDocument'), loading }),
          },
          {
            path: '/knowledgeManagement/documents/:id/changeVersion',
            breadcrumbName: '更新版本',
            component: Loadable({ loader: () => import('./documentManagement/documents/changeVersionForm'), loading }),
          },
        ],
      },
      {
        path: '/knowledgeManagement/folders',
        breadcrumbName: '文件夹',
        component: Loadable({ loader: () => import('./documentManagement/folders/folderList'), loading }),
        routes: [
          {
            path: '/knowledgeManagement/folders/create',
            breadcrumbName: '创建文件夹',
            component: Loadable({ loader: () => import('./documentManagement/folders/createFolder'), loading }),
          },
          {
            path: '/knowledgeManagement/folders/:id/edit',
            breadcrumbName: '编辑文件夹',
            component: Loadable({ loader: () => import('./documentManagement/folders/editFolder'), loading }),
          },
        ],
      },
      {
        path: '/knowledgeManagement/e-signature',
        breadcrumbName: '电子签名配置',
        component: Loadable({ loader: () => import('./factoryModeling/e-signature/list'), loading }),
      },
      {
        path: '/knowledgeManagement/sop',
        routes: [
          {
            path: '/knowledgeManagement/sop',
            breadcrumbName: 'SOP',
            component: Loadable({ loader: () => import('./flowEngine/sop/SOPList'), loading }),
            routes: [
              {
                path: '/knowledgeManagement/sop/create',
                breadcrumbName: '创建SOP',
                component: Loadable({ loader: () => import('./flowEngine/sop/CreateSOP'), loading }),
              },
              {
                path: '/knowledgeManagement/sop/edit-sop-step/:id',
                breadcrumbName: '编辑SOP步骤',
                component: Loadable({ loader: () => import('./flowEngine/sop/SOPStepBase'), loading }),
              },
              {
                path: '/knowledgeManagement/sop/detail/:SOPId',
                breadcrumbName: 'SOP详情',
                component: Loadable({ loader: () => import('./flowEngine/sop/SopDetail'), loading }),
                routes: [
                  {
                    path: '/knowledgeManagement/sop/detail/:SOPId/log',
                    breadcrumbName: '查看操作日志',
                    component: Loadable({ loader: () => import('./flowEngine/sop/SOPLog'), loading }),
                  },
                ],
              },
              {
                path: '/knowledgeManagement/sop/edit/:id',
                breadcrumbName: '编辑SOP详情',
                component: Loadable({ loader: () => import('./flowEngine/sop/EditSOP'), loading }),
              },
            ],
          },
          {
            path: '/knowledgeManagement/sop-template',
            breadcrumbName: 'SOP模板',
            component: Loadable({ loader: () => import('./flowEngine/sopTemplate/SOPTemplateList'), loading }),
            routes: [
              {
                path: '/knowledgeManagement/sop-template/create',
                breadcrumbName: '创建SOP模板',
                component: Loadable({ loader: () => import('./flowEngine/sopTemplate/SOPTemplateCreate'), loading }),
              },
              {
                path: '/knowledgeManagement/sop-template/edit/:id',
                breadcrumbName: '编辑SOP模板详情',
                component: Loadable({ loader: () => import('./flowEngine/sopTemplate/SOPTemplateEdit'), loading }),
              },
              {
                path: '/knowledgeManagement/sop-template/step/:id',
                breadcrumbName: '编辑SOP模板步骤',
                component: Loadable({ loader: () => import('./flowEngine/sopTemplate/SOPTemplateStep'), loading }),
              },
              {
                path: '/knowledgeManagement/sop-template/detail/:SOPId',
                breadcrumbName: 'SOP模板详情',
                component: Loadable({ loader: () => import('./flowEngine/sopTemplate/SOPTemplateDetail'), loading }),
                routes: [
                  {
                    path: '/knowledgeManagement/sop-template/detail/:SOPId/log',
                    breadcrumbName: 'SOP模板操作记录',
                    component: Loadable({ loader: () => import('./flowEngine/sopTemplate/SOPTemplateLog'), loading }),
                  },
                  {
                    path: '/knowledgeManagement/sop-template/detail/:SOPId/batch-create',
                    breadcrumbName: '批量创建SOP',
                    component: Loadable({ loader: () => import('./flowEngine/sopTemplate/BatchCreateSOP'), loading }),
                  },
                  {
                    path: '/knowledgeManagement/sop/detail/:SOPId/log',
                    breadcrumbName: '查看操作日志',
                    component: Loadable({ loader: () => import('./flowEngine/sop/SOPLog'), loading }),
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        path: '/knowledgeManagement/moveTransactions',
        breadcrumbName: '移动事务',
        component: Loadable({ loader: () => import('./factoryModeling/moveTransactions'), loading }),
        routes: [
          {
            path: '/knowledgeManagement/moveTransactions/create',
            breadcrumbName: '创建移动事务',
            component: Loadable({ loader: () => import('./factoryModeling/moveTransactions/create'), loading }),
          },
          {
            path: '/knowledgeManagement/moveTransactions/edit',
            breadcrumbName: '编辑移动事务',
            component: Loadable({ loader: () => import('./factoryModeling/moveTransactions/edit'), loading }),
          },
          {
            path: '/knowledgeManagement/moveTransactions/detail',
            breadcrumbName: '移动事务详情',
            component: Loadable({ loader: () => import('./factoryModeling/moveTransactions/detail'), loading }),
          },
        ],
      },
      {
        path: '/knowledgeManagement/nestSpec',
        breadcrumbName: '嵌套规格定义',
        component: NestSpecList,
        routes: [
          {
            path: '/knowledgeManagement/nestSpec/create',
            breadcrumbName: '创建嵌套规格定义',
            component: NestSpecCreate,
          },
          {
            path: '/knowledgeManagement/nestSpec/:id/edit',
            breadcrumbName: '编辑嵌套规格定义',
            component: NestSpecEdit,
          },
          {
            path: '/knowledgeManagement/nestSpec/:id/detail',
            breadcrumbName: '嵌套规格定义详情',
            component: NestSpecDetail,
          },
        ],
      },
      {
        path: '/knowledgeManagement/batch-template',
        breadcrumbName: '电子批记录',
        component: Loadable({ loader: () => import('./batchTemplate/list'), loading }),
        routes: [
          {
            path: '/knowledgeManagement/batch-template/create',
            breadcrumbName: '创建电子批记录',
            component: Loadable({ loader: () => import('./batchTemplate/create'), loading }),
          },
          {
            path: '/knowledgeManagement/batch-template/edit/:id',
            breadcrumbName: '编辑电子批记录',
            component: Loadable({ loader: () => import('./batchTemplate/edit'), loading }),
          },
        ],
      },
    ],
  },
];

export default router;
