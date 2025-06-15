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
        "walletAddress": WALLET,
        "operation": "ACTIVATE_BOOSTER",
        "amount": 10000,
        "metadata": {
            "boosterType": "conveyorBooster",
            "duration": 600000
        }
    },
    {
        "walletAddress": WALLET,
        "operation": "ACTIVATE_BOOSTER",
        "amount": 10000,
        "metadata": {
            "boosterType": "shardMultiplier",
            "duration": 600000
        }
    },
    {
        "walletAddress": WALLET,
        "operation": "ACTIVATE_BOOSTER",
        "amount": 15000,
        "metadata": {
            "boosterType": "autoCollect",
            "duration": 600000
        }
    }
];

async function sendPayload(payload) {
    try {
        const response = await fetch(URL, {
            method: 'POST',
            headers: HEADERS,
            body: JSON.stringify([payload])
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const responseText = await response.text();
        const lines = responseText.trim().split('\n');

        if (lines.length >= 2 && lines[1].startsWith('1:')) {
            const dataLine = lines[1].substring(2);
            const data = JSON.parse(dataLine);

            if (data.data.success) {
                console.log(`✅ Booster ${payload.metadata.boosterType} activated successfully.`);
            } else {
                console.log(`⚠️ Booster ${payload.metadata.boosterType} activation failed.`);
            }
        } else {
            console.log(`⚠️ Unexpected response format for ${payload.metadata.boosterType}`);
        }

    } catch (error) {
        console.log(`❌ Error for ${payload.metadata.boosterType}: ${error.message}`);
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function getRandomDelay() {
    return Math.floor(Math.random() * (660 - 630 + 1)) + 630;
}

async function main() {
    console.log('🚀 Starting booster activation script...');

    while (true) {
        for (const payload of payloads) {
            await sendPayload(payload);
            await sleep(1000);
        }

        const delay = getRandomDelay();
        const minutes = Math.floor(delay / 60);
        const seconds = delay % 60;
        console.log(`\n⏱️ Waiting ${minutes} minutes and ${seconds} seconds before next activation cycle...\n`);
        await sleep(delay * 1000);
    }
}

main().catch(console.error);
