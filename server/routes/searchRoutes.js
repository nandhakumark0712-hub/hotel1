const express = require('express');
const router = express.Router();
const { searchHotels } = require('../controllers/searchController');
const { validateSearch } = require('../middleware/validators');

router.get('/hotels', validateSearch, searchHotels);

module.exports = router;
