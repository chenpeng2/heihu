import React, { Component } from 'react';
import { Tooltip, RestPagingTable, Attachment, Link, openModal } from 'src/components/index';
import { replaceSign } from 'src/constants';
import { getAttachments } from 'src/services/attachment';
import _, { cloneDeep } from 'lodash';
import QcModal from '../../../components/modal/qcModal';

const AttachmentImageView = Attachment.ImageView;

const getAttachmentData = results => {
  console.log(results);
  if (Array.isArray(results)) {
    return results.map(realData => {
      return {
        url: realData ? realData.uri : null,
        originalFileName: realData ? realData.originalFileName : null,
        originalExtension: realData ? realData.originalExtension : null,
        id: realData ? realData.id : null,
      };
    });
  }
  return [];
};

type Props = {
  data: [],
  style: {},
  bindEBomToProcessRouting: boolean,
};

class Table extends Component {
  props: Props;
  state = {};

  getColumns = () => {
    const { bindEBomToProcessRouting } = this.props;
    const bindEBomToProcessRoutingFalse = _.isNull(bindEBomToProcessRouting) || bindEBomToProcessRouting === true;
    return [
      {
        title: '序号',
        dataIndex: 'nodeCode',
        width: 100,
        render: data => {
          return <Tooltip text={data || replaceSign} length={20} />;
        },
      },
      {
        title: '工序名称',
        dataIndex: 'name',
        width: 150,
        render: data => {
          return <Tooltip text={data || replaceSign} length={20} />;
        },
      },
      {
        title: '附件',
        dataIndex: 'attachments',
        width: 100,
        key: 'image',
        render: (attachments, record) => {
          if (Array.isArray(attachments) && attachments.length > 0) {
            return (
              <Link
                icon="paper-clip"
                key={`attachment-${record.id}`}
                onClick={() => {
                  getAttachments(attachments).then(res => {
                    const {
                      data: { data },
                    } = res;
                    const _res = getAttachmentData(data);
                    console.log(_res);
                    openModal({
                      title: '附件',
                      footer: null,
                      children: <AttachmentImageView attachment={{ files: _res }} />,
                    });
                  });
                }}
              />
            );
          }

          return replaceSign;
        },
      },
      bindEBomToProcessRoutingFalse
        ? {
            title: '投入物料',
            dataIndex: 'inputMaterials',
            width: 150,
            render: data => {
              const inputMaterials = _.get(data, 'length')
                ? data.map(x => {
                    return `${_.get(x.material, 'code')}/${_.get(x.material, 'name')}`;
                  })
                : replaceSign;
              const display = inputMaterials ? _.join(inputMaterials, ',') : inputMaterials;
              return <Tooltip text={display} length={20} />;
            },
          }
        : {},
      bindEBomToProcessRoutingFalse
        ? {
            title: '产出物料',
            dataIndex: 'outputMaterial',
            width: 150,
            render: data => {
              const outputMaterial = _.get(data, 'material')
                ? `${_.get(data.material, 'code')}/${_.get(data.material, 'name')}`
                : replaceSign;
              return <Tooltip text={outputMaterial} length={20} />;
            },
          }
        : {},
      {
        title: '质检方案',
        dataIndex: 'qcConfigDetails',
        maxWidth: { C: 8 },
        render: (data, record) => {
          if (Array.isArray(data) && data.length > 0) {
            return <QcModal data={data} />;
          }
          return replaceSign;
        },
      },
    ];
  };

  render() {
    const { data, bindEBomToProcessRouting, ...rest } = this.props;
    const columns = this.getColumns();

    return (
      <RestPagingTable
        style={{ margin: 0 }}
        dataSource={data || []}
        columns={columns}
        pagination={false}
        scroll={{ y: 260 }}
        {...rest}
      />
    );
  }
}

export default Table;
