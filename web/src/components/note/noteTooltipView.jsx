import React, { Component } from 'react';
import { Popover } from 'antd';
import { stringEllipsis } from 'utils/string';
import { replaceSign } from 'src/constants';

/**
 * @api {AttachmentNoteTooltipView} 备注.
 * @APIGroup AttachmentNoteTooltipView.
 * @apiParam {String} note 备注.
 * @apiParam {Obj} style -
 * @apiParam {Number} length 有无限制长度,不传默认为33,超出用Popover来展示
 * @apiExample {js} Example usage:
 * {
      title: '备注',
      dataIndex: 'attachment.note',
      key: 'storageNote',
      render: (note) => <AttachNoteTooltipView note={note} />,
    }
 */

type Props = {
  style: {},
  note: string,
  length: number
}

class AttachmentNoteTooltipView extends Component {
  props: Props
  state = {}

  render() {
    const { note, length } = this.props;
    const textLength = length || 33;
    return (
      <div>
        {
          note
            ?
            note.length > textLength
              ?
                <Popover content={note} >
                  <span>{ stringEllipsis(note, textLength)}</span>
                </Popover>
              :
                <span>{note}</span>
            :
            replaceSign
        }
      </div>
    );
  }
}

export default AttachmentNoteTooltipView;
