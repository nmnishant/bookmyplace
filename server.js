const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config({ path: './config.env' });
const app = require('./app');

const DBString = process.env.DB.replace(
  '<password>',
  process.env.DB_PASS
);

mongoose
  .connect(DBString)
  .then(() => console.log('Database connected'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`App started on port : ${PORT}`);
});
