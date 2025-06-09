import { assert, test } from '@rstest/core';
import {
	reduceConfigs,
	reduceConfigsMergeContext,
	reduceConfigsWithContext,
} from '../dist/index.js';

test('reduceConfigs should return initial config', () => {
	assert.deepStrictEqual(reduceConfigs({ initial: { value: 'a' } }), {
		value: 'a',
	});
});

test('reduceConfigs should merge initial config', () => {
	assert.deepStrictEqual(
		reduceConfigs({
			initial: { name: 'a' },
			config: {
				name: 'b',
				custom: 'c',
			},
		}),
		{
			name: 'b',
			custom: 'c',
		},
	);
});

test('reduceConfigs should support custom merge function', () => {
	const merge = (target, source) => {
		for (const key in source) {
			if (Object.hasOwn(target, key)) {
				target[key] += source[key];
			} else {
				target[key] = source[key];
			}
		}
		return target;
	};

	assert.deepStrictEqual(
		reduceConfigs({
			initial: {
				a: 1,
				b: 'b',
			},
			config: {
				a: 2,
				b: 'b',
				c: 'c',
			},
			mergeFn: merge,
		}),
		{
			a: 3,
			b: 'bb',
			c: 'c',
		},
	);
});

test('reduceConfigs should support function or object array', () => {
	const initial = { a: 'a' };

	const config = [
		{ b: 'b' },
		(o, { add }) => {
			o.c = add(1, 2);
		},
		(o) => ({
			...o,
			d: 'd',
		}),
		{ e: 'e' },
	];

	assert.deepStrictEqual(
		reduceConfigsWithContext({
			initial,
			config,
			ctx: {
				add: (a, b) => a + b,
			},
		}),
		{
			a: 'a',
			b: 'b',
			c: 3,
			d: 'd',
			e: 'e',
		},
	);
});

test('reduceConfigs should support function and merge context', () => {
	const initial = { a: 'a' };

	const config = [
		{ b: 'b' },
		({ value, add }) => {
			value.c = add(1, 2);
		},
		({ value }) => ({
			...value,
			d: 'd',
		}),
		{ e: 'e' },
	];

	assert.deepStrictEqual(
		reduceConfigsMergeContext({
			initial,
			config,
			ctx: {
				add: (a, b) => a + b,
			},
		}),
		{
			a: 'a',
			b: 'b',
			c: 3,
			d: 'd',
			e: 'e',
		},
	);
});

test('reduceConfigs should allow false as config', () => {
	assert.strictEqual(
		reduceConfigs({
			initial: 'head',
			config: false,
		}),
		false,
	);

	assert.strictEqual(
		reduceConfigs({
			initial: 'head',
			config: () => false,
		}),
		false,
	);

	assert.strictEqual(
		reduceConfigs({
			initial: 'head',
			config: ['head', 'head', () => false],
		}),
		false,
	);
});
