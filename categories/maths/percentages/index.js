import { field, choice, tool, requireValue, format } from '../../tool-fields.js';
const base = '/maths/percentages';
const number = () => field('number', 'Number');
const percent = () => field('percent', 'Percentage');
export default { name: 'Percentages', tools: [
  tool(base, 'percentage-calculator', 'Percentage Calculator', 'Find a percentage of a number.',
    [number(), percent()], ({number, percent}) => format(number * (percent / 100))),
  tool(base, 'percentage-increase-and-decrease-calculator', 'Percentage Increase and Decrease Calculator',
    'Increase or decrease a number by a percentage.', [number(), percent(), choice('direction','Change',[['increase','Increase'],['decrease','Decrease']])],
    ({number, percent, direction}) => {
      requireValue(percent >= 0, 'Enter a non-negative percentage.');
      const change = number * (percent / 100) * (direction === 'increase' ? 1 : -1);
      return 'New value: ' + format(number + change) + '\nAmount of change: ' + format(Math.abs(change));
    }),
  tool(base, 'percentage-difference-calculator', 'Percentage Difference Calculator', 'Compare two values relative to their average magnitude.',
    [field('a','First number'),field('b','Second number')], ({a,b}) => {
      requireValue(a !== 0 || b !== 0, 'Percentage difference is undefined when both values are zero.');
      const scale = Math.max(Math.abs(a), Math.abs(b));
      const first = a / scale, second = b / scale;
      return format(200 * Math.abs(first - second) / (Math.abs(first) + Math.abs(second))) + '%';
    })
]};
