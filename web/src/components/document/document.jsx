import React, { Component } from 'react';
import { Icon, openModal } from 'components';
import Button from 'components/button';
import { secondaryGrey } from 'src/styles/color';
import styles from './styles.scss';
import AddDocumentModal from './addDocumentModal';

type Props = {
  onChange: () => {},
  value: [],
  buttonStyle: {},
  buttonType: String,
  max: number,
  style: {},
  extraText: String,
  onChange: () => {},
};

class Document extends Component {
  props: Props;

  state = {};

  componentWillMount() {
    this.setState({
      value: this.props.value,
    });
  }

  componentWillReceiveProps(nextProps) {
    if ((this.state.value || nextProps.value) && this.state.value !== nextProps.value) {
      this.setState({
        value: nextProps.value,
      });
    }
  }

  renderFileList() {
    const { onChange } = this.props;
    const { value, hoverIndex } = this.state;
    return value && value.length ? (
      <div className={styles.listContainer}>
        {value.map(({ originalFileName, ...rest }, index) => {
          return (
            <div
              className={styles.listItem}
              onMouseEnter={() => this.setState({ hoverIndex: index })}
              onMouseLeave={() => this.setState({ hoverIndex: undefined })}
            >
              <div className={styles.listInfo} style={hoverIndex === index ? { backgroundColor: 'rgba(2, 185, 128, 0.1)' } : null}>
                <Icon type="paper-clip" style={{ position: 'absolute', top: 6 }} />
                <span
                  style={{
                    display: 'inline-block',
                    width: '100%',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    paddingLeft: 16,
                  }}
                >
                  {originalFileName}
                </span>
              </div>
              <Icon
                className={styles.closeIcon}
                style={hoverIndex === index ? { opacity: 1 } : {}}
                type="close"
                onClick={() => {
                  value.splice(index, 1);
                  onChange(value);
                }}
              />
            </div>
          );
        })}
      </div>
    ) : null;
  }

  render() {
    const { buttonStyle, max, style, onChange, extraText } = this.props;
    const { value } = this.state;
    return (
      <div className={value && value.length !== 0 ? 'uploadBox' : null} style={{ ...style }}>
        <div>
          <Button
            onClick={() => {
              openModal(
                {
                  title: '添加文档',
                  children: <AddDocumentModal />,
                  footer: null,
                  onOk: addedDocuments => {
                    const addedValue = addedDocuments
                      .filter(document => document.attachment)
                      .map(document => ({ ...document.attachment, restId: document.attachment.id }));
                    let newValue;
                    if (!value) {
                      newValue = addedValue;
                    } else {
                      newValue = value.concat(addedValue);
                    }
                    this.setState({ value: newValue });
                    onChange(newValue);
                  },
                  width: '80%',
                },
                this.context,
              );
            }}
            disabled={max ? value && value.length >= max : false}
            style={{ ...buttonStyle }}
            ghost
            iconType="gc"
            icon="xuanzewendang"
          >
            添加文档
          </Button>
          <span style={{ marginLeft: 10, color: secondaryGrey }}>{extraText || null}</span>
        </div>
        {value ? this.renderFileList() : null}
      </div>
    );
  }
}

export default Document;
