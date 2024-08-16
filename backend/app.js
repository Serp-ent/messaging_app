const express = require('express');
const usersRoute = require('./routes/usersRoute');
const conversationsRoute = require('./routes/conversationsRoute');
const messagesRoute = require('./routes/messagesRoute');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/users', usersRoute);
app.use('/api/messages', messagesRoute);
app.use('/api/conversation', conversationsRoute);

const PORT = 3000;
app.listen(PORT, () => {
  console.log('express started listening on port', PORT);
});