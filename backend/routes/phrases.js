const express = require('express');
const router = express.Router();
const axios = require('axios');

const MICROSERVICE_URL = process.env.PHRASE_MICROSERVICE_URL || 'http://localhost:3002';

router.post('/translate', async (req, res) => {
  try {
    const { languageOrCountry, phraseType } = req.body;
    if (!languageOrCountry || !phraseType) {
      return res.status(400).json({ success: false, error: 'Both languageOrCountry and phraseType are required' });
    }
    const sanitizedLanguage = languageOrCountry.trim().substring(0, 50);
    const sanitizedPhraseType = phraseType.trim().substring(0, 30);
    if (!sanitizedLanguage || !sanitizedPhraseType) {
      return res.status(400).json({ success: false, error: 'Invalid input parameters' });
    }
    console.log(`Requesting phrases for ${sanitizedLanguage} - ${sanitizedPhraseType}`);
    const microserviceResponse = await axios.post(`${MICROSERVICE_URL}/generate-phrases`, {
      languageOrCountry: sanitizedLanguage,
      phraseType: sanitizedPhraseType
    }, {
      timeout: 15000,
      headers: { 'Content-Type': 'application/json' }
    });
    if (microserviceResponse.data.success) {
      res.json({
        success: true,
        phrases: microserviceResponse.data.phrases,
        language: microserviceResponse.data.language,
        phraseType: microserviceResponse.data.phraseType
      });
    } else {
      res.status(400).json({ success: false, error: microserviceResponse.data.error || 'Microservice returned an error' });
    }
  } catch (error) {
    console.error('Error calling phrase microservice:', error.message);
    if (error.code === 'ECONNREFUSED') {
      return res.status(503).json({ success: false, error: 'Translation service is currently unavailable' });
    }
    if (error.response) {
      return res.status(error.response.status).json({ success: false, error: error.response.data?.error || 'Translation service error' });
    }
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

module.exports = router;
