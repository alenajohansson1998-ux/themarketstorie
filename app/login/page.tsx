import type { Metadata } from 'next';
import AuthPage from '../auth-page';

export const metadata: Metadata = {
  title: 'Login | The Market Stories',
  description: 'Sign in to your The Market Stories account to access personalized market news and analysis.',
  alternates: { canonical: 'https://themarketstories.com/login' },
  robots: { index: false, follow: false },
};

export default function Page() {
  return <AuthPage />;
}
