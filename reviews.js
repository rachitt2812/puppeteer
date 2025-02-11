const { log } = require("console");
const { timeout } = require("puppeteer");
const { default: puppeteer } = require("puppeteer");
const { setTimeout } = require("timers/promises");

async function autoScroll(page) {
  // Limited and smooth scrolling
  await page.evaluate(async () => {
    for (let i = 0; i < 5; i++) {
      window.scrollBy(0, window.innerHeight); // Scroll half the viewport height
      await new Promise(resolve => setTimeout(resolve, 500)); // Wait for content to load
    }
  });
}

const getReviews = async () => {

  //try {

    // Launch the browser and open a new blank page
    const browser = await puppeteer.launch({
      headless: true,  // Run in background (no UI)
      defaultViewport: null, // Keep full viewport size for page
      args: ['--start-maximized'] // Start the browser in maximized mode
    });

    // Navigate the page to a URL
    const page = await browser.newPage();
    await page.goto("https://web-fastcar.us-west-2.prod.apfmservices.com/community/sunrise-of-bloomingdale-68581");

    let pageNumber = 1;
    const reviews = [];
    while (true) {

      await autoScroll(page);
      await page.waitForSelector(".ReviewItem__title");

      // Fetch Reviews
      let singlePageReviews = await page.evaluate(() => {
        // Select all ReviewItem elements
        const reviewItems = document.querySelectorAll('.ReviewItem');
        // Map each ReviewItem to its title, content, and rating
        return Array.from(reviewItems).map((item) => {
          const title = item.querySelector('.ReviewItem__title')?.innerText.trim() || '';
          const content = item.querySelector('.ReviewItem__content')?.innerText.trim() || '';
          const rating = item.querySelector('.RatingStars__Rating')?.innerText.trim() || '';
          return {
            title,
            content,
            rating,
          };
        });
      });
      reviews.push({
        [`page_${pageNumber}`]: singlePageReviews
      });
      pageNumber++;

      // Go To Next Page
      const forwardButton = await page.$(`#pageNum-${pageNumber}`);
      if (!forwardButton) {
        // console.log("No more pages to navigate.");
        break; // Exit the loop if there's no forward button
      }
      // Click the forward button and wait for navigation
      await Promise.all([
        page.waitForResponse((response) => function () {
          // console.log('aa', response.url(), response.status());
          return response.url().includes('reviews-list') && response.status() === 200;
        }
        ),
        forwardButton.click(), // Click the button
      ]);
    }
    // Close Browser
    await browser.close();    
    return {
      status: true,
      data: reviews
    };
//  } catch (error) {
  //  return {
   //   status: false,
     // data: error
    //};
  //}
};
module.exports = { getReviews };
// (async () => {
//   let ca = await getReviews();

//   console.log('aaa',ca);
  
// })();
