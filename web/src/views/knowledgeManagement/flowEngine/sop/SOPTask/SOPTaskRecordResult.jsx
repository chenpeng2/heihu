import React from 'react';
import { Link, OpenModal, Table, Attachment } from 'components';
import { getSOPTaskRecordResult } from 'services/knowledgeBase/sop';
import { replaceSign } from 'constants';
import { formatUnix, format } from 'utils/time';
import { getAttachments } from 'services/attachment';
import CONSTANT from '../../common/SOPConstant';

const AttachmentImageView = Attachment.ImageView;

class SOPTaskRecordResult extends React.PureComponent {
  state = {
    dataSource: [],
    total: 0,
  };

  componentDidMount() {
    this.setDataSource();
  }

  setDataSource = async params => {
    const {
      match: {
        params: { taskId },
      },
    } = this.props;
    const {
      data: { data, total },
    } = await getSOPTaskRecordResult({ taskId, page: 1, size: 10, ...params });
    this.setState({ dataSource: data, total });
  };

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

  render() {
    const columns = [
      { title: '步骤名称', key: 'name', dataIndex: 'stepName', width: 120 },
      {
        title: '结束步骤时间',
        key: 'time',
        dataIndex: 'execTime',
        render: time => (time ? format(time) : replaceSign),
        width: 120,
      },
      {
        title: '电子签名',
        key: 'signature',
        dataIndex: 'stepDigitalSignatureUser',
        render: signature => (signature ? signature.name : replaceSign),
        width: 120,
      },
      { title: '控件名称', key: 'controller-name', dataIndex: 'name', width: 120 },
      { title: '控件备注', key: 'remark', dataIndex: 'inputRemark', render: input => input || replaceSign, width: 120 },
      {
        title: '标准',
        key: 'standard',
        dataIndex: 'inputStandard',
        width: 120,
        render: standard => {
          if (!standard) {
            return replaceSign;
          }
          const { logic, base, max, min } = standard;
          if (logic === CONSTANT.BETWEEN) {
            return `${min}~${max}`;
          } else if (logic === CONSTANT.TOLERANCE) {
            return `${base}+${min}+${max}`;
          }
          const map = {
            [CONSTANT.GT]: '>',
            [CONSTANT.EQ]: '=',
            [CONSTANT.GTE]: '>=',
            [CONSTANT.LT]: '<',
            [CONSTANT.LTE]: '<=',
          };
          return `${map[logic]} ${base}`;
        },
      },
      {
        title: '记录结果',
        key: 'result',
        dataIndex: 'value',
        width: 120,
        render: (value, { type }) => {
          if (type === CONSTANT.TYPE_FILE) {
            return (
              <Link
                icon="paper-clip"
                onClick={async () => {
                  const files = await this.fetchAttachmentsData(value);
                  OpenModal({
                    title: '附件',
                    footer: null,
                    children: (
                      <AttachmentImageView
                        attachment={{
                          files,
                        }}
                      />
                    ),
                  });
                }}
              >
                {value.length}
              </Link>
            );
          } else if (type === CONSTANT.TYPE_USER || type === CONSTANT.TYPE_AUTH) {
            return value.name;
          } else if (type === CONSTANT.TYPE_TIME) {
            return formatUnix(value);
          } else if (type === CONSTANT.TYPE_MULTIPLE_USER) {
            return Array.isArray(value) && value.map(({ name }) => name).join(',');
          }
          return value;
        },
      },
    ];
    const { dataSource, total } = this.state;
    const {
      location: {
        query: { taskCode },
      },
    } = this.props;
    return (
      <div style={{ margin: 10 }}>
        <h3>记录结果| 任务编号: {taskCode}</h3>
        <Table
          scroll={{ x: true }}
          dragable
          columns={columns}
          tableUniqueKey="sop-task-record-result"
          dataSource={dataSource}
          style={{ margin: 0, marginTop: 30 }}
          onChange={pagination => {
            this.setDataSource({ page: pagination.current, size: pagination.pageSize });
          }}
          total={total}
          fetchData={this.setDataSource}
        />
      </div>
    );
  }
}

export default SOPTaskRecordResult;
