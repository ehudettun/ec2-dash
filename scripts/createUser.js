const bcrypt = require('bcryptjs');
require('dotenv').config();
const connectMongo = require('../lib/mongodb');
const User = require('../models/User');

async function createUser(email, password) {
  console.log(password);
  await connectMongo();
  
 // const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({ email, password: password });
  await user.save();
  console.log('User created:', user);
}

createUser('ehud@example.com', 'password').catch(console.error);
