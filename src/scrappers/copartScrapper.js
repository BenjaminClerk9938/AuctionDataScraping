const puppeteer = require('puppeteer');

async function scrapeCopart() {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    const cookies = require('./auth/copart_cookies.json');

    // await page.setCookie(...cookies);
    await page.goto('https://www.copart.com/todaysAuction');

    const data = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('.auction-item')).map(item => ({
            title: item.querySelector('.title')?.textContent.trim(),
            price: item.querySelector('.price')?.textContent.trim(),
            location: item.querySelector('.location')?.textContent.trim(),
            date: item.querySelector('.date')?.textContent.trim(),
            time: item.querySelector('.time')?.textContent.trim(),
        }));
    });

    await browser.close();
    return data;
}

module.exports = scrapeCopart;
