# CMS image uploads

Configure these server environment variables locally and on the deployment:

```dotenv
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

The previous `VITE_APP_CLOUD_NAME`, `VITE_APP_CLOUDINARY_API_KEY`, and
`VITE_APP_CLOUDINARY_API_SECRET` names are supported for compatibility.
An unsigned upload preset is not required. The API secret remains on the server.

Authenticated authors request a signature from `POST /api/cms/images/sign` and
upload directly to Cloudinary. Feature images, article images, and broker images
share this flow. Supported formats are JPG, PNG, WebP, GIF, and AVIF, up to 10 MB.

Run the focused tests with Node.js 22.6 or later:

```sh
node --experimental-strip-types --test tests/cms-images.test.mjs tests/cloudinary-signing.test.mjs
```
