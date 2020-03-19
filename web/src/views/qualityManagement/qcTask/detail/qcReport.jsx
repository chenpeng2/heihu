import React, { Component } from 'react';
import _ from 'lodash';
import { getOrganizationConfigFromLocalStorage } from 'src/utils/organizationConfig';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Table } from 'antd';
import { error } from 'src/styles/color';
import { Row, Col, Link, message, Attachment, OpenModal, Icon } from 'components';
import { getAttachments } from 'src/services/attachment';
import { queryQcReport } from 'src/services/qualityManagement/qcTask';
import { thousandBitSeparator, safeSub } from 'utils/number';
import { replaceSign } from 'src/constants';

const { Column, ColumnGroup } = Table;
const AttachmentFile = Attachment.AttachmentFile;
const AttachmentImageView = Attachment.ImageView;

type Props = {
  form: {
    getFieldDecorator: () => {},
  },
  match: {},
  code: String,
};

class QcReport extends Component {
  props: Props;
  state = {
    loading: false,
    reports: [],
    qcCheckItemConfigs: [],
    sampleList: [],
    checkCountType: null,
    recordType: null,
  };

  componentDidMount() {
    const { match: { params: { id } } } = this.props;
    this.fetchData(id);
  }

  fetchData = async params => {
    this.setState({
      loading: true,
    });
    await queryQcReport(params)
      .then(({ data: { data } }) => {
        // AQL检默认以仅记录次品展示
        const checkCountType = _.get(data, 'qcConfig.checkCountType');
        this.setState({
          loading: false,
          reports: data.reports,
          checkCountType: _.get(data.config, 'checkCountType'),
          sampleDefectRate: data.sampleDefectRate,
          qcCheckItemConfigs: _.get(data.qcConfig, 'qcCheckItemConfigs'),
          recordType: _.isEqual(Number(checkCountType), 4) ? 2 : data.recordType,
          sampleList: data.sampleMaterials,
        });
      })
      .catch(e => console.log(e));
  };

  fetchAttachmentData = async ids => {
    const {
      data: { data },
    } = await getAttachments(ids);
    return data.map(x => {
      x.originalFileName = x.original_filename;
      x.originalExtension = x.original_extension;
      return x;
    });
  };

  renderColumns = ({ title, children }, key) => {
    if (children && children.length) {
      key = key ? `${key}_${title}` : title;
      return <ColumnGroup title={title}>{children.map(x => this.renderColumns(x, key))}</ColumnGroup>;
    }
    return (
      <Column
        width={170}
        colSpan={1}
        title={title}
        dataIndex={key || title}
        render={(text, record) => {
          const dataIndex = key || title;
          if (dataIndex === '二维码') {
            return text ? (
              <Link
                onClick={() => {
                  const qrCode = record[`${dataIndex}`];
                  this.context.router.history.push(`/stock/qrCode?qrcode=${qrCode}`);
                }}
              >
                {text}
              </Link>
            ) : (
                replaceSign
              );
          }
          if (dataIndex === '序号') return text || replaceSign;
          const config = record[`${dataIndex}_标准`];
          if (!config) return text || replaceSign;
          // const category = record[`${dataIndex}_是否合格`];
          const attachmentIds = record[`${dataIndex}_附件`];
          return (
            <div style={{ display: 'flex' }}>
              {this.checkValue(config, text)}
              {/* <span style={category === 0 ? { color: error } : null}>{text || replaceSign}</span> */}
              {attachmentIds && attachmentIds.length > 0 ? (
                <Link
                  style={{ paddingLeft: 5 }}
                  key={`attachment-${record.id}`}
                  onClick={async () => {
                    const attachments = await this.fetchAttachmentData(attachmentIds);
                    OpenModal(
                      {
                        title: '附件',
                        footer: null,
                        children: <AttachmentImageView attachment={{ files: attachments }} />,
                      },
                      this.context,
                    );
                  }}
                >
                  <Icon type="paper-clip" />
                  {attachmentIds.length}
                </Link>
              ) : null}
            </div>
          );
        }}
      />
    );
  };

