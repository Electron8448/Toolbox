import maths from './maths/index.js';
import writing from './writing/index.js';

export const categories = [maths, writing];
export const tools = categories.flatMap(category => category.groups.flatMap(group =>
  group.tools.map(tool => ({ ...tool, category, group }))
));
