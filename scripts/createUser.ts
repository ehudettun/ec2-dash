const bcrypt = require('bcryptjs');
const connectMongo = require('../lib/mongodb');
const User = require('../models/User');

async function createUser(email: string, password: string) {
  await connectMongo();
  const hashedPassword = bcrypt.hashSync(password, 10);
  const user = new User({ email, password: hashedPassword });
  await user.save();
  console.log('User created:', user);
}

createUser('ehud@example.com', 'password').catch(console.error);