  checkValue = (config, value) => {
    const { logic, min, max, base } = config;
    if (value === replaceSign) return value;
    switch (logic) {
      case 0: {
        if (min <= value && value <= max) return value;
        return <p style={{ color: error }}>{value}</p>;
      }
      case 1: {
        if (value < base) return value;
        return <p style={{ color: error }}>{value}</p>;
      }
      case 2: {
        if (value > base) return value;
        return <p style={{ color: error }}>{value}</p>;
      }
      case 3: {
        if (value === base) return value;
        return <p style={{ color: error }}>{value}</p>;
      }
      case 4: {
        if (value <= base) return value;
        return <p style={{ color: error }}>{value}</p>;
      }
      case 5: {
        if (value >= base) return value;
        return <p style={{ color: error }}>{value}</p>;
      }
      case 6: {
        if (value === '次品') return <p style={{ color: error }}>{value}</p>;
        return value;
      }
      case 7:
        return value;
      case 8: {
        if (min <= value && value <= max) return value;
        return <p style={{ color: error }}>{value}</p>;
      }
      default:
        return value;
    }
  };

  getColumns = titles => {
    return [
      {
        title: '分类',
        dataIndex: 'groupName',
        colSpan: 1,
        render: name => {
          const obj = {
            children: name,
            props: {
              rowSpan: 0,
            },
          };

          titles.forEach(x => {
            if (name === x.title) {
              obj.props.rowSpan = x.children.length;
            }
          });

          return obj;
        },
      },
      {
        title: '质检项名称',
        dataIndex: 'itemName',
        colSpan: 1,
        render: (text, row, index) => text || replaceSign,
      },
      {
        title: '次品数',
        dataIndex: 'defect',
        colSpan: 1,
        render: (text, row, index) => (typeof text === 'number' ? thousandBitSeparator(text) : replaceSign),
      },
      {
        title: '次品率',
        dataIndex: 'defectPer',
        colSpan: 1,
        render: (text, row, index) => text || replaceSign,
      },
      {
        title: '次品照片',
        dataIndex: 'attachmentIds',
        colSpan: 1,
        render: (attachmentIds, row, index) => {
          return attachmentIds && attachmentIds.length > 0 ? (
            <Link
              key={`attachment-${index}`}
              onClick={async () => {
                const attachments = await this.fetchAttachmentData(attachmentIds);
                OpenModal(
                  {
                    title: '附件',
                    footer: null,
                    children: <AttachmentImageView attachment={{ files: attachments }} />,
                  },
                  this.context,
                );
              }}
            >
              <Icon type="paper-clip" />
              {attachmentIds.length}
            </Link>
          ) : (
              replaceSign
            );
        },
      },
    ];
  };

  getBase = config => {
    const { logic, min, max, base } = config;
    return [base, min, max];
  };

  getDefect = rate => {
    if (rate <= 0) return '0%';
    if (rate === 100) return '100%';
    return rate ? `${rate.toFixed(2)}%` : replaceSign;
  };

  getLogic = config => {
    const { logic, min, max, base } = config;
    const name = _.get(config, 'unit.name', '');
    switch (logic) {
      case 0:
        return `${min} ~ ${max} ${name}`;
      case 1:
        return `< ${base} ${name}`;
      case 2:
        return `> ${base} ${name}`;
      case 3:
        return `= ${base} ${name}`;
      case 4:
        return `≤ ${base} ${name}`;
      case 5:
        return `≥ ${base} ${name}`;
      case 6:
        return '人工判断';
      case 7:
        return '手工输入';
      case 8: {
        const minus = safeSub(min, base);
        const add = safeSub(max, base);
        return `${base} +${add} ${minus} ${name}`;
      }
      default:
        return '人工判断';
    }
  };

  getCheckValue = (logic, reportValue) => {
    const { category, desc, value } = reportValue;
    switch (logic) {
      case 0:
        return typeof value === 'number' ? value : replaceSign;
      case 1:
        return typeof value === 'number' ? value : replaceSign;
      case 2:
        return typeof value === 'number' ? value : replaceSign;
      case 3:
        return typeof value === 'number' ? value : replaceSign;
      case 4:
        return typeof value === 'number' ? value : replaceSign;
      case 5:
        return typeof value === 'number' ? value : replaceSign;
      case 8:
        return typeof value === 'number' ? value : replaceSign;
      case 6:
        if (category === 0) return '次品';
        if (category === 1) return '良品';
        return replaceSign;
      case 7:
        return desc || replaceSign;
      default:
        if (category === 0) return '次品';
        if (category === 1) return '良品';
        return replaceSign;
    }
  };

