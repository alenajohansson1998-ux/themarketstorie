import { permanentRedirect } from 'next/navigation';

// "More" was an empty placeholder. Send old links and bookmarks to the home page.
export default function MorePage() {
  permanentRedirect('/');
}
