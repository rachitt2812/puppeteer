const express = require('express');
const { getReviews } = require('./reviews');
const app = express();
const port = 3000;

// Middleware to parse JSON
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello Puppeteer!');
});

app.get('/api/reviews', async (req, res) => {
  try {
    const reviews = await getReviews();
    res.json(reviews);
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Error fetching reviews",
      error: error.message,
    });
  }
});

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});