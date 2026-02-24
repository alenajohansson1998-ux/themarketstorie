import { DefaultSession, DefaultUser } from 'next-auth';
import { JWT, DefaultJWT } from 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: 'admin' | 'editor' | 'user';
    } & DefaultSession['user'];
  }

  interface User extends DefaultUser {
    role: 'admin' | 'editor' | 'user';
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    role: 'admin' | 'editor' | 'user';
  }
}
