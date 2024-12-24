const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('https://www.copart.com/todaysAuction', { waitUntil: 'networkidle2' });

  // Scrape data from the two tables: Auctions Live Right Now and Auctions Later Today
  const auctionData = await page.evaluate(async () => {
    let auctions = [];
    console.log('auctions live right now');
    // Function to scrape auction details from a given URL
    const scrapeAuctionDetails = async (url) => {
      const response = await fetch(url);
      const text = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(text, 'text/html');

      let auctionDetails = [];
      const auctionRows = doc.querySelectorAll('table tbody tr'); // Select all rows in the auction table
      auctionRows.forEach(item => {
        let auction = {
          image: item.querySelector('td:nth-child(1) img')?.src, // Assuming image is in the first column
          lotInfo: item.querySelector('td:nth-child(2)')?.innerText, // Lot Info in the second column
          vehicleInfo: item.querySelector('td:nth-child(3)')?.innerText, // Vehicle Info in the third column
          condition: item.querySelector('td:nth-child(4)')?.innerText, // Condition in the fourth column
          saleInfo: item.querySelector('td:nth-child(5)')?.innerText, // Sale Info in the fifth column
          bids: item.querySelector('td:nth-child(6)')?.innerText, // Bids in the sixth column
          actions: []
        };

        // Check for "Join Auction" and "View Sale List" links
        const joinAuctionLink = item.querySelector('td:nth-child(7) a.join-auction-link'); // Adjust if needed
        if (joinAuctionLink) {
          auction.actions.push({
            actionType: 'Join Auction',
            actionUrl: joinAuctionLink.href,
          });
        }
        const viewSaleListLink = item.querySelector('td:nth-child(7) a.view-sale-list-link'); // Adjust if needed
        if (viewSaleListLink) {
          auction.actions.push({
            actionType: 'View Sale List',
            actionUrl: viewSaleListLink.href,
          });
        }

        auctionDetails.push(auction);
      });

      return auctionDetails;
    };

    // Scraping Auctions Live Right Now table
    const liveNowRows = document.querySelectorAll('#auctionLiveNow-datatable tbody tr'); // Adjust selector for the live now table
    console.log(liveNowRows);
    liveNowRows.forEach(async item => {
      let auction = {
        saleTime: item.querySelector('td:nth-child(1)')?.innerText, // Sale Time in the first column
        saleName: item.querySelector('td:nth-child(2)')?.innerText, // Sale Name in the second column
        region: item.querySelector('td:nth-child(3)')?.innerText, // Region in the third column
        saleType: item.querySelector('td:nth-child(4)')?.innerText, // Sale Type in the fourth column
        saleHighlights: item.querySelector('td:nth-child(5)')?.innerText, // Sale Highlights in the fifth column
        lane: item.querySelector('td:nth-child(6)')?.innerText, // Lane in the sixth column
        items: item.querySelector('td:nth-child(7)')?.innerText, // Items in the seventh column
        actions: []
      };
   
      // Check for "View All Lane Sale List" link
    //   const viewAllLink = item.querySelector('td:nth-child(2) a.view-all-lane-link'); // Adjust if needed
    //   if (viewAllLink) {
    //     auction.actions.push({
    //       actionType: 'View All Lane Sale List',
    //       actionUrl: viewAllLink.href,
    //       auctionDetails: await scrapeAuctionDetails(viewAllLink.href) // Scrape details from the new URL
    //     });
    //   }

      auctions.push(auction);
    });
   

    // Scraping Auctions Later Today table (similar to the above)
    // const laterTodayRows = document.querySelectorAll('table.later-today tbody tr'); // Adjust selector for the later today table
    // laterTodayRows.forEach(async item => {
    //   let auction = {
    //     saleTime: item.querySelector('td:nth-child(1)')?.innerText, // Sale Time in the first column
    //     saleName: item.querySelector('td:nth-child(2)')?.innerText, // Sale Name in the second column
    //     region: item.querySelector('td:nth-child(3)')?.innerText, // Region in the third column
    //     saleType: item.querySelector('td:nth-child(4)')?.innerText, // Sale Type in the fourth column
    //     saleHighlights: item.querySelector('td:nth-child(5)')?.innerText, // Sale Highlights in the fifth column
    //     lane: item.querySelector('td:nth-child(6)')?.innerText, // Lane in the sixth column
    //     items: item.querySelector('td:nth-child(7)')?.innerText, // Items in the seventh column
    //     actions: []
    //   };

    //   // Check for "View All Lane Sale List" link
    //   const viewAllLink = item.querySelector('td:nth-child(2) a.view-all-lane-link'); // Adjust if needed
    //   if (viewAllLink) {
    //     auction.actions.push({
    //       actionType: 'View All Lane Sale List',
    //       actionUrl: viewAllLink.href,
    //       auctionDetails: await scrapeAuctionDetails(viewAllLink.href) // Scrape details from the new URL
    //     });
    //   }

    //   auctions.push(auction);
    // });

    return auctions;
  });

  // Save the main auction data to a JSON file
//   fs.writeFileSync('mainAuctionData.json', JSON.stringify(auctionData, null, 2));
  console.log(auctionData);
  console.log('Main auction data extracted and saved.');
  await browser.close();
})();
