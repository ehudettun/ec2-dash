import NextAuth, { AuthOptions } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import CredentialsProvider from "next-auth/providers/credentials";
const connectMongo = require("../../../../lib/mongodb");
const User = require("../../../../models/User");
const bcrypt = require("bcryptjs");

const authOptions: AuthOptions = {
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
        console.log('hash:' + user.password);
        console.log('password:' + credentials.password);
        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
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

// Adapt NextAuth handler to use Next.js 13+ API route
const handler = async (req: NextRequest) => {
  // Convert NextRequest to the format that NextAuth expects
  const nextAuthHandler = await NextAuth(req as any, NextResponse as any, authOptions);
  return nextAuthHandler;
};

export { handler as GET, handler as POST };
