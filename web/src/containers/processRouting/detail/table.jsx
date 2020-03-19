import React, { Component } from 'react';

import { Table, Tooltip, Link, openModal, Attachment, FormattedMessage } from 'src/components';
import { replaceSign } from 'src/constants';
import { SUCCESSION_MODE_ENUM } from 'src/containers/mBom/base/constant';
import { FIFO_VALUE_DISPLAY_MAP } from 'views/bom/newProcess/utils';
import QcModal from 'src/components/modal/qcModal';
import {
  useFrozenTime,
  isOrganizationUseQrCode,
  getTaskDeliverableOrganizationConfig,
  configHasSOP,
} from 'src/utils/organizationConfig';
import { round } from 'src/utils/number';
import { OUTPUT_FROZEN_CATEGORY } from 'src/views/bom/newProcess/utils';
import { changeChineseToLocaleWithoutIntl } from 'utils/locale/utils';

const AttachmentImageView = Attachment.ImageView;

type Props = {
  style: {},
  dataSource: [],
  total: number,
};

class ProcessTable extends Component {
  props: Props;
  state = {};

  getColumns = () => {
    const useQrCode = isOrganizationUseQrCode();
    const useProduceTaskDeliverable = getTaskDeliverableOrganizationConfig();
    const hasSop = configHasSOP();
    let columns = [
      {
        title: '序号',
        dataIndex: 'No',
        render: no => {
          return no || replaceSign;
        },
      },
      {
        title: '编号／名称',
        dataIndex: 'codeAndName',
        render: data => {
          if (data) {
            return <Tooltip text={data} length={10} />;
          }
          return replaceSign;
        },
      },
      {
        title: '工位',
        dataIndex: 'workstations',
        render: data => {
          if (data) {
            return <Tooltip text={data} length={10} />;
          }
          return replaceSign;
        },
      },
      {
        title: '单次扫码',
        dataIndex: 'codeScanNum',
        render: codeScanNum => {
          return <FormattedMessage defaultMessage={codeScanNum === 1 ? '是' : '否'} />;
        },
      },
      !hasSop && {
        title: '一码到底',
        dataIndex: 'alwaysOneCode',
        key: 'alwaysOneCode',
        render: alwaysOneCode => {
          return <FormattedMessage defaultMessage={alwaysOneCode ? '是' : '否'} />;
        },
      },
      {
        title: '用料追溯关系',
        dataIndex: 'fifo',
        render: fifo => {
          return (
            <FormattedMessage defaultMessage={typeof fifo === 'number' ? FIFO_VALUE_DISPLAY_MAP[fifo] : replaceSign} />
          );
        },
      },
      {
        title: '不合格品投产',
        dataIndex: 'unqualifiedProducts',
        render: unqualifiedProducts => {
          return unqualifiedProducts ? '允许' : '不允许';
        },
      },
      {
        title: '接续方式',
        dataIndex: 'successionMode',
        render: successionMode => <FormattedMessage defaultMessage={SUCCESSION_MODE_ENUM[successionMode]} />,
      },
      {
        title: '准备时间',
        key: 'preparationTime',
        render: (_, record) => {
          const { preparationTime, preparationTimeCategory } = record || {};
          const text = `${
            typeof preparationTime === 'number' ? round(preparationTime) : replaceSign
          } ${changeChineseToLocaleWithoutIntl(preparationTimeCategory === 0 ? '分钟' : '小时')}`;

          return <div>{text || replaceSign}</div>;
        },
      },
      {
        title: '次品项列表',
        dataIndex: 'defects',
        render: value => {
          const _data = Array.isArray(value) && value.length ? value.join(',') : null;
          return <Tooltip text={_data || replaceSign} length={20} />;
        },
      },
    ].filter(n => n);
    if (useProduceTaskDeliverable) {
      columns.push({
        title: '是否审批',
        dataIndex: 'deliverable',
        render: deliverable => {
          return <FormattedMessage defaultMessage={deliverable ? '是' : '否'} />;
        },
      });
    }

    // 产出是否冻结
    if (useFrozenTime()) {
      columns.push({
        title: '产出是否冻结',
        dataIndex: 'outputFrozen',
        render: data => {
          return <FormattedMessage defaultMessage={data === OUTPUT_FROZEN_CATEGORY.frozen.value ? '是' : '否'} />;
        },
      });
    }

    columns = columns.concat([
      {
        title: '生产描述',
        dataIndex: 'productDesc',
        render: data => {
          if (data) {
            return <Tooltip text={data} length={10} />;
          }
          return replaceSign;
        },
      },
      {
        title: '附件',
        dataIndex: 'attachments',
        render: attachments => {
          return attachments && attachments.length ? (
            <Link
              icon="paper-clip"
              onClick={() => {
                openModal(
                  {
                    title: '附件',
                    footer: null,
                    children: <AttachmentImageView attachment={{ files: attachments }} />,
                  },
                  this.context,
                );
              }}
            />
          ) : (
            replaceSign
          );
        },
      },
      {
        title: '质检方案',
        dataIndex: 'qcConfigDetails',
        render: data => {
          if (Array.isArray(data) && data.length > 0) {
            return <QcModal data={data} />;
          }
          return replaceSign;
        },
      },
    ]);

    return columns
      .filter(i => {
        if (
          !useQrCode &&
          i &&
          (i.dataIndex === 'fifo' || i.dataIndex === 'codeScanNum' || i.dataIndex === 'alwaysOneCode')
        ) {
          return null;
        }
        return i;
      })
      .filter(i => i);
  };

  render() {
    const { dataSource } = this.props;
    const columns = this.getColumns();

    return <Table scroll={{ x: 1400 }} dataSource={dataSource} columns={columns} />;
  }
}

export default ProcessTable;
