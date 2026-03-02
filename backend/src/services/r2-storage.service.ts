import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import crypto from 'node:crypto'
import { env } from './../common/env.js'

function createS3Client() {
	return new S3Client({
		region: 'auto',
		endpoint: env.R2_ENDPOINT,
		credentials: {
			accessKeyId: env.R2_ACCESS_KEY_ID,
			secretAccessKey: env.R2_SECRET_ACCESS_KEY,
		},
	})
}

function sanitizePublicUrl(baseUrl: string) {
	return baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl
}

function buildPublicUrl(params: { baseUrl: string; key: string }) {
	const baseUrl = sanitizePublicUrl(params.baseUrl)
	const key = params.key.startsWith('/') ? params.key.slice(1) : params.key
	return `${baseUrl}/${key}`
}

function getFileExtension(mediaType: string) {
	if (mediaType === 'image/png') return 'png'
	if (mediaType === 'image/jpeg') return 'jpg'
	if (mediaType === 'image/webp') return 'webp'
	return 'bin'
}

export async function uploadGeneratedImage(params: {
	userId: string
	imageGenerationId: string
	bytes: Uint8Array
	mediaType: string
}) {
	const s3 = createS3Client()
	const ext = getFileExtension(params.mediaType)
	const key = `images/${params.userId}/${params.imageGenerationId}.${ext}`
	const etag = crypto.createHash('sha256').update(params.bytes).digest('hex')

	await s3.send(
		new PutObjectCommand({
			Bucket: env.R2_BUCKET_NAME,
			Key: key,
			Body: params.bytes,
			ContentType: params.mediaType,
			CacheControl: 'public, max-age=31536000, immutable',
			Metadata: {
				sha256: etag,
			},
		}),
	)

	return {
		key,
		etag,
		imageUrl: buildPublicUrl({ baseUrl: env.R2_PUBLIC_URL, key }),
	}
}
