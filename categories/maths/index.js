import algebra from './algebra/index.js';
import fractions from './fractions/index.js';

export default {
  name: 'Maths',
  path: '/maths',
  icon: '÷',
  theme: 'maths',
  description: 'Useful mathematical tools for calculations and problem-solving.',
  groups: [fractions, algebra]
};
