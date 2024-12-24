const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  try {
    // Launch Puppeteer
    const browser = await puppeteer.launch({ 
      headless: true,
      timeout: 60000  // Increase timeout to 60 seconds
    });
    const page = await browser.newPage();

    // Set longer timeout for navigation
    await page.setDefaultNavigationTimeout(60000);
    
    // Navigate to the Copart auction page
    const url = 'https://www.copart.com/todaysAuction';
    await page.goto(url, { 
      waitUntil: 'networkidle2',
      timeout: '60000' 
    });

    // Wait for table with longer timeout
    await page.waitForSelector('#auctionLiveNow-datatable', { timeout: 60000 });

    // Extract data from the table
    const liveNowTableData = await page.evaluate(() => {
      const table = document.querySelector('#auctionLiveNow-datatable');
      const rows = Array.from(table.querySelectorAll('tbody tr'));
      return rows.map(row => {
        const cells = row.querySelectorAll('td');
        return {
          saleTime: cells[0]?.innerText.trim(),
          saleName: { name: cells[1]?.innerText.trim(), link: cells[1]?.querySelector('a.viewsalelist')?.href},
          region: cells[2]?.innerText.trim(),
          saleType: cells[3]?.innerText.trim(),
          saleHighlights: cells[4]?.innerText.trim(),
          lane: cells[5]?.innerText.trim(),
          items: cells[7]?.innerText.trim(),
          actions: {
            joinAuction: cells[8]?.querySelector('a[href*="join"]')?.href,
            viewSaleList: cells[8]?.querySelector('a[href*="saleList"]')?.href,
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
          items: cells[7]?.innerText.trim(),
          actions: {
            joinAuction: cells[8]?.querySelector('a[href*="join"]')?.href,
            viewSaleList: cells[8]?.querySelector('a[href*="saleList"]')?.href,
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
