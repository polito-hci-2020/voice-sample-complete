// imports
const express = require('express');
const morgan = require('morgan'); // logging middleware
const dialogflow = require('@google-cloud/dialogflow'); // dialogflow
const uuid = require('uuid'); // to generate uuid (for dialogflow)

// init
const app = express();
const port = 3000;

// set up the middleware
app.use(morgan('tiny'));

// every requests body will be considered as in JSON format
app.use(express.json());

// set up the 'public' component as a static website
app.use(express.static('public'));
app.get('/', (req, res) => res.redirect('/index.html'));

// here we call Dialogflow to get the "right" answer to the received message
app.post('/process', async (req, res) => {
  // a unique identifier for the given session
  const sessionId = uuid.v4();

  // create a new session starting from the client secret file
  const sessionClient = new dialogflow.SessionsClient({
    keyFilename: require('path').join('client-secret.json'),
  });
  const sessionPath = sessionClient.projectAgentSessionPath('weatheragent-agnxyr', sessionId);

  // the text query request
  const request = {
    session: sessionPath,
    queryInput: {
      text: {
        // the query to send to the dialogflow agent
        text: req.body.message,
        // the language used by the client (en-US)
        languageCode: 'en-US',
      },
    },
  };

  // send the request to Dialogflow and return the answer
  const responses = await sessionClient.detectIntent(request);
  const result = responses[0].queryResult;
  res.send(result.fulfillmentText);
});

// activate the server
app.listen(port, () => console.log(`Server listening at http://localhost:${port}`));