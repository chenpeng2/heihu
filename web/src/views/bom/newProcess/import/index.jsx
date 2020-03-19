import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import { Icon, Link, OpenImportModal, Button, FormattedMessage } from 'src/components';
import { keysToObj } from 'src/utils/parseFile';
import { importProcess } from 'src/services/process';
import { getMaterialCheckDateConfig } from 'src/utils/organizationConfig';

const getTemplateUrl = () => {
  // 有物料审核日期配置和没有使用不同的模版
  return 'https://public-template.s3.cn-northwest-1.amazonaws.com.cn/20190805/%E5%B7%A5%E5%BA%8F%E5%AF%BC%E5%85%A5%E6%A8%A1%E6%9D%BFv3.8.14.xlsx';
};

const ImportMaterial = (props, context) => {
  return (
    <Button
      icon="download"
      ghost
      style={{ marginRight: '20px' }}
      onClick={() => {
        OpenImportModal({
          item: '工序',
          fileTypes: ['.xlsx'],
          context,
          method: importProcess,
          listName: 'processes',
          logUrl: '/bom/newProcess/logs/import',
          templateUrl: getTemplateUrl(),
          dataFormat: data => {
            const keys = [
              'processCode',
              'processName',
              'workstationCodes',
              'codeScanNum',
              'alwaysOneCode',
              'defectCodes',
              'fifo',
              'unqualifiedProducts',
              'productDesc',
              'deliverableCheck',
              'outputFrozenCategory',
            ];
            // 去除第一行的填写备注
            data.splice(0, 1);
            // 去除空行
            data = data.filter(e => Array.isArray(e) && e.length);
            let keysData = keysToObj(data, keys);
            keysData = keysData.map(({ workshopCodes, productLineCodes, workstationCodes, defectCodes, ...rest }) => ({
              ...rest,
              workstationCodes: workstationCodes && workstationCodes.split(',').map(e => e.trim()),
              defectCodes: defectCodes && defectCodes.split(',').map(e => e.trim()),
            }));

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
                const {
                  createSuccessAmount: successAmount,
                  createFailAmount: failureAmount,
                  updateSuccessAmount: updateAmount,
                  updateFailAmount: updateFailedAmount,
                } = data || {};
                createSuccessAmount += successAmount;
                createFailAmount += failureAmount;
                updateSuccessAmount += updateAmount;
                updateFailAmount += updateFailedAmount;
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
                        context.router.history.push('/bom/newProcess/logs/import');
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
