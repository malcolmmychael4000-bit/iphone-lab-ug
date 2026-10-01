import assert from 'node:assert/strict';
import test from 'node:test';
import { MAX_IMAGE_UPLOAD_BODY_BYTES, readImageUploadResponse } from './imageUpload.js';

test('image upload payload limit leaves a margin below Vercel request size limit', () => {
  assert.equal(MAX_IMAGE_UPLOAD_BODY_BYTES, 3 * 1024 * 1024);
  assert.ok(MAX_IMAGE_UPLOAD_BODY_BYTES < 4.5 * 1024 * 1024);
});

test('image upload reports non-JSON 413 responses without a JSON parse error', async () => {
  await assert.rejects(
    readImageUploadResponse(new Response('Request Entity Too Large', {
      status: 413,
      statusText: 'Payload Too Large',
    })),
    /request is too large/i,
  );
});

test('image upload returns the saved URL from a JSON response', async () => {
  assert.equal(
    await readImageUploadResponse(Response.json({ success: true, image_url: 'https://storage.example/photo.jpg' })),
    'https://storage.example/photo.jpg',
  );
});

test('image upload surfaces JSON server errors', async () => {
  await assert.rejects(
    readImageUploadResponse(Response.json(
      { error: 'Image upload request is too large. Choose a smaller image and try again.' },
      { status: 413 },
    )),
    /Choose a smaller image/,
  );
});

test('image upload rejects successful but invalid server responses clearly', async () => {
  await assert.rejects(
    readImageUploadResponse(new Response('upstream returned HTML')),
    /invalid server response/i,
  );
});
