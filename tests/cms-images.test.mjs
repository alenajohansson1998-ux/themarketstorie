import assert from 'node:assert/strict';
import { afterEach, mock, test } from 'node:test';
import { MAX_CMS_IMAGE_SIZE, prepareCmsContent, uploadCmsImage } from '../lib/cms-images.ts';
import { sanitizeRichHtml } from '../lib/sanitizeHtml.ts';

const imageUrl = 'https://res.cloudinary.com/example/image/upload/article.png';
const image = () => new Blob(['image bytes'], { type: 'image/png' });
const authorization = { cloudName: 'example', apiKey: 'test-key', timestamp: 1315060510, signature: 'test-signature' };

function mockUpload(upload) {
  return mock.method(globalThis, 'fetch', async (url, options) => {
    if (url === '/api/cms/images/sign') {
      assert.equal(options.method, 'POST');
      return Response.json(authorization);
    }
    return upload(url, options);
  });
}

afterEach(() => {
  mock.restoreAll();
});

test('authorizes the upload and sends the image with signed multipart fields', async () => {
  const fetchMock = mockUpload(async (url, options) => {
    assert.equal(url, 'https://api.cloudinary.com/v1_1/example/image/upload');
    assert.equal(options.method, 'POST');
    assert.equal(options.body.get('api_key'), authorization.apiKey);
    assert.equal(options.body.get('timestamp'), String(authorization.timestamp));
    assert.equal(options.body.get('signature'), authorization.signature);
    assert.equal(options.body.has('upload_preset'), false);
    assert.equal(options.body.has('api_secret'), false);
    assert.equal(options.body.get('file').name, 'article.png');
    assert.equal(options.body.get('file').type, 'image/png');
    assert.equal(await options.body.get('file').text(), 'image bytes');
    assert.ok(options.signal instanceof AbortSignal);
    return Response.json({ secure_url: imageUrl });
  });
  assert.equal(await uploadCmsImage(image(), 'article.png'), imageUrl);
  assert.deepEqual(JSON.parse(fetchMock.mock.calls[0].arguments[1].body), { type: 'image/png', size: image().size });
});

test('rejects unsupported, empty, and oversized files before making a request', async () => {
  const fetchMock = mock.method(globalThis, 'fetch');
  for (const type of ['text/plain', 'image/svg+xml']) {
    await assert.rejects(uploadCmsImage(new Blob(['file'], { type }), 'file'), /Choose a JPG/);
  }
  await assert.rejects(uploadCmsImage(new Blob([], { type: 'image/png' }), 'empty.png'), /empty/);
  await assert.rejects(
    uploadCmsImage(new Blob([new Uint8Array(MAX_CMS_IMAGE_SIZE + 1)], { type: 'image/png' }), 'large.png'),
    /10 MB/,
  );
  assert.equal(fetchMock.mock.callCount(), 0);
});

test('accepts a file at the size limit', async () => {
  mockUpload(async () => Response.json({ secure_url: imageUrl }));
  const file = new Blob([new Uint8Array(MAX_CMS_IMAGE_SIZE)], { type: 'image/webp' });
  assert.equal(await uploadCmsImage(file, 'limit.webp'), imageUrl);
});

test('shows the provider error so account/configuration failures can be diagnosed', async () => {
  mockUpload(async () => Response.json(
    { error: { message: 'cloud_name is disabled' } }, { status: 400 },
  ));
  await assert.rejects(uploadCmsImage(image(), 'article.png'), /cloud_name is disabled/);
});

test('rejects HTTP failures even if the response includes a URL', async () => {
  mockUpload(async () => Response.json({ secure_url: imageUrl }, { status: 500 }));
  await assert.rejects(uploadCmsImage(image(), 'article.png'), /HTTP 500/);
});

test('handles invalid JSON and missing or insecure upload URLs', async () => {
  for (const response of [
    new Response('<html>Bad gateway</html>', { status: 502 }),
    Response.json({}),
    Response.json({ secure_url: '' }),
    Response.json({ secure_url: 'http://example.com/image.png' }),
  ]) {
    mockUpload(async () => response);
    await assert.rejects(uploadCmsImage(image(), 'article.png'), /Image upload failed/);
    mock.restoreAll();
  }
});

test('handles network failures with a retry message', async () => {
  mock.method(globalThis, 'fetch', async () => { throw new TypeError('Failed to fetch'); });
  await assert.rejects(uploadCmsImage(image(), 'article.png'), /Check your connection and try again/);
});

test('blocks an unauthenticated upload before contacting Cloudinary', async () => {
  const fetchMock = mock.method(globalThis, 'fetch', async () => Response.json(
    { error: 'Please sign in to upload images.' }, { status: 401 },
  ));
  await assert.rejects(uploadCmsImage(image(), 'article.png'), /Please sign in/);
  assert.equal(fetchMock.mock.callCount(), 1);
});

test('rejects malformed signing responses without contacting an upload endpoint', async () => {
  const fetchMock = mock.method(globalThis, 'fetch', async () => Response.json({ cloudName: '../../other' }));
  await assert.rejects(uploadCmsImage(image(), 'article.png'), /Could not authorize/);
  assert.equal(fetchMock.mock.callCount(), 1);
});

test('handles a network failure during the Cloudinary upload', async () => {
  mockUpload(async () => { throw new TypeError('Failed to fetch'); });
  await assert.rejects(uploadCmsImage(image(), 'article.png'), /Check your connection and try again/);
});

test('waits for uploads and saves the latest editor content with durable image URLs', async () => {
  let finishUpload;
  let contentRead = false;
  const uploadedContent = `<p>Article</p><img src="${imageUrl}" alt="Chart">`;
  const prepared = prepareCmsContent({
    uploadImages: () => new Promise((resolve) => { finishUpload = resolve; }),
    getContent: () => { contentRead = true; return uploadedContent; },
  }, '<p>Stale React state</p><img src="blob:local-image">');
  await Promise.resolve();
  assert.equal(contentRead, false);
  finishUpload([{ status: true, removed: false }]);
  assert.equal(await prepared, uploadedContent);
  assert.equal(sanitizeRichHtml(await prepared), uploadedContent);
});

test('blocks saving if an editor upload fails', async () => {
  await assert.rejects(prepareCmsContent({
    uploadImages: async () => [{ status: false, removed: false }],
    getContent: () => '<img src="blob:failed-image">',
  }, '<p>Article</p>'), /could not be uploaded/);
});

test('allows saving after a failed image has been removed', async () => {
  assert.equal(await prepareCmsContent({
    uploadImages: async () => [{ status: false, removed: true }],
    getContent: () => '<p>Article</p>',
  }, ''), '<p>Article</p>');
});

test('blocks unresolved local images even when the upload scan returns no failures', async () => {
  for (const content of [
    '<img src="blob:pending-image">',
    "<img alt='Chart' src='data:image/png;base64,aGVsbG8='>",
    '<IMG SRC = blob:pending-image>',
  ]) {
    await assert.rejects(prepareCmsContent(null, content), /has not finished uploading/);
    await assert.rejects(prepareCmsContent({
      uploadImages: async () => [],
      getContent: () => content,
    }, ''), /has not finished uploading/);
  }
});

test('preserves articles with no local images when the editor has not initialized', async () => {
  const content = `<p>Article</p><img src="${imageUrl}">`;
  assert.equal(await prepareCmsContent(null, content), content);
});

test('checks the actual source attribute without treating alt text or data attributes as uploads', async () => {
  const content = `<img alt="Example src=blob:local" data-src="blob:placeholder" src="${imageUrl}">`;
  assert.equal(await prepareCmsContent(null, content), content);
});
