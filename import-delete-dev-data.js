const fs = require('fs');
const mongoose = require('mongoose');
const Tour = require('./models/tourModel');
const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });
const DBString = process.env.DB.replace(
  '<password>',
  process.env.DB_PASS
);
mongoose.connect(DBString).then(() => {
  console.log('Database connected');
});

const data = JSON.parse(
  fs.readFileSync('./data/tourData.json', 'utf8')
);

async function importData() {
  try {
    await Tour.create(data);
    console.log('Tour data uploaded successfully');
  } catch (err) {
    console.log(err);
  }
}

async function deleteData() {
  try {
    await Tour.deleteMany();
    console.log('Tour data deleted successfully');
  } catch (err) {
    console.log(err);
  }
}

if (process.argv[2] === '--import') importData();
else if (process.argv[2] === '--delete') deleteData();
