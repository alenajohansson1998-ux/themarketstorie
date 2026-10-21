// Keep the public /tag/:slug route on the server-rendered tag archive implementation.
export {
  default,
  generateMetadata,
} from '@/app/blog/tag/[slug]/page';

export const revalidate = 600;
