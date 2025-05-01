const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('Backend běží!');
});

app.listen(PORT, () => {
  console.log(`Server běží na http://localhost:${PORT}`);
});
