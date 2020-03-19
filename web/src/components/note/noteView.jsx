import React, { Component } from 'react';
import Card from 'components/card';

/**
 * @api {AttachmentNoteView} 附件备注.
 * @APIGroup AttachmentNoteView.
 * @apiParam {Obj} attachment 不填return null;后端拿到的attachment字段.
 * @apiExample {js} Example usage:
 * <AttachmentImageView attachment={attachment} />
 */

const bodyStyle = {
  paddingLeft: 80,
  paddingRight: 80,
};

const titleStyle = {
  color: '#0DC7A3',
  fontSize: 14,
};

const cardStyle = {
  padding: 20,
  fontSize: 12,
};

type Props = {
  note: string,
};

class AttachmentNoteView extends Component {
  props: Props;

  state = {};

  render() {
    const { note } = this.props;
    if (!note) { return null; }
    return (
      <div style={bodyStyle}>
        <div style={titleStyle}>备注</div>
        <Card style={cardStyle}>
          {note}
        </Card>
      </div>

    );
  }
}

export default AttachmentNoteView;
