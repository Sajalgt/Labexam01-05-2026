const express = require('express');
const mongoose = require('mongoose');
const shortid = require('shortid');
require('dotenv').config();

const Url = require('./models/Url');

const app = express();
app.use(express.json());

// Connect MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

// POST - Shorten URL
app.post('/shorten', async (req, res) => {
  const { originalUrl } = req.body;

  if (!originalUrl) {
    return res.status(400).json({ error: 'URL is required' });
  }

  try {
    let existing = await Url.findOne({ originalUrl });
    if (existing) {
      return res.json({ shortUrl: `${process.env.BASE_URL}/${existing.shortCode}` });
    }

    const shortCode = shortid.generate();
    const newUrl = new Url({ originalUrl, shortCode });
    await newUrl.save();

    res.json({ shortUrl: `${process.env.BASE_URL}/${shortCode}` });

  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET - Redirect
app.get('/:shortCode', async (req, res) => {
  try {
    const url = await Url.findOne({ shortCode: req.params.shortCode });

    if (!url) return res.status(404).json({ error: 'Not found' });

    res.redirect(url.originalUrl);

  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});