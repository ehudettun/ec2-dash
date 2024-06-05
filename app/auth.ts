import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import connectMongo from "@/lib/mongodb"
import bcrypt from "bcryptjs"
import User from "../models/User"

// Define an interface for the credentials
interface ICredentials {
    email: string;
    password: string;
  }
  

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [ Credentials({
    // You can specify which fields should be submitted, by adding keys to the `credentials` object.
    // e.g. domain, username, password, 2FA token, etc.
    credentials: {
      email: {},
      password: {},
    },
    authorize: async (credentials) => {
        let user = null;
        if (!credentials) {
            throw new Error('No credentials provided');
           
        }
        // Type assertion to ensure credentials is of type ICredentials
        const creds = credentials as ICredentials;
        console.log('Connecting to MongoDB...');
        await connectMongo();

        console.log('Finding user...');
        user = await User.findOne({ email: creds.email });
        if (!user) {
            throw new Error("User not found.")
          
        }

        console.log('User found:', user);

        
        const isPasswordValid = await bcrypt.compare(creds.password, user.password);
        console.log(isPasswordValid)
        if (!isPasswordValid) {
            throw new Error("Error: invalid password!")
          
        }

        console.log('User authenticated successfully');
        return { id: user._id.toString(), email: user.email }; // Ensure id and email are returned
      },
      
    }),],
    pages: {
        signIn: "/login", // Custom login page path
      },
    
});