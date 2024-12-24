const puppeteer = require('puppeteer');

// Function to fetch auction data from a URL
const fetchAllAuctionData = async (url, browser) => {
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: 'networkidle2' });

  const data = await page.evaluate(() => {
    let auctions = [];

    // Scrape Auctions Live Right Now and Auctions Later Today tables
    document.querySelectorAll('.auction-item-selector').forEach(item => {
      let auction = {
        saleTime: item.querySelector('.sale-time-selector')?.innerText,
        saleName: item.querySelector('.sale-name-selector')?.innerText,
        region: item.querySelector('.region-selector')?.innerText,
        saleType: item.querySelector('.sale-type-selector')?.innerText,
        saleHighlights: item.querySelector('.sale-highlights-selector')?.innerText,
        lane: item.querySelector('.lane-selector')?.innerText,
        items: item.querySelector('.items-selector')?.innerText,
        actions: []
      };

      // Check for "View All Lane Sale List" link and capture nested auctions
      const viewAllLink = item.querySelector('.view-all-lane-link');
      if (viewAllLink) {
        auction.actions.push({
          actionType: 'View All Lane Sale List',
          actionUrl: viewAllLink.href,
        });
      }

      auctions.push(auction);
    });

    return auctions;
  });

  return data;
};

// Retry logic for fetching data
const fetchWithRetry = async (url, browser, retries = 3) => {
  try {
    const data = await fetchAllAuctionData(url, browser);
    return data;
  } catch (error) {
    if (retries > 0) {
      console.log('Retrying...', retries);
      return await fetchWithRetry(url, browser, retries - 1);
    }
    throw error;
  }
};

// Function to fetch auction details from nested URLs (after clicking the "View All Lane Sale List" link)
const fetchAuctionDetails = async (url, browser) => {
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: 'networkidle2' });

  const details = await page.evaluate(() => {
    let auctionDetails = [];

    // Scrape the details table of the auction
    document.querySelectorAll('.auction-details-row').forEach(row => {
      let detail = {
        image: row.querySelector('.image-selector')?.src,
        lotInfo: row.querySelector('.lot-info-selector')?.innerText,
        vehicleInfo: row.querySelector('.vehicle-info-selector')?.innerText,
        condition: row.querySelector('.condition-selector')?.innerText,
        saleInfo: row.querySelector('.sale-info-selector')?.innerText,
        bids: row.querySelector('.bids-selector')?.innerText,
      };

      auctionDetails.push(detail);
    });

    return auctionDetails;
  });

  return details;
};

module.exports = { fetchAllAuctionData, fetchWithRetry, fetchAuctionDetails };
