export const CATEGORY_LIST = [
  { id: 'auto', label: 'Авто', color: '#7658e8' },
  { id: 'math', label: 'Математика', color: '#6c63e8' },
  { id: 'text', label: 'Текст', color: '#ee7c4b' },
  { id: 'game', label: 'Игры', color: '#e8a42d' },
  { id: 'utility', label: 'Утилиты', color: '#32a77a' },
  { id: 'sensor', label: 'Датчики', color: '#238eb2' },
  { id: 'time', label: 'Таймеры', color: '#df6683' },
  { id: 'sound', label: 'Звук', color: '#a75bd2' },
  { id: 'space', label: 'Космос', color: '#5473d8' },
  { id: 'internet', label: 'Интернет', color: '#4989db' },
];

const ARG = (type, defaultValue) => ({ type, defaultValue });

const PACKS = {
  math: {
    color: '#6c63e8',
    blocks: [
      {
        opcode: 'sum', blockType: 'REPORTER', text: 'сумма [A] + [B]',
        arguments: { A: ARG('NUMBER', 5), B: ARG('NUMBER', 7) },
        summary: 'Складывает два числа.',
        implementation: 'return Number(args.A) + Number(args.B);',
      },
      {
        opcode: 'randomInteger', blockType: 'REPORTER', text: 'случайное целое от [MIN] до [MAX]',
        arguments: { MIN: ARG('NUMBER', 1), MAX: ARG('NUMBER', 100) },
        summary: 'Выбирает случайное целое число из диапазона.',
        implementation: `const first = Number(args.MIN) || 0;\n    const second = Number(args.MAX) || 0;\n    const min = Math.ceil(Math.min(first, second));\n    const max = Math.floor(Math.max(first, second));\n    return Math.floor(Math.random() * (max - min + 1)) + min;`,
      },
      {
        opcode: 'roundNumber', blockType: 'REPORTER', text: 'округлить [NUMBER]',
        arguments: { NUMBER: ARG('NUMBER', 3.6) },
        summary: 'Округляет число до ближайшего целого.',
        implementation: 'return Math.round(Number(args.NUMBER) || 0);',
      },
    ],
  },
  text: {
    color: '#ee7c4b',
    blocks: [
      {
        opcode: 'uppercase', blockType: 'REPORTER', text: 'заглавными буквами [TEXT]',
        arguments: { TEXT: ARG('STRING', 'Привет, мир!') },
        summary: 'Преобразует текст в верхний регистр.',
        implementation: "return String(args.TEXT ?? '').toLocaleUpperCase('ru-RU');",
      },
      {
        opcode: 'wordCount', blockType: 'REPORTER', text: 'количество слов в [TEXT]',
        arguments: { TEXT: ARG('STRING', 'Раз два три') },
        summary: 'Считает слова, разделённые пробелами.',
        implementation: "const text = String(args.TEXT ?? '').trim();\n    return text ? text.split(/\\s+/u).length : 0;",
      },
      {
        opcode: 'reverseText', blockType: 'REPORTER', text: 'перевернуть текст [TEXT]',
        arguments: { TEXT: ARG('STRING', 'Scratch') },
        summary: 'Возвращает строку в обратном порядке.',
        implementation: "return [...String(args.TEXT ?? '')].reverse().join('');",
      },
    ],
  },
  game: {
    color: '#e8a42d',
    blocks: [
      {
        opcode: 'rollDice', blockType: 'REPORTER', text: 'бросить кубик на [SIDES] граней',
        arguments: { SIDES: ARG('NUMBER', 6) },
        summary: 'Возвращает случайное значение от 1 до числа граней.',
        implementation: 'const sides = Math.max(2, Math.floor(Number(args.SIDES) || 6));\n    return Math.floor(Math.random() * sides) + 1;',
      },
      {
        opcode: 'distance', blockType: 'REPORTER', text: 'расстояние от [X1], [Y1] до [X2], [Y2]',
        arguments: {
          X1: ARG('NUMBER', 0), Y1: ARG('NUMBER', 0),
          X2: ARG('NUMBER', 100), Y2: ARG('NUMBER', 100),
        },
        summary: 'Считает расстояние между двумя точками.',
        implementation: 'const dx = Number(args.X2) - Number(args.X1);\n    const dy = Number(args.Y2) - Number(args.Y1);\n    return Math.hypot(dx, dy);',
      },
      {
        opcode: 'randomItem', blockType: 'REPORTER', text: 'случайный элемент из [ITEMS]',
        arguments: { ITEMS: ARG('STRING', 'кот, пёс, лиса') },
        summary: 'Выбирает один элемент из списка через запятую.',
        implementation: "const items = String(args.ITEMS ?? '').split(',').map(item => item.trim()).filter(Boolean);\n    if (!items.length) return '';\n    return items[Math.floor(Math.random() * items.length)];",
      },
    ],
  },
  utility: {
    color: '#32a77a',
    blocks: [
      {
        opcode: 'currentTime', blockType: 'REPORTER', text: 'текущее время',
        arguments: {},
        summary: 'Показывает локальное время устройства.',
        implementation: "return new Date().toLocaleTimeString('ru-RU');",
      },
      {
        opcode: 'randomColor', blockType: 'REPORTER', text: 'случайный цвет в HEX',
        arguments: {},
        summary: 'Создаёт случайный цвет в формате #RRGGBB.',
        implementation: "return '#' + Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0');",
      },
      {
        opcode: 'clampNumber', blockType: 'REPORTER', text: 'ограничить [NUMBER] от [MIN] до [MAX]',
        arguments: { NUMBER: ARG('NUMBER', 12), MIN: ARG('NUMBER', 0), MAX: ARG('NUMBER', 10) },
        summary: 'Оставляет число внутри заданного диапазона.',
        implementation: 'const value = Number(args.NUMBER) || 0;\n    const min = Math.min(Number(args.MIN) || 0, Number(args.MAX) || 0);\n    const max = Math.max(Number(args.MIN) || 0, Number(args.MAX) || 0);\n    return Math.min(max, Math.max(min, value));',
      },
    ],
  },
  sensor: {
    color: '#238eb2',
    blocks: [
      {
        opcode: 'screenWidth', blockType: 'REPORTER', text: 'ширина окна браузера',
        arguments: {},
        summary: 'Возвращает ширину окна в пикселях.',
        implementation: 'return typeof window === \'undefined\' ? 0 : window.innerWidth;',
      },
      {
        opcode: 'screenHeight', blockType: 'REPORTER', text: 'высота окна браузера',
        arguments: {},
        summary: 'Возвращает высоту окна в пикселях.',
        implementation: 'return typeof window === \'undefined\' ? 0 : window.innerHeight;',
      },
      {
        opcode: 'isTouchDevice', blockType: 'BOOLEAN', text: 'это сенсорное устройство?',
        arguments: {},
        summary: 'Проверяет, поддерживает ли устройство касания.',
        implementation: "return typeof navigator !== 'undefined' && ((typeof window !== 'undefined' && 'ontouchstart' in window) || navigator.maxTouchPoints > 0);",
      },
    ],
  },
  time: {
    color: '#df6683',
    blocks: [
      {
        opcode: 'startTimer', blockType: 'COMMAND', text: 'запустить мой таймер',
        arguments: {},
        summary: 'Запоминает текущий момент как начало таймера.',
        implementation: 'this._timerStartedAt = Date.now();',
      },
      {
        opcode: 'elapsedSeconds', blockType: 'REPORTER', text: 'прошло секунд на таймере',
        arguments: {},
        summary: 'Показывает время с момента запуска таймера.',
        implementation: 'return this._timerStartedAt ? (Date.now() - this._timerStartedAt) / 1000 : 0;',
      },
      {
        opcode: 'resetTimer', blockType: 'COMMAND', text: 'сбросить мой таймер',
        arguments: {},
        summary: 'Сбрасывает таймер и начинает отсчёт заново.',
        implementation: 'this._timerStartedAt = Date.now();',
      },
    ],
  },
  sound: {
    color: '#a75bd2',
    blocks: [
      {
        opcode: 'playTone', blockType: 'COMMAND', text: 'проиграть тон [FREQUENCY] Гц [SECONDS] секунд',
        arguments: { FREQUENCY: ARG('NUMBER', 440), SECONDS: ARG('NUMBER', 0.5) },
        summary: 'Создаёт короткий тон средствами Web Audio.',
        implementation: `const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    const context = new AudioContextClass();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.frequency.value = Math.max(20, Number(args.FREQUENCY) || 440);
    oscillator.connect(gain);
    gain.connect(context.destination);
    gain.gain.setValueAtTime(0.12, context.currentTime);
    oscillator.start();
    oscillator.stop(context.currentTime + Math.max(0.05, Number(args.SECONDS) || 0.5));
    oscillator.onended = () => context.close();`,
      },
      {
        opcode: 'noteFrequency', blockType: 'REPORTER', text: 'частота ноты [NOTE]',
        arguments: { NOTE: ARG('STRING', 'ля') },
        summary: 'Возвращает частоту нескольких нот первой октавы.',
        implementation: "const notes = { 'до': 261.63, 'ре': 293.66, 'ми': 329.63, 'фа': 349.23, 'соль': 392, 'ля': 440, 'си': 493.88 };\n    return notes[String(args.NOTE ?? '').toLocaleLowerCase('ru-RU')] ?? 0;",
      },
    ],
  },
  space: {
    color: '#5473d8',
    blocks: [
      {
        opcode: 'planetTemperature', blockType: 'REPORTER', text: 'температура планеты [PLANET] в °C',
        arguments: { PLANET: ARG('STRING', 'Марс') },
        summary: 'Показывает среднюю температуру планет Солнечной системы.',
        implementation: `const temperatures = { 'меркурий': 167, 'венера': 464, 'земля': 15, 'марс': -65, 'юпитер': -110, 'сатурн': -140, 'уран': -195, 'нептун': -200 };
    const planet = String(args.PLANET ?? '').trim().toLocaleLowerCase('ru-RU');
    return temperatures[planet] ?? 'Неизвестная планета';`,
      },
      {
        opcode: 'planetGravity', blockType: 'REPORTER', text: 'гравитация на планете [PLANET] м/с²',
        arguments: { PLANET: ARG('STRING', 'Земля') },
        summary: 'Возвращает примерное ускорение свободного падения на планете.',
        implementation: `const gravity = { 'меркурий': 3.7, 'венера': 8.87, 'земля': 9.81, 'марс': 3.71, 'юпитер': 24.79, 'сатурн': 10.44, 'уран': 8.69, 'нептун': 11.15 };
    const planet = String(args.PLANET ?? '').trim().toLocaleLowerCase('ru-RU');
    return gravity[planet] ?? 0;`,
      },
      {
        opcode: 'weightOnPlanet', blockType: 'REPORTER', text: 'сила тяжести для [MASS] кг на [PLANET] в Н',
        arguments: { MASS: ARG('NUMBER', 50), PLANET: ARG('STRING', 'Марс') },
        summary: 'Считает силу тяжести для заданной массы в ньютонах.',
        implementation: `const gravity = { 'меркурий': 3.7, 'венера': 8.87, 'земля': 9.81, 'марс': 3.71, 'юпитер': 24.79, 'сатурн': 10.44, 'уран': 8.69, 'нептун': 11.15 };
    const planet = String(args.PLANET ?? '').trim().toLocaleLowerCase('ru-RU');
    return (Number(args.MASS) || 0) * (gravity[planet] || 0);`,
      },
    ],
  },
  internet: {
    color: '#4989db',
    blocks: [
      {
        opcode: 'fetchJson', blockType: 'REPORTER', text: 'получить JSON по адресу [URL]',
        arguments: { URL: ARG('STRING', 'https://api.example.com/data') },
        summary: 'Запрашивает JSON по URL и возвращает его как текст.',
        async: true,
        implementation: `try {
      const response = await fetch(String(args.URL));
      if (!response.ok) return 'Ошибка HTTP ' + response.status;
      const data = await response.json();
      return JSON.stringify(data).slice(0, 10000);
    } catch (error) {
      return 'Ошибка запроса: ' + error.message;
    }`,
      },
      {
        opcode: 'jsonField', blockType: 'REPORTER', text: 'поле [KEY] из JSON [JSON]',
        arguments: { KEY: ARG('STRING', 'name'), JSON: ARG('STRING', '{"name":"Scratch"}') },
        summary: 'Читает поле верхнего уровня из строки JSON.',
        implementation: `try {
      const value = JSON.parse(String(args.JSON ?? ''))[String(args.KEY ?? '')];
      return value == null ? '' : (typeof value === 'object' ? JSON.stringify(value) : value);
    } catch {
      return 'Некорректный JSON';
    }`,
      },
    ],
  },
};

