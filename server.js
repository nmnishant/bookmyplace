const dotenv = require('dotenv');
const mongoose = require('mongoose');

// Must be at the top : Event listener should be defined before event i.e error in synchronous code in 'uncaughtException'
// Example - console.log(x) , x is not defined in our synchronous code, will be handled by this
// Must exit the process when caught uncaughtException
process.on('uncaughtException', (err) => {
  console.log(`UNCAUGHT EXCEPTION! ${err.name} : ${err.message}`);
  console.log(`Shutting down...`);
  process.exit(1);
});

dotenv.config({ path: './config.env' });
const app = require('./app');

const DBString = process.env.DB.replace('<password>', process.env.DB_PASS);

mongoose.connect(DBString).then(() => console.log('Database connected'));

const PORT = process.env.PORT || 4000;
const server = app.listen(PORT, () => {
  console.log(`App started on port : ${PORT}`);
});

// Handle "unhandled rejection in async code"
process.on('unhandledRejection', (err) => {
  console.log(`UNHANDLED REJECTION! ${err.name} : ${err.message}`);

  // Handle all running http requests and close the server, then exit the process
  server.close(() => {
    console.log(`Server closed. Shutting down...`);
    // Exit current process, so that third party service can restart our node app
    process.exit(1);
  });
});
