import { CATEGORY_LIST, generateLocalExtension } from './generator.js';

const PRESETS = {
  math: {
    title: 'Умная математика',
    short: 'Счёт, округление, случайные числа',
    prompt: 'Создай расширение «Умная математика»: блоки для суммы, случайного числа и округления.',
    category: 'math',
    symbol: '∑',
    tint: '#f0edff',
    color: '#735ddd',
  },
  text: {
    title: 'Текстовые помощники',
    short: 'Слова, буквы и переворот строки',
    prompt: 'Создай расширение «Текстовые помощники»: нужны блоки для перевода текста в верхний регистр, подсчёта слов и переворота строки.',
    category: 'text',
    symbol: 'Aa',
    tint: '#fff0e8',
    color: '#dc7953',
  },
  time: {
    title: 'Игровой таймер',
    short: 'Старт, сброс и прошедшие секунды',
    prompt: 'Создай расширение «Игровой таймер»: блоки для запуска таймера, сброса и получения прошедших секунд.',
    category: 'time',
    symbol: '◷',
    tint: '#ffedf2',
    color: '#ce6882',
  },
  game: {
    title: 'Игровой набор',
    short: 'Кубик, расстояние и случайный предмет',
    prompt: 'Создай расширение «Игровой набор»: блоки, чтобы бросить кубик, посчитать расстояние между двумя точками и выбрать случайный предмет из списка.',
    category: 'game',
    symbol: '✹',
    tint: '#fff5df',
    color: '#cc8b20',
  },
  space: {
    title: 'Космос и планеты',
    short: 'Температура, гравитация и сила тяжести',
    prompt: 'Создай расширение «Космос и планеты»: блоки температуры и гравитации планет, а также силы тяжести для объекта заданной массы.',
    category: 'space',
    symbol: '✦',
    tint: '#edf0ff',
    color: '#536ed0',
  },
  internet: {
    title: 'Интернет-инструменты',
    short: 'Запрос JSON и чтение его полей',
    prompt: 'Создай расширение «Интернет-инструменты»: безопасный блок для получения JSON по указанному URL и блок для чтения поля из JSON. Обрабатывай ошибки запроса.',
    category: 'internet',
    symbol: '↗',
    tint: '#eaf3ff',
    color: '#4b86d1',
  },
  sound: {
    title: 'Звуковая лаборатория',
    short: 'Синтез тона и частота музыкальной ноты',
    prompt: 'Создай расширение «Звуковая лаборатория»: блок-команда для проигрывания тона заданной частоты и длительности, а также блок для частоты музыкальной ноты.',
    category: 'sound',
    symbol: '♫',
    tint: '#f8ecff',
    color: '#9853bf',
  },
};

const STORAGE_KEY = 'turboblocks-extension-library-v1';
const MAX_HISTORY = 12;
const state = {
  selectedCategory: 'auto',
  generated: null,
  activeView: 'generator',
  activeTab: 'code',
  library: loadLibrary(),
  aiEnabled: false,
  model: null,
  toastTimer: null,
  lastFocusedElement: null,
};

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const promptInput = $('#promptInput');
const generateButton = $('#generateButton');
const libraryGrid = $('#libraryGrid');

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[character]);
}

function categoryInfo(category) {
  return CATEGORY_LIST.find((item) => item.id === category) || CATEGORY_LIST.find((item) => item.id === 'utility');
}

function loadLibrary() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(saved) ? saved.filter((item) => item && typeof item.code === 'string').slice(0, MAX_HISTORY) : [];
  } catch {
    return [];
  }
}

function saveLibrary() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.library.slice(0, MAX_HISTORY)));
  } catch (error) {
    console.warn('Не удалось сохранить библиотеку в браузере:', error);
    showToast('Браузер не смог сохранить библиотеку', true);
  }
  updateLibraryCount();
}

function updateLibraryCount() {
  $('#libraryCount').textContent = String(state.library.length);
}

