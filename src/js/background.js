import 'webext-dynamic-content-scripts';
import addDomainPermissionToggle from 'webext-domain-permission-toggle';

chrome.contextMenus.create({
  id: 'change-icon-color',
  title: 'Change icon colors',
  contexts: ['page', 'page_action'],
  documentUrlPatterns: [
    'https://github.com/*',
    'https://gitlab.com/*',
    'https://bitbucket.org/*',
    'https://*.gogs.io/*',
    'https://*.gitea.io/*',
  ],
});

chrome.contextMenus.create({
  id: 'toggle-dark-mode',
  title: 'Toggle dark mode',
  contexts: ['page', 'page_action'],
  documentUrlPatterns: [
    'https://github.com/*',
    'https://gitlab.com/*',
    'https://bitbucket.org/*',
    'https://*.gogs.io/*',
    'https://*.gitea.io/*',
  ],
});

addDomainPermissionToggle();

const toggleStorage = key => tabs => {
  const activeTab = tabs[0];
  chrome.storage.sync.get(key, storage => {
    chrome.storage.sync.set({ [key]: !storage[key] }, () =>
      chrome.tabs.reload(activeTab.id)
    );
  });
};

chrome.contextMenus.onClicked.addListener(info => {
  if (info.menuItemId === 'change-icon-color') {
    chrome.tabs.query(
      {
        active: true,
        currentWindow: true,
      },
      toggleStorage('colorsDisabled')
    );
  } else if (info.menuItemId === 'toggle-dark-mode') {
    chrome.tabs.query(
      {
        active: true,
        currentWindow: true,
      },
      toggleStorage('darkMode')
    );
  }
});
