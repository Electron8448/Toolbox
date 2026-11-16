import maths from './maths/index.js';
import writing from './writing/index.js';

export const categories = [maths, writing];
export const groups = categories.flatMap(category => category.groups.map(group => {
  const path = group.tools[0].path.slice(0, group.tools[0].path.lastIndexOf('/'));
  return { ...group, path, category };
}));
export const tools = groups.flatMap(group => group.tools.map(tool => ({ ...tool, category: group.category, group })));