function updatePromptCounter() {
  $('#promptCounter').textContent = `${promptInput.value.length} / 5000`;
}

function setCategory(category) {
  state.selectedCategory = category;
  $$('.category-chip').forEach((button) => {
    const isSelected = button.dataset.category === category;
    button.classList.toggle('is-selected', isSelected);
    button.setAttribute('aria-pressed', String(isSelected));
  });
}

function pluralBlocks(count) {
  const value = Math.abs(Number(count)) % 100;
  const last = value % 10;
  if (value > 10 && value < 20) return `${count} блоков`;
  if (last > 1 && last < 5) return `${count} блока`;
  if (last === 1) return `${count} блок`;
  return `${count} блоков`;
}

function safeFilename(value) {
  return String(value || 'scratch_extension')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 40) || 'scratch_extension';
}

function syntaxHighlight(source) {
  const tokenPattern = /(\/\*[\s\S]*?\*\/|\/\/[^\n]*|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`|\b(?:async|await|break|catch|class|const|continue|else|export|extends|false|finally|for|from|function|if|import|in|let|new|null|return|static|super|switch|this|throw|true|try|typeof|var|while)\b|\b\d+(?:\.\d+)?\b)/g;
  let html = '';
  let cursor = 0;
  for (const match of source.matchAll(tokenPattern)) {
    const index = match.index ?? 0;
    html += escapeHtml(source.slice(cursor, index));
    const token = match[0];
    let className = 'token-keyword';
    if (token.startsWith('//') || token.startsWith('/*')) className = 'token-comment';
    else if (/^["'`]/.test(token)) className = 'token-string';
    else if (/^\d/.test(token)) className = 'token-number';
    html += `<span class="${className}">${escapeHtml(token)}</span>`;
    cursor = index + token.length;
  }
  html += escapeHtml(source.slice(cursor));
  return html;
}

function blockTypeLabel(type) {
  const normalized = String(type || '').toUpperCase();
  if (normalized.includes('BOOLEAN') || normalized.includes('HAT')) return 'ПРОВЕРКА';
  if (normalized.includes('COMMAND') || normalized.includes('STACK')) return 'КОМАНДА';
  if (normalized.includes('REPORTER')) return 'РЕПОРТЁР';
  return 'БЛОК';
}

function renderResult() {
  if (!state.generated) return;
  const result = state.generated;
  const blocks = Array.isArray(result.blocks) ? result.blocks : [];
  const color = categoryInfo(result.category).color;
  const fileName = `${safeFilename(result.id || result.name)}.js`;
  $('#resultName').textContent = result.name || 'Моё расширение';
  $('#resultStatus').textContent = result.mode === 'ai' ? `Создано ИИ${state.model ? ` · ${state.model}` : ''}` : 'Локальный шаблон';
  $('#resultCategory').textContent = result.categoryLabel || categoryInfo(result.category).label;
  $('#filenameLabel').textContent = fileName;
  $('#codeContent').innerHTML = syntaxHighlight(result.code || '');
  const lineCount = Math.max(1, (result.code || '').split('\n').length);
  $('#lineNumbers').textContent = Array.from({ length: lineCount }, (_, index) => index + 1).join('\n');
  $('#lineInfo').textContent = `${lineCount} ${lineCount === 1 ? 'строка' : 'строк'}`;
  $('#blockCount').textContent = String(blocks.length);
  $('#blocksTotal').textContent = pluralBlocks(blocks.length);
  $('#blocksGrid').innerHTML = blocks.length
    ? blocks.map((block) => `
      <article class="block-preview-card">
        <span class="block-chip" style="--block-color:${escapeHtml(color)}">${escapeHtml(block.label || block.text || 'Новый блок')}</span>
        <span class="block-type-label">${escapeHtml(blockTypeLabel(block.type))}</span>
        <p>${escapeHtml(block.summary || 'Блок пользовательского расширения.')}</p>
      </article>`).join('')
    : '<div class="block-preview-card"><span class="block-chip">Блоки описаны в коде</span><p>Откройте вкладку «Код», чтобы изучить расширение.</p></div>';
  $('#codeScroll').scrollTop = 0;
}