  getTitleByReports = data => {
    const { recordType } = this.state;
    if (recordType === 2) {
      const zipped = data.map(x =>
        _.zipObjectDeep(
          ['title', 'children[0].title', 'children[0].children[0].title', 'children[0].children[0].children'],
          [
            x.qcCheckItemConfig.checkItem.group.name,
            x.qcCheckItemConfig.checkItem.name,
            this.getLogic(x.qcCheckItemConfig),
            [],
          ],
        ),
      );
      const groups = _.groupBy(zipped, 'title');
      const keys = _.keys(groups);
      const values = _.values(groups);
      return keys.map((x, index) => {
        return {
          title: x,
          children: values[index].map(x => x.children[0]),
        };
      });
    }
    const zipped = data.map(x =>
      _.zipObjectDeep(
        [
          'title',
          'children[0].title',
          'children[0].children[0].title',
          'children[0].children[0].value',
          'children[0].children[0].children',
        ],
        [
          x.qcCheckItemConfig.checkItem.group.name,
          x.qcCheckItemConfig.checkItem.name,
          this.getLogic(x.qcCheckItemConfig),
          this.getQcReportValues(x.qcReportValues),
          [],
        ],
      ),
    );

    const groups = _.groupBy(zipped, 'title');
    const keys = _.keys(groups);
    const values = _.values(groups);
    const qcColumns = keys.map((x, index) => {
      return {
        title: x,
        children: values[index].map(x => x.children && x.children[0]),
      };
    });
    const defaultColumns = [
      {
        title: '序号',
        children: [],
      },
      {
        title: '二维码',
        children: [],
      },
    ];
    return defaultColumns.concat(qcColumns);
  };

  getTitleByQcConfigs = data => {
    const { recordType } = this.state;
    if (recordType === 2) {
      const zipped = data.map(x =>
        _.zipObjectDeep(
          ['title', 'children[0].title', 'children[0].children[0].title', 'children[0].children[0].children'],
          [x.checkItem.group.name, x.checkItem.name, this.getLogic(x), []],
        ),
      );
      const groups = _.groupBy(zipped, 'title');
      const keys = _.keys(groups);
      const values = _.values(groups);
      const format = keys.map((x, index) => {
        return {
          title: x,
          children: values[index].map(x => x.children[0]),
        };
      });
      return format;
    }

    const zipped = data.map(x =>
      _.zipObjectDeep(
        [
          'title',
          'children[0].title',
          'children[0].children[0].title',
          'children[0].children[0].value',
          'children[0].children[0].children',
        ],
        [x.checkItem.group.name, x.checkItem.name, this.getLogic(x), x.qcReportValues, []],
      ),
    );

    const groups = _.groupBy(zipped, 'title');
    const keys = _.keys(groups);
    const values = _.values(groups);
    const qcColumns = keys.map((x, index) => {
      return {
        title: x,
        children: values[index].map(x => x.children && x.children[0]),
      };
    });
    const defaultColumns = [
      {
        title: '序号',
        children: [],
      },
      {
        title: '二维码',
        children: [],
      },
    ];
    return defaultColumns.concat(qcColumns);
  };

  getQcReportValues = values => {
    const { recordType } = this.state;
    if (recordType === 0) {
      // 单体记录
      return values[0];
    }
    if (recordType === 1) {
      // 质检项记录
      return {};
    }
  };

  getDefectPer = recordType => {
    const { reports } = this.state;
    if (reports.length) {
      let defect = 0;
      let normal = 0;
      reports.forEach(x => {
        if (recordType === 1) {
          defect += x.defect;
          normal += x.normal;
        }
        defect = x.defect;
        normal = x.normal;
      });
      const percent = Math.round((defect / (defect + normal)) * 100);
      return percent ? `${percent}%` : '0%';
    }
    return replaceSign;
  };

