export const PORJECT_BASE_URL = '/cooperate/projects';
export const projectDetailUrl = ({ code }) => `${PORJECT_BASE_URL}/${encodeURIComponent(code)}/detail`;

/**
 * 项目详情
 * @param {String} code 项目编号
 */
export function toProjectDetail({ code }): String {
  return projectDetailUrl({ code });
}

export default 'dummy';
