const cron = require('node-cron');
const scrapeCopart = require('../scrapers/copartScraper');
const saveToJSON = require('../utils/saveToJSON');

const data = await scrapeCopart();
saveToJSON(`copart_${new Date().toISOString().split('T')[0]}.json`, data);
// cron.schedule('0 9 * * *', async () => {
//     console.log('Starting Copart data scraping...');
// });

console.log('Cron job scheduled to run daily at 9 AM.');
