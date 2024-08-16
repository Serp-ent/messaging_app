const express = require('express');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = 3000;
app.listen(PORT, () => {
  console.log('express started listening on port', PORT);
});