function setTab(tab) {
  state.activeTab = tab;
  $$('.result-tab').forEach((button) => {
    const active = button.dataset.tab === tab;
    button.classList.toggle('is-active', active);
    button.setAttribute('aria-selected', String(active));
  });
  $('#codeTab').hidden = tab !== 'code';
  $('#blocksTab').hidden = tab !== 'blocks';
  $('#guideTab').hidden = tab !== 'guide';
}

function showToast(message, warning = false) {
  const toast = $('#toast');
  $('#toastMessage').textContent = message;
  toast.classList.toggle('is-warning', warning);
  toast.classList.add('is-visible');
  window.clearTimeout(state.toastTimer);
  state.toastTimer = window.setTimeout(() => toast.classList.remove('is-visible'), 3100);
}

function addToLibrary(result, prompt) {
  const entry = {
    ...result,
    prompt,
    savedAt: new Date().toISOString(),
    historyId: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  };
  state.library.unshift(entry);
  state.library = state.library.slice(0, MAX_HISTORY);
  saveLibrary();
  return entry;
}

function setBusy(isBusy) {
  generateButton.disabled = isBusy;
  generateButton.setAttribute('aria-busy', String(isBusy));
  if (isBusy) {
    generateButton.innerHTML = '<span class="button-spinner" aria-hidden="true"></span><span class="generate-label">Собираем расширение…</span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6"/></svg>';
  } else {
    generateButton.innerHTML = '<span class="button-spark">✳</span><span class="generate-label">Сгенерировать расширение</span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6"/></svg>';
  }
}

async function generate() {
  const prompt = promptInput.value.trim();
  if (prompt.length < 4) {
    promptInput.focus();
    showToast('Опишите идею чуть подробнее', true);
    return;
  }
  setBusy(true);
  let result;
  let fellBack = false;
  try {
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, category: state.selectedCategory }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || `Ошибка генерации (${response.status})`);
    result = data;
  } catch (error) {
    console.warn('Генератор API недоступен, используется локальный шаблон:', error);
    result = generateLocalExtension(prompt, state.selectedCategory);
    fellBack = true;
  }
  state.generated = { ...result, prompt };
  addToLibrary(state.generated, prompt);
  renderResult();
  setTab('code');
  setBusy(false);
  if (fellBack) showToast('Сервер ИИ недоступен — создан локальный вариант', true);
  else if (result.mode === 'ai') showToast('Расширение создано с помощью ИИ');
  else showToast('Готово — локальный шаблон можно настроить в коде');
}

function updateModeUI() {
  const badge = $('.mode-badge');
  const label = $('#modeLabel');
  const sidebarTitle = $('#sidebarAiTitle');
  const sidebarText = $('#sidebarAiText');
  const modalStatus = $('.modal-status');
  const modalStatusText = $('#modalStatusText');
  badge.classList.toggle('is-ai', state.aiEnabled);
  label.textContent = state.aiEnabled ? 'ИИ подключён' : 'Локальный режим';
  sidebarTitle.textContent = state.aiEnabled ? 'ИИ подключён' : 'Подключите ИИ';
  sidebarText.textContent = state.aiEnabled ? `Модель: ${state.model || 'AI'}` : 'Или начните бесплатно';
  modalStatus.classList.toggle('is-ai', state.aiEnabled);
  modalStatusText.textContent = state.aiEnabled
    ? `ИИ готов к генерации · ${state.model || 'подключённая модель'}`
    : 'Работает локально · подключение ИИ не настроено';
}

async function checkHealth() {
  try {
    const response = await fetch('/api/health', { cache: 'no-store' });
    if (!response.ok) throw new Error('health check failed');
    const data = await response.json();
    state.aiEnabled = data.mode === 'ai';
    state.model = data.model || null;
  } catch {
    state.aiEnabled = false;
    state.model = null;
  }
  updateModeUI();
}

