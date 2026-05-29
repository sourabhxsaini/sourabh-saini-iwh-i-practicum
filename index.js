require('dotenv').config();
const express = require('express');
const axios = require('axios');
const app = express();

const PORT = 3000;

const CUSTOM_OBJECT_TYPE = '2-63240321';

const hubspotClient = axios.create({
  baseURL: 'https://api.hubapi.com',
  headers: {
    Authorization: `Bearer ${process.env.PRIVATE_APP_ACCESS_TOKEN}`,
    'Content-Type': 'application/json',
  },
});

app.set('view engine', 'pug');
app.set('views', './views');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// ─── HOMEPAGE: GET all custom object records ──────────────────────────────────
app.get('/', async (req, res) => {
  try {
    const response = await hubspotClient.get(
      `/crm/v3/objects/${CUSTOM_OBJECT_TYPE}`,
      {
        params: {
          properties: 'name,species,care_level',
          limit: 100,
        },
      }
    );

    const records = response.data.results;
    res.render('homepage', {
      title: 'Plant Collection | HubSpot Practicum',
      records,
    });
  } catch (err) {
    console.error('Error fetching records:', err.response?.data || err.message);
    res.status(500).send('Error fetching records from HubSpot.');
  }
});

// ─── UPDATE FORM: GET (render the form) ──────────────────────────────────────
app.get('/update-cobj', (req, res) => {
  res.render('updates', {
    title: 'Update Custom Object Form | Integrating With HubSpot I Practicum',
  });
});

// ─── UPDATE FORM: POST (create a new CRM record) ─────────────────────────────
app.post('/update-cobj', async (req, res) => {
  const { name, species, care_level } = req.body;

  try {
    await hubspotClient.post(`/crm/v3/objects/${CUSTOM_OBJECT_TYPE}`, {
      properties: {
        name,
        species,
        care_level,
      },
    });

    res.redirect('/');
  } catch (err) {
    console.error('Error creating record:', err.response?.data || err.message);
    res.status(500).send('Error creating record in HubSpot.');
  }
});

app.listen(PORT, () => {
  console.log(`App running at http://localhost:${PORT}`);
});
