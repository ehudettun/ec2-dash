import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
const connectMongo = require("../../../../lib/mongodb");
const User = require("../../../../models/User");
const bcrypt = require("bcryptjs");

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        if (!credentials) {
          console.error('No credentials provided');
          return null;
        }

        console.log('Connecting to MongoDB...');
        await connectMongo();

        console.log('Finding user...');
        const user = await User.findOne({ email: credentials.email });
        if (!user) {
          console.error('User not found');
          return null;
        }

        console.log('User found:', user);

        console.log('Comparing passwords...');
        console.log('hash:'+user.password);
        console.log('password:'+credentials.password);
        const isPasswordValid = bcrypt.compare(credentials.password, user.password);
        if (!isPasswordValid) {
          console.error('Invalid password. Provided:', credentials.password, 'Stored:', user.password);
          return null;
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
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
