import React, { Component } from 'react';
import { Icon, Button, FormattedMessage } from 'components';
import { warning } from 'styles/color';
import { syncProcessWorkstations, syncProcessAttachments, syncProcessDeliverable } from 'src/services/process';
import { changeChineseToLocaleWithoutIntl } from 'utils/locale/utils';

class SyncModal extends Component {
  props: {
    onClose: () => {},
    onCancel: () => {},
    addedWorkstations: [],
    deletedWorkstations: [],
    processCode: String,
    addedAttachments: [],
    deletedAttachments: [],
    newDeliverable: boolean,
  };
  state = {};

  render() {
    const {
      onClose,
      onCancel,
      addedWorkstations,
      deletedWorkstations,
      processCode,
      addedAttachments,
      deletedAttachments,
      newDeliverable,
    } = this.props;
    return (
      <div style={{ padding: 20 }}>
        <div>
          {(Array.isArray(addedWorkstations) && addedWorkstations.length) ||
          (Array.isArray(deletedWorkstations) && deletedWorkstations.length) ? (
            <div style={{ display: 'flex', marginBottom: 20 }}>
              <Icon type={'exclamation-circle-o'} style={{ fontSize: 36, color: warning }} />
              <div style={{ marginLeft: 10 }}>
                <div style={{ fontSize: 22 }}>
                  <FormattedMessage defaultMessage={'工位已更新'} />
                </div>
                <div>
                  <FormattedMessage
                    defaultMessage={
                      '是否将本次改动（增加{addMount}个工位，删除{deleteMount}个工位）同步至全部工艺路线和生产BOM中？'
                    }
                    values={{ addMount: addedWorkstations.length, deleteMount: deletedWorkstations.length }}
                  />
                </div>
              </div>
            </div>
          ) : null}
          {(Array.isArray(addedAttachments) && addedAttachments.length) ||
          (Array.isArray(deletedAttachments) && deletedAttachments.length) ? (
            <div style={{ display: 'flex' }}>
              <Icon type={'exclamation-circle-o'} style={{ fontSize: 36, color: warning }} />
              <div style={{ marginLeft: 10 }}>
                <div style={{ fontSize: 22 }}>
                  <FormattedMessage defaultMessage={'附件已更新'} />
                </div>
                <div>
                  <FormattedMessage
                    defaultMessage={
                      '是否将本次改动（增加{addMount}个附件，删除{deleteMount}个附件）同步至全部工艺路线和生产BOM中？'
                    }
                    values={{ addMount: addedAttachments.length, deleteMount: deletedAttachments.length }}
                  />
                </div>
              </div>
            </div>
          ) : null}
          {newDeliverable !== undefined ? (
            <div style={{ display: 'flex' }}>
              <Icon type={'exclamation-circle-o'} style={{ fontSize: 36, color: warning }} />
              <div style={{ marginLeft: 10 }}>
                <div style={{ fontSize: 22 }}>
                  <FormattedMessage defaultMessage={'任务下发审批已更新'} />
                </div>
                <div>
                  <span>
                    {changeChineseToLocaleWithoutIntl(
                      '任务下发审批已更改为<{newDeliverable}>，是否将本次改动同步至全部工艺路线和生产BOM中？',
                      {
                        newDeliverable: newDeliverable ? '是' : '否',
                      },
                    )}
                  </span>
                </div>
              </div>
            </div>
          ) : null}
        </div>
        <div style={{ marginTop: 30 }}>
          <Button style={{ marginLeft: 60, width: 100 }} onClick={() => onCancel()} type="ghost">
            暂不同步
          </Button>
          <Button
            style={{ marginLeft: 30, width: 100 }}
            onClick={async () => {
              if (
                (Array.isArray(addedWorkstations) && addedWorkstations.length) ||
                (Array.isArray(deletedWorkstations) && deletedWorkstations.length)
              ) {
                await syncProcessWorkstations({
                  processCode,
                  addWorkstationIds: addedWorkstations,
                  removeWorkstationIds: deletedWorkstations,
                });
              }

              if (
                (Array.isArray(addedAttachments) && addedAttachments.length) ||
                (Array.isArray(deletedAttachments) && deletedAttachments.length)
              ) {
                await syncProcessAttachments({
                  processCode,
                  addAttachmentIds: addedAttachments,
                  removeAttachmentIds: deletedAttachments,
                });
              }
              if (newDeliverable !== undefined) {
                await syncProcessDeliverable({
                  processCode,
                  deliverable: newDeliverable,
                });
              }
              onClose();
            }}
          >
            同步
          </Button>
        </div>
      </div>
    );
  }
}

export default SyncModal;
