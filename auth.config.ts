import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import dbConnect from './lib/mongodb';
import User from './models/User';

export const authConfig: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        await dbConnect();

        const user = await User.findOne({ email: credentials.email });

        if (!user || !user.password) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          image: user.image,
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  cookies: {
    sessionToken: {
      name: `${process.env.NODE_ENV === 'production' ? '__Secure-' : ''}next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        ...(process.env.NODE_ENV === 'production' ? { domain: 'themarketstories.com' } : {}),
      },
    },
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // For Google sign-ins, fetch the role from database
        if (user.email) {
          await dbConnect();
          const dbUser = await User.findOne({ email: user.email });
          token.role = dbUser?.role || 'user';
        } else {
          token.role = user.role;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        if (session.user.email) {
          // Fetch user to get correct _id
          await dbConnect();
          const dbUser = await User.findOne({ email: session.user.email });
          session.user.id = dbUser?._id.toString() || token.sub!;
        } else {
          session.user.id = token.sub!;
        }
        session.user.role = token.role as 'admin' | 'user';
      }
      return session;
    },
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google') {
        await dbConnect();

        const existingUser = await User.findOne({ email: user.email });

        if (!existingUser) {
          const newUser = new User({
            name: user.name,
            email: user.email,
            image: user.image,
            role: 'user',
          });
          await newUser.save();
        }
      }
      return true;
    },
    async redirect({ url, baseUrl }) {
      // Allow only URLs on the same origin for security
      if (url.startsWith(baseUrl)) return url;
      return baseUrl;
    },
  },
  pages: {
    signIn: '/login',
  },
  secret: process.env.AUTH_SECRET,
};
