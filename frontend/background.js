// Handle installation
chrome.runtime.onInstalled.addListener(() => {
  // Initialize storage with default values
  chrome.storage.local.set({
    userProfile: null,
    measurements: null,
    preferences: {
      style: [],
      sustainability: {
        preferOrganic: true,
        preferRecycled: true,
        maxPriceRange: 200
      }
    }
  });
});

// Listen for messages from content script or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case 'getUserProfile':
      chrome.storage.local.get('userProfile', (data) => {
        sendResponse(data.userProfile);
      });
      return true; // Will respond asynchronously

    case 'updateUserProfile':
      chrome.storage.local.set({ userProfile: request.profile }, () => {
        sendResponse({ success: true });
      });
      return true;

    case 'getMeasurements':
      chrome.storage.local.get('measurements', (data) => {
        sendResponse(data.measurements);
      });
      return true;

    case 'updateMeasurements':
      chrome.storage.local.set({ measurements: request.measurements }, () => {
        sendResponse({ success: true });
      });
      return true;
  }
}); 