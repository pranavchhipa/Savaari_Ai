const fs = require('fs');
const https = require('https');
const path = require('path');

// Final attempt for Wagon R with a reliable URL
const cars = [
    { name: 'wagon-r.jpg', url: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?q=80&w=640&auto=format&fit=crop' }
];

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const downloadImage = (url, filepath) => {
    return new Promise((resolve, reject) => {
        const options = {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
            }
        };

        https.get(url, options, (res) => {
            // Follow redirects
            if (res.statusCode === 301 || res.statusCode === 302 || res.statusCode === 307 || res.statusCode === 308) {
                console.log(`Redirecting to ${res.headers.location}`);
                downloadImage(res.headers.location, filepath).then(resolve).catch(reject);
                return;
            }

            if (res.statusCode === 200) {
                res.pipe(fs.createWriteStream(filepath))
                    .on('error', reject)
                    .once('close', () => resolve(filepath));
            } else {
                res.resume();
                reject(new Error(`Request Failed With a Status Code: ${res.statusCode}`));
            }
        });
    });
};

async function downloadAll() {
    for (const car of cars) {
        try {
            const filepath = path.join(__dirname, 'public', 'cars', car.name);
            console.log(`Downloading ${car.name}...`);
            await downloadImage(car.url, filepath);
            console.log(`Saved to ${filepath}`);
            await wait(1000);
        } catch (error) {
            console.error(`Failed to download ${car.name}: ${error.message}`);
        }
    }
}

downloadAll();
