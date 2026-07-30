chrome.runtime.onInstalled.addListener(() => {
  console.log('Advanced Search Operators installed');
});

chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'OPEN_GOOGLE_SEARCH') {
    const url = `https://www.google.com/search?q=${encodeURIComponent(message.query)}`;
    chrome.tabs.create({ url });
  }
  return true;
});