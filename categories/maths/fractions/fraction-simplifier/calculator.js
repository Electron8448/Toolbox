function gcd(a, b) {
  while (b !== 0n) {
    [a, b] = [b, a % b];
  }
  return a < 0n ? -a : a;
}

export function simplifyFraction(numerator, denominator) {
  const integer = /^[+-]?\d+$/;
  if (!integer.test(numerator.trim())) {
    return { field: 'numerator', error: 'Enter a whole number for the numerator.' };
  }
  if (!integer.test(denominator.trim())) {
    return { field: 'denominator', error: 'Enter a whole number for the denominator.' };
  }
  const top = BigInt(numerator.trim());
  const bottom = BigInt(denominator.trim());
  if (bottom === 0n) {
    return { field: 'denominator', error: 'The denominator cannot be zero.' };
  }
  const divisor = gcd(top, bottom) * (bottom < 0n ? -1n : 1n);
  return { numerator: top / divisor, denominator: bottom / divisor };
}

export function equivalentPage({ numerator, denominator }, topFilter, bottomFilter, start, size) {
  const top = topFilter.trim();
  const bottom = bottomFilter.trim();
  const empty = { fractions: [], nextMultiplier: null };
  if (top && !/^[+-]?\d+$/.test(top)) {
    return { ...empty, field: 'numerator', error: 'Enter a whole number for the numerator filter.' };
  }
  if (bottom && (!/^\+?\d+$/.test(bottom) || BigInt(bottom) === 0n)) {
    return { ...empty, field: 'denominator', error: 'Enter a positive whole number for the denominator filter.' };
  }

  // Reduced fractions generate all equivalents with positive integer multipliers.
  const targetTop = top ? BigInt(top) : null;
  const targetBottom = bottom ? BigInt(bottom) : null;
  let multiplier = null;
  if (targetBottom !== null) {
    if (targetBottom % denominator !== 0n) return empty;
    multiplier = targetBottom / denominator;
  } else if (targetTop !== null && numerator !== 0n) {
    if (targetTop % numerator !== 0n) return empty;
    multiplier = targetTop / numerator;
  }
  if (targetTop !== null && numerator === 0n && targetTop !== 0n) return empty;
  if (multiplier !== null) {
    if (multiplier < 1n || (targetTop !== null && numerator * multiplier !== targetTop)) return empty;
    return { ...empty, fractions: [{ numerator: numerator * multiplier, denominator: denominator * multiplier }] };
  }

  const fractions = Array.from({ length: size }, (_, index) => {
    const factor = start + BigInt(index);
    return { numerator: numerator * factor, denominator: denominator * factor };
  });
  return { fractions, nextMultiplier: start + BigInt(size) };
}
