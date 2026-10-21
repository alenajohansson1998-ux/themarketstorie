import type { Metadata } from 'next';
import AuthPage from '../auth-page';

export const metadata: Metadata = {
  title: 'Register | The Market Stories',
  description: 'Create a free account on The Market Stories to track markets, save articles, and get personalised financial news.',
  alternates: { canonical: 'https://themarketstories.com/register' },
  robots: { index: false, follow: false },
};

export default function Page() {
  return <AuthPage initialMode="register" />;
}
