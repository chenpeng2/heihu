import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import { Icon, Link, OpenImportModal, Button, FormattedMessage } from 'src/components';
import { keysToObj } from 'src/utils/parseFile';
import { importMaterials } from 'src/services/bom/material';
import { getMaterialCheckDateConfig } from 'src/utils/organizationConfig';

const getTemplateUrl = () => {
  // 有物料审核日期配置和没有使用不同的模版
  return 'https://public-template.s3.cn-northwest-1.amazonaws.com.cn/v20190911/%E7%89%A9%E6%96%99%E5%AF%BC%E5%85%A5%E6%A8%A1%E6%9D%BF+V3.9.11.xlsx';
};

const ImportMaterial = (props, context) => {
  return (
    <Button
      icon="download"
      ghost
      style={{ marginRight: '20px' }}
      onClick={() => {
        OpenImportModal({
          item: '物料',
          fileTypes: ['.xlsx'],
          context,
          method: importMaterials,
          listName: 'materials',
          logUrl: '/bom/materials/logs/import',
          templateUrl: getTemplateUrl(),
          dataFormat: data => {
            let keys = [
              'code',
              'name',
              'unitName',
              'materialTypeCodes',
              'desc',
              'fifo',
              'replaceMaterialList',
              'validTime',
              'warningTime',
              'safeStorageAmount',
              {
                title: 'qualityStatus',
                formatter: data => (typeof data === 'string' ? data.split('，').map(e => e && e.trim()) : undefined),
              },
              'issueWarehouseCode',
              'checkDate',
              'preCheckDays',
              'needRequestMaterial',
              'frozenTime',
              'qcOperatorName',
              'proUseUnitName',
              'proHoldUnitName',
              'inputFactoryUnitName',
            ];
            const unitConversionKeys = [
              'unit1',
              'masterUnitCount1',
              'slaveUnitCount1',
              'unit2',
              'masterUnitCount2',
              'slaveUnitCount2',
              'unit3',
              'masterUnitCount3',
              'slaveUnitCount3',
              'unit4',
              'masterUnitCount4',
              'slaveUnitCount4',
              'unit5',
              'masterUnitCount5',
              'slaveUnitCount5',
            ];
            const materialSpecificationKeys = [
              'conversionRadio1',
              'conversionUnit1',
              'conversionRadio2',
              'conversionUnit2',
              'conversionRadio3',
              'conversionUnit3',
              'conversionRadio4',
              'conversionUnit4',
              'conversionRadio5',
              'conversionUnit5',
            ];
            keys = keys.concat(unitConversionKeys).concat(materialSpecificationKeys);
            // 去除第一行的填写备注
            data.splice(0, 1);
            // 去除空行
            data = data.filter(e => Array.isArray(e) && e.length);
            const keysData = keysToObj(data, keys);

            const valueInCsvData = Array.isArray(data) ? data.slice(1) : []; // csv文件中的数据
            const titlesInCsv = data[0]; // csv文件中的titles

            // 获取自定义的字段
            valueInCsvData.forEach((item, index) => {
              const customFields = [];
              for (let i = keys.length; i < titlesInCsv.length; i += 1) {
                customFields.push({
                  keyName: titlesInCsv[i],
                  keyValue: item[i],
                });
              }
              keysData[index].materialCustomFields = customFields;
            });

            // 获取转换单位
            if (Array.isArray(keysData)) {
              keysData.forEach(i => {
                const unitConversions = [];
                unitConversionKeys.forEach(j => {
                  if (j && j.indexOf('unit') !== -1) {
                    const index = j[j.length - 1];

                    unitConversions.push({
                      masterUnitCount: i[`masterUnitCount${index}`],
                      slaveUnitCount: i[`slaveUnitCount${index}`],
                      slaveUnitName: i[`unit${index}`],
                    });

                    delete i[j];
                    delete i[`masterUnitCount${index}`];
                    delete i[`slaveUnitCount${index}`];
                  }
                });
                i.unitConversions = unitConversions;
              });
            }

            // 获取入厂规格
            if (Array.isArray(keysData)) {
              keysData.forEach(i => {
                const materialSpecifications = [];
                materialSpecificationKeys.forEach(j => {
                  if (j && j.indexOf('conversionUnit') !== -1) {
                    const index = j[j.length - 1];

                    materialSpecifications.push({
                      conversionRatio: i[`conversionRadio${index}`],
                      unitName: i[`conversionUnit${index}`],
                    });

                    delete i[j];
                    delete i[`conversionRadio${index}`];
                  }
                });
                i.materialSpecifications = materialSpecifications;
              });
            }

            return keysData;
          },
          customContentForLastStep: (state, modalOperation) => {
            const { allResponse } = state || {};
            const { closeModal } = modalOperation || {};

            let createSuccessAmount = 0;
            let createFailAmount = 0;
            let updateSuccessAmount = 0;
            let updateFailAmount = 0;

            if (Array.isArray(allResponse)) {
              allResponse.forEach(i => {
                const data = _.get(i, 'data.data');
                const { successAmount, failureAmount, updateAmount, updateFailedAmount } = data || {};
                createSuccessAmount += successAmount;
                createFailAmount += failureAmount;
                updateSuccessAmount += updateAmount;
                updateFailAmount += updateFailedAmount;
              });
            }
            if (sensors) {
              sensors.track('web_bom_materials_create', {
                CreateMode: 'Excel导入',
                amount: createSuccessAmount,
              });
            }

            return (
              <React.Fragment>
                <Icon
                  width={36}
                  type={createSuccessAmount + updateSuccessAmount === 0 ? 'close-circle' : 'check-circle'}
                />
                <div className="text">
                  <h3 style={{ marginTop: 0 }}>
                    <FormattedMessage
                      defaultMessage={createSuccessAmount + updateSuccessAmount === 0 ? '导入失败!' : '导入完成!'}
                    />
                  </h3>
                  <p>
                    <FormattedMessage
                      defaultMessage={'创建成功数：{createSuccessAmount}，创建失败数：{createFailAmount}'}
                      values={{ createSuccessAmount, createFailAmount }}
                    />
                  </p>
                  <p>
                    <FormattedMessage
                      defaultMessage={'更新成功数：{updateSuccessAmount}，更新失败数：{updateFailAmount}'}
                      values={{ updateSuccessAmount, updateFailAmount }}
                    />
                  </p>
                  <div style={{ margin: '30px 0 60px' }}>
                    <Link
                      icon={'eye'}
                      onClick={() => {
                        if (typeof closeModal === 'function') closeModal();
                        context.router.history.push('/bom/materials/logs/import');
                      }}
                    >
                      查看导入日志
                    </Link>
                  </div>
                </div>
              </React.Fragment>
            );
          },
        });
      }}
    >
      导入
    </Button>
  );
};

ImportMaterial.contextTypes = {
  router: PropTypes.any,
};

export default ImportMaterial;
