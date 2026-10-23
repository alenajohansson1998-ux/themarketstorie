import assert from 'node:assert/strict';
import { afterEach, beforeEach, mock, test } from 'node:test';
import { createCloudinaryUploadSignature } from '../lib/cloudinary-signing.ts';

const keys = ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET', 'VITE_APP_CLOUD_NAME', 'VITE_APP_CLOUDINARY_API_KEY', 'VITE_APP_CLOUDINARY_API_SECRET'];
const original = new Map(keys.map(key => [key, process.env[key]]));

beforeEach(() => {
  for (const key of keys) delete process.env[key];
  process.env.CLOUDINARY_CLOUD_NAME = 'example';
  process.env.CLOUDINARY_API_KEY = 'test-key';
  process.env.CLOUDINARY_API_SECRET = 'abcd';
});

afterEach(() => {
  mock.restoreAll();
  for (const [key, value] of original) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
});

test('matches Cloudinary’s documented signature and returns no API secret', () => {
  mock.method(Date, 'now', () => 1315060510000);
  assert.deepEqual(createCloudinaryUploadSignature(), {
    cloudName: 'example', apiKey: 'test-key', timestamp: 1315060510,
    signature: 'a21ad0f63beb4de2e5575204b79ab90bffb02c10',
  });
});

test('supports existing Vite-named server settings during configuration migration', () => {
  for (const [canonical, legacy] of [
    ['CLOUDINARY_CLOUD_NAME', 'VITE_APP_CLOUD_NAME'],
    ['CLOUDINARY_API_KEY', 'VITE_APP_CLOUDINARY_API_KEY'],
    ['CLOUDINARY_API_SECRET', 'VITE_APP_CLOUDINARY_API_SECRET'],
  ]) {
    process.env[legacy] = process.env[canonical];
    delete process.env[canonical];
  }
  assert.equal(createCloudinaryUploadSignature().cloudName, 'example');
});

test('rejects missing credentials or an invalid cloud name', () => {
  delete process.env.CLOUDINARY_API_SECRET;
  assert.throws(createCloudinaryUploadSignature, /not configured/);
  process.env.CLOUDINARY_API_SECRET = 'abcd';
  process.env.CLOUDINARY_CLOUD_NAME = '../other';
  assert.throws(createCloudinaryUploadSignature, /not configured/);
});