  formatData = data => {
    const { recordType, qcCheckItemConfigs } = this.state;

    // 为了groupName在单元格的合并。将数据根据groupName分类。然后删除不需要的groupName
    const deleteUnUseGroupName = data => {
      const names = [];
      data.forEach(i => {
        names.push(i.groupName);
      });

      const res = {};
      data.forEach((i, index) => {
        if (names.indexOf(i.groupName) !== index) {
          res[i.groupName].push({ ...i, groupName: null });
          return;
        }
        res[i.groupName] = [i];
      });

      let _res = [];
      Object.values(res).forEach(i => {
        _res = _res.concat(i);
      });

      return _res;
    };

    if (!data.length) {
      if (recordType !== 2) return [];
      const format = [];
      qcCheckItemConfigs.forEach(x => {
        const obj = {};
        obj.groupName = _.get(x, 'checkItem.group.name', '');
        obj.itemName = _.get(x, 'checkItem.name', '');
        obj.attachmentIds = undefined;
        obj.defect = _.get(x, 'defect');
        obj.defectPer = undefined;
        format.push(obj);
      });
      return deleteUnUseGroupName(format);
    }

    if (recordType === 1 || recordType === 0) {
      const format = [];
      data.forEach(report => {
        report.qcReportValues.forEach(reportValue => {
          format.push({
            value: this.getCheckValue(_.get(report.qcCheckItemConfig, 'logic'), reportValue),
            qrCode: reportValue.qrCode,
            seq: reportValue.seq,
            groupName: _.get(report, 'qcCheckItemConfig.checkItem.group.name', ''),
            itemName: _.get(report, 'qcCheckItemConfig.checkItem.name', ''),
            config: report.qcCheckItemConfig,
            category: reportValue.category,
            attachmentIds: reportValue.attachmentIds,
          });
        });
      });

      const _format = [];
      const groupBySeq = _.groupBy(format, 'seq');

      _.values(groupBySeq).forEach(x => {
        const obj = {};
        x.forEach(y => {
          obj[`${y.groupName}_${y.itemName}`] = y.value;
          obj[`${y.groupName}_${y.itemName}_标准`] = y.config;
          obj[`${y.groupName}_${y.itemName}_是否合格`] = y.category;
          obj[`${y.groupName}_${y.itemName}_附件`] = y.attachmentIds;
          obj['二维码'] = y.qrCode;
          obj['序号'] = y.seq;
        });
        _format.push(obj);
      });

      return _format;
    }

    const format = [];
    data.forEach(x => {
      const obj = {};
      obj.groupName = _.get(x, 'qcCheckItemConfig.checkItem.group.name', '');
      obj.itemName = _.get(x, 'qcCheckItemConfig.checkItem.name', '');
      obj.attachmentIds = x.attachmentIds;
      obj.defect = x.defect;
      obj.defectPer = replaceSign;
      if (x && x.defect) {
        const defectPer = ((x.defect / (x.defect + x.normal)) * 100).toFixed(1);
        obj.defectPer = defectPer ? `${defectPer}%` : '0.0%';
      }
      format.push(obj);
    });

    return deleteUnUseGroupName(format);
  };

  renderCheckResult = recordType => {
    const { reports, qcCheckItemConfigs, loading } = this.state;
    const dataSource = this.formatData(reports);
    // const dataSource = reports.length ? this.formatData(reports) : this.formatData(qcCheckItemConfigs);
    // const titles = reports.length ? this.getTitleByReports(reports) : this.getTitleByQcConfigs(qcCheckItemConfigs);
    const titles = this.getTitleByQcConfigs(qcCheckItemConfigs);
    if (recordType === 2) {
      const columns = this.getColumns(titles);
      return (
        <Table
          loading={loading}
          scroll={{ x: true }}
          dataSource={dataSource}
          pagination={false}
          columns={columns}
          bordered
        />
      );
    }
    return (
      <Table
        style={{ margin: 0 }}
        loading={loading}
        scroll={{ x: true, y: 400 }}
        dataSource={dataSource}
        pagination={false}
        bordered
      >
        {titles && titles.map(x => this.renderColumns(x))}
      </Table>
    );
  };

  renderSampleList = () => {
    const { sampleList } = this.state;
    const columns = [
      {
        title: '二维码',
        key: 'qrCode',
        dataIndex: 'qrCode',
        render: (qrCode, record) => {
          return qrCode ? (
            <Link
              onClick={() => {
                this.context.router.history.push(`/stock/qrCode?qrcode=${qrCode}`);
              }}
            >
              {qrCode}
            </Link>
          ) : (
              replaceSign
            );
        },
      },
    ];
    return <Table rowKey={record => record} style={{ width: 640 }} dataSource={sampleList} pagination={false} columns={columns} bordered />;
  };

  render() {
    const { recordType, sampleDefectRate } = this.state;
    return (
      <div>
        <Row>
          <Col type="title">样品结果</Col>
          <Col type="content" style={{ width: 1000 }}>
            {this.renderCheckResult(recordType)}
          </Col>
        </Row>
        {recordType === 2 ? (
          <Row>
            <Col type="title">样品列表</Col>
            <Col type="content">
              {this.renderSampleList()}
            </Col>
          </Row>
        ) : null}
        {recordType !== 2 ? (
          <Row>
            <Col type="title">抽样批不合格率</Col>
            <Col type="content">
              {this.getDefect(sampleDefectRate)}
            </Col>
          </Row>
        ) : null}
      </div>
    );
  }
}

QcReport.contextTypes = {
  router: PropTypes.object.isRequired,
};

export default withRouter(QcReport);
