// Service worker for background operations
chrome.runtime.onInstalled.addListener(() => {
    console.log("HarvestAI Extension installed.");
});

// Listen for messages from the web app to sync token
chrome.runtime.onMessageExternal.addListener((request, sender, sendResponse) => {
    if (request.type === 'SYNC_AUTH') {
        chrome.storage.local.set({ fb_token: request.token }, () => {
            console.log("Token synced from HarvestAI web app.");
            sendResponse({ success: true });
        });
        return true;
    }
});

// Capture URL and start extraction for Data Extractor mode
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "extract_current") {
        // Internal messaging for possible context menu actions
    }
});
