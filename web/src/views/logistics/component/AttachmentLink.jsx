import React from 'react';
import { Attachment, Link, openModal } from 'components';
import { getAttachments } from 'services/attachment';

const AttachmentImageView = Attachment.ImageView;

class AttachmentLink extends React.PureComponent<any> {
  state = {};

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

  render() {
    const { attachments } = this.props;
    return attachments && attachments.length > 0 ? (
      <Link
        icon="picture"
        onClick={() => {
          this.showPhoto(attachments);
        }}
      >
        {attachments.length}
      </Link>
    ) : null;
  }
}

export default AttachmentLink;
