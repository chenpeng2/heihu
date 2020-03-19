import React from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { ImportModal, Link, Button } from 'src/components';
import { arrayIsEmpty } from 'src/utils/array';
import { isOrganizationUseQrCode } from 'utils/organizationConfig';
import { changeChineseToLocaleWithoutIntl } from 'src/utils/locale/utils';
import { importQcConfigBase, importQcConfigMaterial, importQcConfigCheckItemConfig } from 'src/services/qcConfig';
import { getQcConfigImportLogUrl } from '../../utils';
import { qcReportRecordCountSettable } from '../../constants';

type Props = {
  history: any,
};

const QcConfigReasonImportButton = (props: Props, context) => {
  const { history } = props;
  const useQrCode = isOrganizationUseQrCode();
  const dataFormat = (data, keys) => {
    if (arrayIsEmpty(keys)) {
      return null;
    }
    const rs = [];
    const isQcConfigBase = !arrayIsEmpty(data) && data[1] && data[1].filter(n => n === '编号').length !== 0;
    keys.forEach((key, outIndex) => {
      data.forEach((node, index) => {
        if (index > 1) {
          rs[index - 1] = {
            ...rs[index - 1],
            [key]: node[outIndex],
          };
          if (isQcConfigBase) {
            if (!qcReportRecordCountSettable) {
              rs[index - 1].checkEntityType = 2;
            }
            if (!useQrCode) {
              rs[index - 1].scrapInspection = 0;
              rs[index - 1].recordSampleResultType = 2;
            }
          }
        }
      });
    });
    return _.compact(rs);
  };

  const getQcConfigBaseFileUrl = () => {
    if (useQrCode && qcReportRecordCountSettable) {
      return 'https://public-template.s3.cn-northwest-1.amazonaws.com.cn/20190614/%E8%B4%A8%E6%A3%80%E6%96%B9%E6%A1%88%E5%9F%BA%E7%A1%80%E4%BF%A1%E6%81%AF.xlsx';
    } else if (!useQrCode && qcReportRecordCountSettable) {
      return 'https://public-template.s3.cn-northwest-1.amazonaws.com.cn/20190614/%E8%B4%A8%E6%A3%80%E6%96%B9%E6%A1%88%E5%9F%BA%E7%A1%80%E4%BF%A1%E6%81%AF_%E6%97%A0%E7%A0%81%E5%B7%A5%E5%8E%82.xlsx';
    } else if (useQrCode && !qcReportRecordCountSettable) {
      return 'https://public-template.s3.cn-northwest-1.amazonaws.com.cn/20190614/%E8%B4%A8%E6%A3%80%E6%96%B9%E6%A1%88%E5%9F%BA%E7%A1%80%E4%BF%A1%E6%81%AF_%E6%8A%A5%E5%91%8A%E8%AE%B0%E5%BD%95%E6%95%B0%E9%87%8F%E4%B8%8D%E5%8F%AF%E8%AE%BE%E7%BD%AE.xlsx';
    }
    return 'https://public-template.s3.cn-northwest-1.amazonaws.com.cn/20190614/%E8%B4%A8%E6%A3%80%E6%96%B9%E6%A1%88%E5%9F%BA%E7%A1%80%E4%BF%A1%E6%81%AF_%E6%8A%A5%E5%91%8A%E8%AE%B0%E5%BD%95%E6%95%B0%E9%87%8F%E4%B8%8D%E5%8F%AF%E8%AE%BE%E7%BD%AE_%E6%97%A0%E7%A0%81.xlsx';
  };

  return (
    <div>
      <Button
        icon="download"
        ghost
        style={{ margin: '0 20px' }}
        onClick={() =>
          ImportModal({
            title: '质检方案',
            item: ['质检方案基础信息', '质检方案可适用物料', '质检方案相关质检项'],
            titles: [
              _.compact([
                'code',
                'name',
                'state',
                'checkType',
                'checkCountType',
                'checkCount',
                'recordType',
                qcReportRecordCountSettable && 'checkEntityType',
                qcReportRecordCountSettable && 'checkEntityUnitCount',
                qcReportRecordCountSettable && 'checkEntityUnitUnit',
                useQrCode && 'scrapInspection',
                'autoCreateQcTask',
                'taskCreateType',
                'taskCreateNumber',
                useQrCode && 'recordSampleResultType',
                'recordCheckItemType',
              ]),
              ['qcConfigCode', 'materialCode', 'qcUnitName'],
              [
                'qcConfigCode',
                'checkItemGroupName',
                'checkItemName',
                'checkCountType',
                'checkNums',
                'qcAqlInspectionCategory',
                'qcAqlCategory',
                'logic',
                'qcLogicInterval',
                'unitName',
                'qcDefectReasonNames',
              ],
            ],
            templateUrl: [
              getQcConfigBaseFileUrl(),
              'https://public-template.s3.cn-northwest-1.amazonaws.com.cn/20190614/%E8%B4%A8%E6%A3%80%E6%96%B9%E6%A1%88%E5%8F%AF%E9%80%82%E7%94%A8%E7%89%A9%E6%96%99.xlsx',
              'https://public-template.s3.cn-northwest-1.amazonaws.com.cn/20190614/%E8%B4%A8%E6%A3%80%E6%96%B9%E6%A1%88%E7%9B%B8%E5%85%B3%E8%B4%A8%E6%A3%80%E9%A1%B9.xlsx',
            ],
            logUrl: getQcConfigImportLogUrl(),
            method: [importQcConfigBase, importQcConfigMaterial, importQcConfigCheckItemConfig],
            extraActionStepConfirm: () => (
              <p>
                {changeChineseToLocaleWithoutIntl(
                  '5.上传时先上传《质检方案基础信息》，然后再分别上传《质检方案可适用物料》和《质检方案相关质检项》。且文件名要和内容保持一致，分别为《质检方案基础信息》、《质检方案可适用物料》和《质检方案相关质检项》。',
                )}
              </p>
            ),
            fileTypes: '.xlsx',
            listName: 'items',
            multiImport: true,
            dataFormat,
            context,
          })
        }
      >
        导入
      </Button>
      <Link
        icon="eye-o"
        style={{ lineHeight: '30px', height: '28px' }}
        onClick={() => {
          history.push(getQcConfigImportLogUrl());
        }}
      >
        查看导入日志
      </Link>
    </div>
  );
};

QcConfigReasonImportButton.contextTypes = {
  router: PropTypes.object.isRequired,
};

export default QcConfigReasonImportButton;