const KEYWORDS = {
  text: /текст|слов|букв|строк|символ|text|word|letter/iu,
  math: /математ|числ|сумм|слож|выч|умнож|дел|округ|диапазон|калькуля|math|number|random/iu,
  game: /игр|кубик|игрок|очки|уров|побед|враг|game|score|dice/iu,
  sensor: /датчик|сенсор|экран|размер окна|сенсорн|устройств|sensor|screen/iu,
  time: /таймер|секунд|отсч[её]т|времени|время|timer|stopwatch/iu,
  sound: /звук|музык|нота|тон|частот|sound|music|audio/iu,
  internet: /интернет|сайт|запрос|json|api|url|погода|weather|fetch/iu,
  space: /космос|планет|гравитац|астроном|созвезд|орбит|space|solar/iu,
};

const CYRILLIC = {
  а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'yo', ж: 'zh', з: 'z', и: 'i', й: 'y',
  к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f',
  х: 'h', ц: 'ts', ч: 'ch', ш: 'sh', щ: 'sch', ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya',
};

function transliterate(value) {
  return [...String(value).toLocaleLowerCase('ru-RU')]
    .map((letter) => CYRILLIC[letter] ?? letter)
    .join('');
}

function makeId(value) {
  const id = transliterate(value)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 36);
  return /^[a-z]/.test(id) ? id : `my_${id || 'extension'}`;
}

