// ==UserScript==
// @name         Uranium Booster with Status Box
// @namespace    uranium
// @version      1.2
// @description  Auto-activates boosters and shows status box on page
// @author       aphator
// @match        https://www.geturanium.io/*
// @grant        none
// ==/UserScript==

(async function() {
    const URL = "https://www.geturanium.io/";
    const HEADERS = {
        "accept": "text/x-component",
        "content-type": "text/plain;charset=UTF-8",
        "next-action": "1480975ee8b7173cc8e449cdee4635dc740b9543",
        "next-router-state-tree": "%5B%22%22%2C%7B%22children%22%3A%5B%22__PAGE__%22%2C%7B%7D%2C%22%2F%22%2C%22refresh%22%5D%7D%2Cnull%2Cnull%2Ctrue%5D"
    };
    const WALLET = "0x2e455c184aa62aac640e30d2c5193992b6b6dbf8";

    const payloads = [
        {
            walletAddress: WALLET,
            operation: "ACTIVATE_BOOSTER",
            amount: 10000,
            metadata: { boosterType: "conveyorBooster", duration: 600000 }
        },
        {
            walletAddress: WALLET,
            operation: "ACTIVATE_BOOSTER",
            amount: 10000,
            metadata: { boosterType: "shardMultiplier", duration: 600000 }
        },
        {
            walletAddress: WALLET,
            operation: "ACTIVATE_BOOSTER",
            amount: 15000,
            metadata: { boosterType: "autoCollect", duration: 600000 }
        }
    ];

    // 🧱 Create Status Box
    const box = document.createElement('div');
    box.id = 'uranium-status-box';
    box.style = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 280px;
        max-height: 300px;
        overflow-y: auto;
        background: #111;
        color: #0f0;
        font-family: monospace;
        font-size: 12px;
        padding: 10px;
        border: 1px solid #0f0;
        border-radius: 8px;
        z-index: 9999;
        box-shadow: 0 0 10px #0f04;
    `;
    document.body.appendChild(box);

    function logToBox(message) {
        const time = new Date().toLocaleTimeString();
        const line = document.createElement('div');
        line.textContent = `[${time}] ${message}`;
        box.appendChild(line);
        box.scrollTop = box.scrollHeight;
        console.log(`[${time}] ${message}`);
    }

    async function sendPayload(payload) {
        try {
            const response = await fetch(URL, {
                method: 'POST',
                headers: HEADERS,
                body: JSON.stringify([payload])
            });

            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            const text = await response.text();
            const lines = text.trim().split('\n');
            if (lines.length >= 2 && lines[1].startsWith('1:')) {
                const data = JSON.parse(lines[1].substring(2));
                if (data.data.success) {
                    logToBox(`✅ ${payload.metadata.boosterType} activated`);
                } else {
                    logToBox(`⚠️ ${payload.metadata.boosterType} failed`);
                }
            } else {
                logToBox(`⚠️ Invalid response for ${payload.metadata.boosterType}`);
            }
        } catch (err) {
            logToBox(`❌ Error on ${payload.metadata.boosterType}: ${err.message}`);
        }
    }

    function sleep(ms) {
        return new Promise(r => setTimeout(r, ms));
    }

    function getRandomDelay() {
        return Math.floor(Math.random() * (660 - 630 + 1)) + 630;
    }

    async function main() {
        logToBox("🚀 Boost cycle starting...");

        for (const payload of payloads) {
            await sendPayload(payload);
            await sleep(1000);
        }

        const delay = getRandomDelay();
        const mins = Math.floor(delay / 60);
        const secs = delay % 60;
        logToBox(`⏱️ Refreshing in ${mins}m ${secs}s...`);

        setTimeout(() => {
            logToBox(`🔄 Reloading now...`);
            location.reload();
        }, delay * 1000);
    }

    // Start
    main().catch(err => logToBox(`❌ Fatal error: ${err.message}`));
})();
