import test from 'node:test';
import assert from 'node:assert/strict';
import { generateLocalExtension } from '../public/generator.js';

const fakeScratch = () => {
  let extension;
  const Scratch = {
    BlockType: { REPORTER: 'reporter', COMMAND: 'command', BOOLEAN: 'boolean' },
    ArgumentType: { NUMBER: 'number', STRING: 'string', BOOLEAN: 'boolean' },
    extensions: { register(value) { extension = value; } },
  };
  return { Scratch, getExtension: () => extension };
};

test('local generator extracts a Russian extension name and infers math blocks', () => {
  const result = generateLocalExtension('Создай расширение «Умная математика»: сумма и округление.');
  assert.equal(result.name, 'Умная математика');
  assert.equal(result.category, 'math');
  assert.equal(result.blocks.length, 3);
  assert.match(result.code, /Scratch\.extensions\.register/);
  assert.match(result.id, /^[a-z][a-z0-9_]*$/);
});

test('space prompts get a useful planet and gravity block pack', () => {
  const result = generateLocalExtension('Создай расширение «Космос»: температура планет и сила гравитации.');
  assert.equal(result.category, 'space');
  assert.match(result.code, /planetTemperature\(args\)/);
  assert.match(result.code, /planetGravity\(args\)/);
});

test('an explicitly selected category takes precedence over automatic inference', () => {
  const result = generateLocalExtension('Создай расширение «Игровой таймер» с отсчётом секунд.', 'text');
  assert.equal(result.category, 'text');
  assert.match(result.code, /wordCount\(args\)/);
});

test('generated source parses and registers an extension with working math methods', () => {
  const result = generateLocalExtension('Расширение «Калькулятор»', 'math');
  assert.doesNotThrow(() => new Function('Scratch', result.code));
  const fixture = fakeScratch();
  new Function('Scratch', result.code)(fixture.Scratch);
  const extension = fixture.getExtension();
  const info = extension.getInfo();
  assert.equal(info.name, 'Калькулятор');
  assert.equal(info.blocks.length, 3);
  assert.equal(extension.sum({ A: 12, B: 8 }), 20);
  assert.equal(extension.roundNumber({ NUMBER: 4.6 }), 5);
});

test('every local category generates valid JavaScript source', () => {
  for (const category of ['math', 'text', 'game', 'utility', 'sensor', 'time', 'sound', 'space', 'internet']) {
    const result = generateLocalExtension(`Расширение «Проверка ${category}»`, category);
    assert.doesNotThrow(() => new Function('Scratch', result.code), `${category} pack should parse`);
  }
});

test('text extension handles empty text and Unicode characters', () => {
  const result = generateLocalExtension('Текстовые инструменты для слов', 'text');
  const fixture = fakeScratch();
  new Function('Scratch', result.code)(fixture.Scratch);
  const extension = fixture.getExtension();
  assert.equal(extension.wordCount({ TEXT: '   ' }), 0);
  assert.equal(extension.reverseText({ TEXT: 'Кот' }), 'тоК');
  assert.equal(extension.uppercase({ TEXT: 'Привет' }), 'ПРИВЕТ');
});
