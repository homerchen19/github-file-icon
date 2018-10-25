import fileIcons from 'file-icons-js';
import domLoaded from 'dom-loaded';
import select from 'select-dom';

import '../css/icons.css';

let colorsDisabled = false;
let darkMode = false;

const getSiteInstance = hostname => {
  if (hostname.match(/.*github.*./i)) {
    return 'github';
  } else if (hostname.match(/.*bitbucket.org/i)) {
    return 'bitbucket';
  } else if (hostname.match(/.*gitlab.*./i)) {
    return 'gitlab';
  } else {
    return 'other';
  }
};

const getSelector = hostname => {
  switch (getSiteInstance(hostname)) {
    case 'github':
      return {
        filenameSelector:
          'tr.js-navigation-item > td.content > span a, .files-list > a.list-item',
        iconSelector:
          'tr.js-navigation-item > td.icon, .files-list > a.list-item',
        host: 'github',
      };
    case 'bitbucket':
      return {
        filenameSelector: 'tr.iterable-item > td.filename > div > a',
        iconSelector: 'tr.iterable-item > td.filename > div > a > span',
        host: 'bitbucket',
      };
    case 'gitlab':
      return {
        filenameSelector: 'tr.tree-item > td.tree-item-file-name',
        iconSelector: 'tr.tree-item > td.tree-item-file-name > i',
        host: 'gitlab',
      };
    default:
      return {
        filenameSelector: 'tr > td.name > a',
        iconSelector: 'tr > td.name > span',
        host: 'others',
      };
  }
};

const loadFonts = () => {
  const fonts = [
    { name: 'FontAwesome', path: 'fonts/fontawesome.woff2' },
    { name: 'Mfizz', path: 'fonts/mfixx.woff2' },
    { name: 'Devicons', path: 'fonts/devopicons.woff2' },
    { name: 'file-icons', path: 'fonts/file-icons.woff2' },
    { name: 'octicons', path: 'fonts/octicons.woff2' },
  ];

  fonts.forEach(font => {
    const fontFace = new FontFace(
      font.name,
      `url("${chrome.extension.getURL(font.path)}") format("woff2")`,
      {
        style: 'normal',
        weight: 'normal',
      }
    );
    fontFace.load().then(loadedFontFace => document.fonts.add(loadedFontFace));
  });
};

const getGitHubFilename = filenameDom =>
  Array.from(filenameDom.childNodes)
    .filter(node => node.nodeType === node.TEXT_NODE)
    .map(node => node.nodeValue.trim())
    .join('');

const update = () => {
  const { filenameSelector, iconSelector, host } = getSelector(
    window.location.hostname
  );

  const filenameDoms = Array.from(select.all(filenameSelector));
  const iconDoms = Array.from(select.all(iconSelector));

  const filenameDomsLength = filenameDoms.length;

  if (filenameDomsLength !== 0) {
    for (let i = 0; i < filenameDomsLength; i += 1) {
      const filename =
        host === 'github'
          ? getGitHubFilename(filenameDoms[i])
          : filenameDoms[i].innerText.trim();
      const iconDom =
        host === 'github' ? iconDoms[i].querySelector('.octicon') : iconDoms[i];

      const isDirectory =
        iconDom.classList.contains('octicon-file-directory') ||
        iconDom.classList.contains('fa-folder');

      const className = colorsDisabled
        ? fileIcons.getClass(filename)
        : fileIcons.getClassWithColor(filename);

      const darkClassName = darkMode ? 'dark' : '';

      if (className && !isDirectory) {
        const icon = document.createElement('span');

        if (host === 'github') {
          icon.className = `icon octicon ${className} ${darkClassName}`;
        } else {
          icon.className = `${className} ${darkClassName}`;
          icon.style.marginRight = host === 'bitbucket' ? '10px' : '3px';
        }

        iconDom.parentNode.replaceChild(icon, iconDom);
      }
    }
  }
};

const observer = new MutationObserver(update);
const observeFragment = () => {
  const ajaxFiles = select('.file-wrap');
  if (ajaxFiles) {
    observer.observe(ajaxFiles.parentNode, {
      childList: true,
    });
  }
};

const init = async () => {
  loadFonts();
  observeFragment();

  await domLoaded;
  update();

  document.addEventListener('pjax:end', update);
  document.addEventListener('pjax:end', observeFragment);
};

chrome.storage.sync.get(['colorsDisabled', 'darkMode'], result => {
  colorsDisabled =
    result.colorsDisabled === undefined
      ? colorsDisabled
      : result.colorsDisabled;

  darkMode = result.darkMode === undefined ? darkMode : result.darkMode;

  init();
});
