import { field, choice, tool, requireValue } from '../../tool-fields.js';
import { simplifyFraction } from './fraction-simplifier/calculator.js';

const base = '/maths/fractions';
const fraction = (name, label) => field(name, label, 'text');
function read(value) {
  const parts = value.split('/');
  requireValue(parts.length === 2, 'Enter each fraction in the format 3/4.');
  const result = simplifyFraction(...parts);
  requireValue(!result.error, result.error);
  return [result.numerator, result.denominator];
}
function decimal(top, bottom, suffix = '') {
  const sign = top < 0n ? '-' : '';
  const magnitude = top < 0n ? -top : top;
  const precision = 16n;
  const scale = 10n ** precision;
  const scaled = (magnitude * scale * 2n + bottom) / (bottom * 2n);
  const fraction = String(scaled % scale).padStart(Number(precision), '0').replace(/0+$/, '');
  const exact = magnitude * scale % bottom === 0n;
  return (exact ? '' : '≈ ') + sign + (scaled / scale) + (fraction ? '.' + fraction : '') + suffix;
}
export default [
  tool(base, 'fraction-calculator', 'Fraction Calculator', 'Add, subtract, multiply or divide two fractions.',
    [fraction('first', 'First fraction (e.g. 3/4)'), choice('operation', 'Operation', [['add','Add'],['subtract','Subtract'],['multiply','Multiply'],['divide','Divide']]), fraction('second', 'Second fraction (e.g. 1/2)')],
    ({ first, second, operation }) => {
      const [a,b] = read(first), [c,d] = read(second);
      const pairs = { add: [a*d+c*b,b*d], subtract: [a*d-c*b,b*d], multiply: [a*c,b*d], divide: [a*d,b*c] };
      const result = simplifyFraction(...pairs[operation].map(String));
      requireValue(!result.error, 'You cannot divide by a zero fraction.');
      return result.numerator + '/' + result.denominator;
    }),
  tool(base, 'fraction-to-decimal-converter', 'Fraction to Decimal Converter', 'Convert a fraction to a decimal.',
    [fraction('value', 'Fraction (e.g. 3/4)')], ({ value }) => decimal(...read(value))),
  tool(base, 'fraction-to-percentage-converter', 'Fraction to Percentage Converter', 'Convert a fraction to a percentage.',
    [fraction('value', 'Fraction (e.g. 3/4)')], ({ value }) => {
      const [top,bottom] = read(value);
      return decimal(top * 100n, bottom, '%');
    })
];