function formatDate(value) {
  const date = new Date(value || Date.now());
  if (Number.isNaN(date.getTime())) return 'Недавно';
  return new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'short' }).format(date);
}

function renderLibrary() {
  const isEmpty = state.library.length === 0;
  $('#emptyLibrary').hidden = !isEmpty;
  libraryGrid.innerHTML = '';
  libraryGrid.className = 'library-grid';
  $('#secondaryCount').textContent = `${state.library.length} ${state.library.length === 1 ? 'расширение' : state.library.length > 1 && state.library.length < 5 ? 'расширения' : 'расширений'}`;
  if (isEmpty) return;
  libraryGrid.innerHTML = state.library.map((item) => {
    const category = categoryInfo(item.category);
    const id = escapeHtml(item.historyId || '');
    return `<article class="library-card">
      <div class="library-card-top"><span class="library-color-mark" style="--card-tint:${category.color}18;--card-color:${category.color}">✳</span><span>${escapeHtml(formatDate(item.savedAt))}</span></div>
      <h3 title="${escapeHtml(item.name)}">${escapeHtml(item.name || 'Моё расширение')}</h3>
      <p>${escapeHtml(item.prompt || 'Пользовательское расширение Scratch 3.0')}</p>
      <div class="library-card-meta"><span>${escapeHtml(item.categoryLabel || category.label)}</span><span>${pluralBlocks((item.blocks || []).length)}</span></div>
      <div class="library-card-actions"><button type="button" data-library-action="load" data-id="${id}">Открыть</button><button type="button" data-library-action="delete" data-id="${id}">Удалить</button></div>
    </article>`;
  }).join('');
}

function renderTemplates() {
  $('#emptyLibrary').hidden = true;
  $('#secondaryCount').textContent = `${Object.keys(PRESETS).length} готовых идей`;
  libraryGrid.className = 'template-gallery';
  libraryGrid.innerHTML = Object.entries(PRESETS).map(([key, preset]) => `
    <article class="template-card">
      <span class="template-card-icon" style="--template-color:${preset.color};--template-tint:${preset.tint}">${escapeHtml(preset.symbol)}</span>
      <h3>${escapeHtml(preset.title)}</h3><p>${escapeHtml(preset.short)}. Идею можно изменить перед генерацией.</p>
      <button type="button" data-preset="${escapeHtml(key)}">Использовать шаблон <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6"/></svg></button>
    </article>`).join('');
}

function switchView(view) {
  state.activeView = view;
  const isGenerator = view === 'generator';
  $('#generatorView').hidden = !isGenerator;
  $('#secondaryView').hidden = isGenerator;
  $$('.nav-item').forEach((button) => button.classList.toggle('is-active', button.dataset.view === view));
  if (isGenerator) {
    $('#breadcrumbCurrent').textContent = 'Генератор';
  } else if (view === 'templates') {
    $('#breadcrumbCurrent').textContent = 'Шаблоны';
    $('#secondaryTitle').textContent = 'Быстрый старт';
    $('#secondarySubtitle').textContent = 'Выберите заготовку и превратите её в своё расширение.';
    $('#secondaryAction').innerHTML = '<span>✳</span> Создать с нуля';
    renderTemplates();
  } else {
    $('#breadcrumbCurrent').textContent = 'Моя библиотека';
    $('#secondaryTitle').textContent = 'Моя библиотека';
    $('#secondarySubtitle').textContent = 'Созданные расширения всегда под рукой.';
    $('#secondaryAction').innerHTML = '<span>✳</span> Создать расширение';
    renderLibrary();
  }
  if (window.matchMedia('(max-width: 600px)').matches) window.scrollTo({ top: 0, behavior: 'smooth' });
}

function loadPreset(key) {
  const preset = PRESETS[key];
  if (!preset) return;
  promptInput.value = preset.prompt;
  updatePromptCounter();
  setCategory(preset.category);
  switchView('generator');
  promptInput.focus({ preventScroll: true });
  showToast(`Шаблон «${preset.title}» добавлен в описание`);
}