function makeClassName(id) {
  return `${id.split(/[^a-z0-9]+/i).filter(Boolean).map((part) => part[0].toUpperCase() + part.slice(1)).join('')}Extension`;
}

function extractName(prompt) {
  const quoted = String(prompt).match(/[«"]([^»"]{2,48})[»"]/u);
  if (quoted?.[1]) return quoted[1].trim();

  const firstPart = String(prompt)
    .replace(/^\s*(?:пожалуйста,?\s*)?(?:создай|сделай|сгенерируй|напиши|разработай|придумай)\s+/iu, '')
    .replace(/^\s*(?:расширение|extension)\s+/iu, '')
    .split(/[,:;.!?\n—–]/u)[0]
    .trim();
  if (firstPart.length >= 3 && firstPart.length <= 34) return firstPart;
  return 'Моя мастерская';
}

function inferCategory(prompt, requestedCategory = 'auto') {
  if (requestedCategory && requestedCategory !== 'auto' && PACKS[requestedCategory]) return requestedCategory;
  const value = String(prompt);
  const priority = ['space', 'internet', 'time', 'sound', 'sensor', 'text', 'game', 'math'];
  return priority.find((category) => KEYWORDS[category].test(value)) || 'utility';
}

function createCode({ name, id, color, blocks }) {
  const className = makeClassName(id);
  const blockLines = blocks.map((block) => {
    const blockType = `BlockType.${block.blockType}`;
    const args = Object.entries(block.arguments || {});
    const argsCode = args.length
      ? `,\n          arguments: { ${args.map(([key, arg]) => `${JSON.stringify(key)}: { type: ArgumentType.${arg.type}, defaultValue: ${JSON.stringify(arg.defaultValue)} }`).join(', ')} }`
      : '';
    return `        { opcode: ${JSON.stringify(block.opcode)}, blockType: ${blockType}, text: ${JSON.stringify(block.text)}${argsCode} },`;
  }).join('\n');
  const methodLines = blocks.map((block) => {
    const body = block.implementation.split('\n').map((line) => `    ${line}`).join('\n');
    return `  ${block.async ? 'async ' : ''}${block.opcode}(args) {\n${body}\n  }`;
  }).join('\n\n');

  return `(function (Scratch) {
  'use strict';

  if (!Scratch || !Scratch.extensions) {
    throw new Error('Scratch Extension API не найден. Откройте расширение в TurboWarp.');
  }

  const { BlockType, ArgumentType } = Scratch;

  class ${className} {
    getInfo() {
      return {
        id: ${JSON.stringify(id)},
        name: ${JSON.stringify(name)},
        color1: ${JSON.stringify(color)},
        color2: ${JSON.stringify(color)},
        blocks: [
${blockLines}
        ],
      };
    }

${methodLines}
  }

  Scratch.extensions.register(new ${className}());
})(Scratch);
`;
}

export function generateLocalExtension(prompt, requestedCategory = 'auto') {
  const category = inferCategory(prompt, requestedCategory);
  const pack = PACKS[category];
  const name = extractName(prompt);
  const id = makeId(name);
  const blocks = pack.blocks.map((block) => ({
    label: block.text,
    type: block.blockType,
    summary: block.summary,
  }));
  return {
    name,
    id,
    category,
    categoryLabel: CATEGORY_LIST.find((item) => item.id === category)?.label || 'Утилиты',
    color: pack.color,
    blocks,
    code: createCode({ name, id, color: pack.color, blocks: pack.blocks }),
    mode: 'local',
  };
}
