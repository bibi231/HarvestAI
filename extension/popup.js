document.getElementById('extractBtn').addEventListener('click', async () => {
    const btn = document.getElementById('extractBtn');
    const status = document.getElementById('status');
    const instruction = document.getElementById('instruction').value.trim();

    if (!instruction) {
        status.innerText = "Please specify what to extract.";
        status.className = "error";
        return;
    }

    btn.disabled = true;
    status.innerText = "Capturing URL...";
    status.className = "";

    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!tab?.url) throw new Error("Could not capture URL");

        status.innerText = "Sending to HarvestAI...";

        // Send to HarvestAI API (local for now)
        const res = await fetch('http://localhost:4000/api/harvest/extract', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Authorization will be handled by the background service worker or a shared cookie/token
                'Authorization': `Bearer ${await getAuthToken()}` 
            },
            body: JSON.stringify({
                urls: [tab.url],
                instruction: instruction
            })
        });

        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.message || "Failed to start job");
        }

        const data = await res.json();
        status.innerText = "Job started! Check your dashboard.";
        status.className = "success";
        
        // Open dashboard
        setTimeout(() => {
            chrome.tabs.create({ url: 'http://localhost:5173/dashboard' });
        }, 2000);

    } catch (err) {
        status.innerText = err.message;
        status.className = "error";
    } finally {
        btn.disabled = false;
    }
});

async function getAuthToken() {
    // Attempt to get token from storage (saved by background script watching login)
    const data = await chrome.storage.local.get(['fb_token']);
    return data.fb_token || "";
}