function loadHistoryItem(historyId) {
  const item = state.library.find((entry) => entry.historyId === historyId);
  if (!item) return;
  state.generated = item;
  promptInput.value = item.prompt || '';
  updatePromptCounter();
  setCategory(item.category || 'auto');
  renderResult();
  setTab('code');
  switchView('generator');
  showToast(`Открыто расширение «${item.name}»`);
}

async function copyCode() {
  const code = state.generated?.code;
  if (!code) return;
  try {
    await navigator.clipboard.writeText(code);
  } catch {
    const helper = document.createElement('textarea');
    helper.value = code;
    helper.setAttribute('readonly', '');
    helper.style.position = 'fixed';
    helper.style.opacity = '0';
    document.body.append(helper);
    helper.select();
    document.execCommand('copy');
    helper.remove();
  }
  showToast('Код скопирован в буфер обмена');
}

function downloadCode() {
  if (!state.generated?.code) return;
  const blob = new Blob([state.generated.code], { type: 'text/javascript;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${safeFilename(state.generated.id || state.generated.name)}.js`;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  showToast('Файл расширения скачан');
}

function openSettings() {
  state.lastFocusedElement = document.activeElement;
  $('#settingsModal').hidden = false;
  $('#modalDone').focus();
}

function closeSettings() {
  $('#settingsModal').hidden = true;
  if (state.lastFocusedElement instanceof HTMLElement) state.lastFocusedElement.focus();
}

function initialize() {
  updateLibraryCount();
  updatePromptCounter();
  setCategory('auto');
  state.generated = generateLocalExtension(promptInput.value, 'auto');
  renderResult();
  setTab('code');
  checkHealth();
  window.setInterval(checkHealth, 20_000);
  window.addEventListener('focus', checkHealth);

  promptInput.addEventListener('input', updatePromptCounter);
  generateButton.addEventListener('click', generate);
  $('#copyButton').addEventListener('click', copyCode);
  $('#downloadButton').addEventListener('click', downloadCode);
  $$('.category-chip').forEach((button) => button.addEventListener('click', () => setCategory(button.dataset.category)));
  $$('.result-tab').forEach((button) => button.addEventListener('click', () => setTab(button.dataset.tab)));
  $$('.nav-item').forEach((button) => button.addEventListener('click', () => switchView(button.dataset.view)));
  $$('[data-view-link]').forEach((link) => link.addEventListener('click', (event) => {
    event.preventDefault();
    switchView(link.dataset.viewLink);
  }));
  $('#showTemplates').addEventListener('click', () => switchView('templates'));
  $('#secondaryAction').addEventListener('click', () => switchView('generator'));
  $('#promptInput').addEventListener('keydown', (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') generate();
  });
  document.addEventListener('click', (event) => {
    const presetButton = event.target.closest('[data-preset]');
    if (presetButton) {
      loadPreset(presetButton.dataset.preset);
      return;
    }
    const settingsButton = event.target.closest('[data-open-settings]');
    if (settingsButton) openSettings();
  });
  libraryGrid.addEventListener('click', (event) => {
    const button = event.target.closest('[data-library-action]');
    if (!button) return;
    if (button.dataset.libraryAction === 'load') {
      loadHistoryItem(button.dataset.id);
      return;
    }
    if (button.dataset.libraryAction === 'delete') {
      state.library = state.library.filter((item) => item.historyId !== button.dataset.id);
      saveLibrary();
      renderLibrary();
      showToast('Расширение удалено из библиотеки');
    }
  });
  $('#closeModal').addEventListener('click', closeSettings);
  $('#modalDone').addEventListener('click', closeSettings);
  $('#settingsModal').addEventListener('click', (event) => {
    if (event.target === $('#settingsModal')) closeSettings();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !$('#settingsModal').hidden) closeSettings();
  });
}

initialize();
