const chrome = require('chrome-aws-lambda');
const puppeteer = require('puppeteer-core');

async function autoScroll(page) {
  await page.evaluate(async () => {
    for (let i = 0; i < 5; i++) {
      window.scrollBy(0, window.innerHeight);
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  });
}

const getReviews = async () => {
  try {
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/google-chrome-stable',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });


    const page = await browser.newPage();
    await page.goto("https://web-fastcar.us-west-2.prod.apfmservices.com/community/sunrise-of-bloomingdale-68581");

    let pageNumber = 1;
    const reviews = [];
    while (true) {
      await autoScroll(page);
      await page.waitForSelector(".ReviewItem__title");

      let singlePageReviews = await page.evaluate(() => {
        const reviewItems = document.querySelectorAll('.ReviewItem');
        return Array.from(reviewItems).map(item => {
          const title = item.querySelector('.ReviewItem__title')?.innerText.trim() || '';
          const content = item.querySelector('.ReviewItem__content')?.innerText.trim() || '';
          const rating = item.querySelector('.RatingStars__Rating')?.innerText.trim() || '';
          return { title, content, rating };
        });
      });
      reviews.push({ [`page_${pageNumber}`]: singlePageReviews });
      pageNumber++;

      const forwardButton = await page.$(`#pageNum-${pageNumber}`);
      if (!forwardButton) break;

      await Promise.all([
        page.waitForResponse(response => response.url().includes('reviews-list') && response.status() === 200),
        forwardButton.click(),
      ]);
    }

    await browser.close();
    return { status: true, data: reviews };
  } catch (error) {
    console.error(error);
    return { status: false, data: error.message };
  }
};

module.exports = { getReviews };
