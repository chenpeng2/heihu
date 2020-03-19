import React from 'react';
import { wrapUrl } from 'utils/attachment';

export default function RenderImg({ id, ...rest }: any) {
  if (!id) {
    return null;
  }
  return <img {...rest} src={wrapUrl(id)} alt="" />;
}
