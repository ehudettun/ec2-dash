import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials"
const connectMongo = require("../lib/mongodb");
const User = require("../models/User");
const bcrypt = require("bcryptjs");

export const { handlers, signIn, signOut, auth } = NextAuth({
    debug: true,
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        let user = null;
        if (!credentials) {
            throw new Error('No credentials provided');
           
        }

        console.log('Connecting to MongoDB...');
        await connectMongo();

        console.log('Finding user...');
        user = await User.findOne({ email: credentials.email });
        if (!user) {
            throw new Error("User not found.")
          
        }

        console.log('User found:', user);

        console.log('Comparing passwords...');
        console.log('hash:' + user.password);
        console.log('password:' + credentials.password);
        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
        console.log(isPasswordValid)
        if (!isPasswordValid) {
            throw new Error("Error: invalid password!")
          
        }

        console.log('User authenticated successfully');
        return { id: user._id.toString(), email: user.email }; // Ensure id and email are returned
      },
    }),
  ],
  pages: {
    signIn: "/auth/signin", // Pointing to the custom sign-in page
  },
  secret: process.env.NEXTAUTH_SECRET,
});
