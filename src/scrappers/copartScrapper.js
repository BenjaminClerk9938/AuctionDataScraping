const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  try {
    // Launch Puppeteer
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    // Navigate to the Copart auction page
    const url = 'https://www.copart.com/todaysAuction';
    await page.goto(url, { waitUntil: 'networkidle2' });

    // Wait for the table to load
    await page.waitForSelector('#auctionLiveNow-datatable');

    // Extract data from the table
    const liveNowTableData = await page.evaluate(() => {
      const table = document.querySelector('#auctionLiveNow-datatable');
      const rows = Array.from(table.querySelectorAll('tbody tr'));
      return rows.map(row => {
        const cells = row.querySelectorAll('td');
        return {
          saleTime: cells[0]?.innerText.trim(),
          saleName: cells[1]?.innerText.trim(),
          region: cells[2]?.innerText.trim(),
          saleType: cells[3]?.innerText.trim(),
          saleHighlights: cells[4]?.innerText.trim(),
          lane: cells[5]?.innerText.trim(),
          items: cells[6]?.innerText.trim(),
          actions: {
            joinAuction: cells[7]?.querySelector('a[href*="join"]')?.href,
            viewSaleList: cells[7]?.querySelector('a[href*="saleList"]')?.href,
          },
        };
      });
    });
    console.log(liveNowTableData);
    await page.waitForSelector('#auctionLaterToday-datatable');

    // Extract data from the table
    const laterTodayTableData = await page.evaluate(() => {
      const table = document.querySelector('#auctionLaterToday-datatable');
      const rows = Array.from(table.querySelectorAll('tbody tr'));
      return rows.map(row => {
        const cells = row.querySelectorAll('td');
        return {
          saleTime: cells[0]?.innerText.trim(),
          saleName: cells[1]?.innerText.trim(),
          region: cells[2]?.innerText.trim(),
          saleType: cells[3]?.innerText.trim(),
          saleHighlights: cells[4]?.innerText.trim(),
          lane: cells[5]?.innerText.trim(),
          items: cells[6]?.innerText.trim(),
          actions: {
            joinAuction: cells[7]?.querySelector('a[href*="join"]')?.href,
            viewSaleList: cells[7]?.querySelector('a[href*="saleList"]')?.href,
          },
        };
      });
    });
    console.log(laterTodayTableData);
    const allData = [...liveNowTableData, ...laterTodayTableData];
    // Save the data to a JSON file
    fs.writeFileSync(
      "data/auctionLiveNow.json",
      JSON.stringify(allData, null)
    );
    console.log("Auction data successfully scraped and saved.");

    // Close the browser
    await browser.close();
  } catch (error) {
    console.error('Error scraping auction data:', error);
  }
})();
