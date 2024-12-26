const puppeteer = require("puppeteer");
const fs = require("fs");

(async () => {
  async function fetchAllLaneSaleList(page, saleLink) {
    const newPage = await page.browser().newPage();
    await newPage.goto(saleLink, { waitUntil: "networkidle2" });

    page.on("console", (msg) => console.log("PAGE LOG:", msg.text()));

    const showAllButton = await newPage.$("button.export-csv-button");
    console.log(showAllButton);
    if (showAllButton) {
      console.log("Clicking the 'Show all' button...");
      await showAllButton.click();
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Allow time for data to load
    } else {
      console.log("'Show all' button not found.");
    }

    try {
      await newPage.waitForSelector("#pn_id_2-table tbody tr", {
        timeout: 60000,
      });
    } catch (e) {
      console.error("Table rows not found.");
      await newPage.close();
      return [];
    }

    const saleList = await newPage.evaluate(() => {
      const table = document.querySelector("#pn_id_2-table");
      const rows = Array.from(table.querySelectorAll("tbody tr"));
      return rows.map((row) => {
        const cells = row.querySelectorAll("td");
        return {
          image: {
            link:
              cells[0]?.querySelector('a[aria-label="Lot Details"]')?.href ||
              "",
            imgUrl: cells[0]?.querySelector("img")?.src || "",
          },
          LotInfo: {
            name: cells[1]?.querySelector("a")?.innerText.trim() || "",
            link: cells[1]?.querySelector("a")?.href || "",
            lotNumber:
              cells[1]?.querySelector("div.lot-number-row")?.innerText.trim() ||
              "",
            lotLink:
              cells[1]?.querySelector("div.lot-number-row a")?.href || "",
          },
          VehicleInfo:
            cells[2]
              ?.querySelector("div.search_result_veh_info_block")
              ?.innerText.trim() || "",
          condition:
            cells[3]
              ?.querySelector("div.search_result_condition_block")
              ?.innerText.trim() || "",
          SaleInfo: cells[4]?.innerText.trim() || "",
          Bids: cells[5]?.innerText.trim() || "",
        };
      });
    });

    await newPage.close();
    return saleList;
  }

  
  
  try {
    const browser = await puppeteer.launch({
      headless: true,
      timeout: 60000,
    });
    const page = await browser.newPage();

    await page.setDefaultNavigationTimeout(60000);

    const url = "https://www.copart.com/todaysAuction";
    await page.goto(url, { waitUntil: "networkidle2" });

    await page.waitForSelector("#auctionLiveNow-datatable", { timeout: 60000 });

    const liveNowTableData = await page.evaluate(() => {
      const table = document.querySelector("#auctionLiveNow-datatable");
      const rows = Array.from(table.querySelectorAll("tbody tr"));
      return rows.map((row) => {
        const cells = row.querySelectorAll("td");
        return {
          saleTime: cells[0]?.innerText.trim(),
          saleName: {
            name: cells[1]?.innerText.trim(),
            link: cells[1]?.querySelector("a.viewsalelist")?.href,
          },
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

    for (const row of liveNowTableData) {
      if (row.saleName.link) {
        console.log(`Fetching lane sale list for ${row.saleName.name}...`);
        row.saleName.saleList = await fetchAllLaneSaleList(
          page,
          row.saleName.link
        );
      }
    }

    await page.waitForSelector("#auctionLaterToday-datatable", {
      timeout: 60000,
    });

    const laterTodayTableData = await page.evaluate(() => {
      const table = document.querySelector("#auctionLaterToday-datatable");
      const rows = Array.from(table.querySelectorAll("tbody tr"));
      return rows.map((row) => {
        const cells = row.querySelectorAll("td");
        return {
          saleTime: cells[0]?.innerText.trim(),
          saleName: {
            name: cells[1]?.innerText.trim(),
            link: cells[1]?.querySelector("a.viewsalelist")?.href,
          },
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
    for (const row of laterTodayTableData) {
      if (row.saleName.link) {
        console.log(`Fetching lane sale list for ${row.saleName.name}...`);
        row.saleName.saleList = await fetchAllLaneSaleList(
          page,
          row.saleName.link
        );
      }
    }
    const allData = [...liveNowTableData, ...laterTodayTableData];
    fs.writeFileSync(
      "data/auctionLiveNow.json",
      JSON.stringify(allData, null, 2)
    );
    console.log("Auction data successfully scraped and saved.");

    await browser.close();
  } catch (error) {
    console.error("Error scraping auction data:", error);
  }
})();
