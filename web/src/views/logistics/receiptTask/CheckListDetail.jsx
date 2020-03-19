import React from 'react';
import { getReceiptCheckListDetail } from 'services/shipment/receiptTask';
import { getSendCheckListDetail } from 'services/shipment/sendTask';
import { getAttachments } from 'services/attachment';
import RenderImg from 'components/attachment/renderImg';
import { format } from '../../../utils/time';
import Item from '../component/Item';
import styles from '../receiptConfig/receiptConfig.scss';
import { Attachment, Link, openModal } from '../../../components';

const AttachmentImageView = Attachment.ImageView;

const style = {
  label: {
    display: 'inline-block',
    width: 100,
    textAlign: 'right',
    marginRight: 10,
    opacity: 0.6,
    marginBottom: 10,
  },
};

class CheckListDetail extends React.PureComponent {
  state = {
    detail: {},
    images: [],
    no: '',
  };

  componentDidMount() {
    this.setInitialData();
  }

  showPhoto = async ids => {
    const { data: { data } } = await getAttachments(ids);
    openModal({
      title: '附件',
      footer: null,
      children: (
        <AttachmentImageView
          attachment={{
            files: data.map(file => {
              return {
                ...file,
                originalFileName: file.original_filename,
                originalExtension: file.original_extension,
              };
            }),
          }}
        />
      ),
    });
  };

  setInitialData = async () => {
    const { match: { params: { checkId, id } }, location: { query: { no, type } } } = this.props;
    const { data: { data } } = await (type === 'receipt'
      ? getReceiptCheckListDetail(id, checkId)
      : getSendCheckListDetail(id, checkId));
    const { data: { data: images } } = await getAttachments(data.attachments);
    this.setState({ detail: data, images, no });
  };

  render() {
    const { detail, images, no } = this.state;
    const { items, operatorName, startTime, endTime, submitted } = detail || {};
    return (
      <div style={{ margin: 20 }}>
        <h3>单号：{no}</h3>
        <Item title="检查任务信息" style={{ marginBottom: 20 }}>
          <div>
            <p>
              <span style={style.label}>检查状态</span> {submitted ? '已' : '未'}提交
            </p>
            <p>
              <span style={style.label}>检查执行人</span> {operatorName}
            </p>
            <p>
              <span style={style.label}>检查时间</span>
              {format(startTime)}-{format(endTime)}
            </p>
          </div>
        </Item>
        <Item title="检查项及结果" style={{ marginBottom: 20 }}>
          <div className={styles.content} style={{ margin: 0 }}>
            {items &&
              items.map(({ name, value, attachments }) => (
                <span className={styles.qcItem} key={name}>
                  <span className={styles.label}>
                    <span className="circle" />&nbsp; {name}：
                  </span>
                  {value}
                  {attachments.length > 0 && (
                    <Link
                      icon="picture"
                      style={{ marginLeft: 10 }}
                      onClick={() => {
                        this.showPhoto(attachments);
                      }}
                    >
                      {attachments.length}
                    </Link>
                  )}
                </span>
              ))}
          </div>
        </Item>
        <Item title="全局拍照及备注" style={{ marginBottom: 20 }}>
          <div>
            {images.map(({ createdAt, id }) => (
              <div style={{ marginRight: 30, display: 'inline-block' }}>
                <div
                  style={{
                    borderRadius: 20,
                    overflow: 'hidden',
                    width: 100,
                    height: 100,
                    marginBottom: 5,
                  }}
                >
                  <RenderImg id={id} key={id} style={{ width: 100, height: 100 }} />
                </div>
                <span>{format(createdAt)}</span>
              </div>
            ))}
            <p>
              <span style={{ ...style.label, width: 'auto' }}>备注</span> {detail.remark || '-'}
            </p>
          </div>
        </Item>
      </div>
    );
  }
}

export default CheckListDetail;
