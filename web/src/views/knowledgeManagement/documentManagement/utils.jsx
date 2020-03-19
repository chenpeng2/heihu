import React from 'react';
import { Icon, Tooltip } from 'components';

export const formatFolders = folders =>
  folders &&
  folders.map(e => ({
    ...e,
    key: e.id,
    title: <Tooltip length={12} text={e.name} />,
    style: { padding: '5px 0' },
    icon: <Icon type="folder" />,
    children: formatFolders(e.childrenFolders),
  }));

export const formatFile = file => ({
  ...file,
  attachments: [file.attachment],
});

export const formatFolder = folder => ({
  ...folder,
});

export const fileStatusMap = {
  0: '已归档',
  1: '已发布',
};

export default 'dummy';
