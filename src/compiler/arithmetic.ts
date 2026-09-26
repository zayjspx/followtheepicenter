// A deliberately small arithmetic language: identifiers, finite decimal literals,
// parentheses, unary signs, + - * /. No eval, calls, property access or assignments.
export type Quantity = { value: number; dimensions: [number, number, number, number] };
const units: Record<string, { scale: number; dimensions: Quantity['dimensions'] }> = {
  // Pixel extent is a separate dimension, never an implicit physical length.
  px: { scale: 1, dimensions: [0, 0, 0, 1] },
  '1': { scale: 1, dimensions: [0, 0, 0, 0] },
  m: { scale: 1, dimensions: [1, 0, 0, 0] }, cm: { scale: 0.01, dimensions: [1, 0, 0, 0] },
  mm: { scale: 0.001, dimensions: [1, 0, 0, 0] },
  s: { scale: 1, dimensions: [0, 1, 0, 0] }, ms: { scale: 0.001, dimensions: [0, 1, 0, 0] },
  us: { scale: 0.000001, dimensions: [0, 1, 0, 0] },
  Hz: { scale: 1, dimensions: [0, -1, 0, 0] },
  'm/s': { scale: 1, dimensions: [1, -1, 0, 0] },
  kg: { scale: 1, dimensions: [0, 0, 1, 0] }, g: { scale: 0.001, dimensions: [0, 0, 1, 0] }
};
function unit(name: string) {
  const result = Object.hasOwn(units, name) ? units[name] : undefined;
  if (!result) throw new Error('Unsupported unit: ' + name);
  return result;
}
export function quantity(value: number, name: string): Quantity {
  const u = unit(name);
  const result = value * u.scale;
  if (!Number.isFinite(result)) throw new Error('Non-finite quantity');
  return { value: result, dimensions: [...u.dimensions] };
}
function same(a: Quantity, b: Quantity) { return a.dimensions.every((v, i) => v === b.dimensions[i]); }
export function convert(value: Quantity, output: string) {
  const target = quantity(1, output);
  if (!same(value, target)) throw new Error('Output unit dimension mismatch: ' + output);
  const result = value.value / target.value;
  if (!Number.isFinite(result)) throw new Error('Non-finite output');
  return result;
}
export function evaluate(expression: string, inputs: Record<string, Quantity>): Quantity {
  if (expression.length > 4096) throw new Error('Expression too long');
  const tokens = expression.match(/(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?|[A-Za-z_][A-Za-z0-9_]*|[()+*/-]|\S/g) ?? [];
  let cursor = 0;
  function atom(): Quantity {
    const token = tokens[cursor++];
    if (token === '+' || token === '-') {
      const a = atom(); return { ...a, value: token === '-' ? -a.value : a.value };
    }
    if (token === '(') {
      const a = sum();
      if (tokens[cursor++] !== ')') throw new Error('Missing closing parenthesis');
      return a;
    }
    if (token && /^(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?$/.test(token)) return quantity(Number(token), '1');
    if (token && Object.hasOwn(inputs, token)) return inputs[token];
    throw new Error('Unknown input or unsupported syntax: ' + token);
  }
  function combine(a: Quantity, b: Quantity, op: string): Quantity {
    if ((op === '+' || op === '-') && !same(a, b)) throw new Error('Incompatible dimensions in addition/subtraction');
    if (op === '/' && b.value === 0) throw new Error('Division by zero');
    const value = op === '+' ? a.value + b.value : op === '-' ? a.value - b.value : op === '*' ? a.value * b.value : a.value / b.value;
    if (!Number.isFinite(value)) throw new Error('Non-finite arithmetic');
    return { value, dimensions: op === '+' || op === '-' ? a.dimensions : a.dimensions.map((v, i) => v + (op === '*' ? b.dimensions[i] : -b.dimensions[i])) as Quantity['dimensions'] };
  }
  function product(): Quantity {
    let a = atom();
    while (tokens[cursor] === '*' || tokens[cursor] === '/') { const op = tokens[cursor++]; a = combine(a, atom(), op); }
    return a;
  }
  function sum(): Quantity {
    let a = product();
    while (tokens[cursor] === '+' || tokens[cursor] === '-') { const op = tokens[cursor++]; a = combine(a, product(), op); }
    return a;
  }
  const value = sum();
  if (cursor !== tokens.length) throw new Error('Unsupported trailing expression');
  return value;
}

export function isPhysical(value: Quantity) {
  return value.dimensions[3] === 0 && value.dimensions.slice(0, 3).some(d => d !== 0);
}
