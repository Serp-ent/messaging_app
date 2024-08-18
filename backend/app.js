const express = require('express');
const usersRoute = require('./routes/usersRoute');
const conversationsRoute = require('./routes/conversationsRoute');
const messagesRoute = require('./routes/messagesRoute');
const errorHandler = require('./error/errorHandler');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/users', usersRoute);
app.use('/api/messages', messagesRoute);
app.use('/api/conversations', conversationsRoute);

app.use(errorHandler);

const PORT = 3000;
app.listen(PORT, () => {
  console.log('express started listening on port', PORT);
});