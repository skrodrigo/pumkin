export interface GenerateImageInput {
	chatId: string
	messageId?: string
	prompt: string
	model: string
	returnBase64Preview?: boolean
}

export interface GenerateImageOutput {
	id: string
	imageUrl: string
	mediaType: string
	base64Preview?: string
}

export const imagesService = {
	async generate(input: GenerateImageInput) {
		const res = await fetch('/api/images/generate', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			cache: 'no-store',
			body: JSON.stringify(input),
		})

		if (!res.ok) {
			const body = await res.json().catch(() => null)
			const code = body?.statusCode ?? res.status
			throw new Error(
				JSON.stringify({
					statusCode: code,
					error: body?.error || `Request failed (${code})`,
				}),
			)
		}

		const payload = await res.json().catch(() => null)
		const data = payload?.data as GenerateImageOutput | undefined
		if (!data?.id || !data?.imageUrl || !data?.mediaType) {
			throw new Error(
				JSON.stringify({
					statusCode: 500,
					error: 'Invalid response from image generation',
				}),
			)
		}

		return data
	},
}
