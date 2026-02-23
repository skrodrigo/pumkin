const webSearchModels = new Set([
	'perplexity/sonar',
])

export function modelSupportsWebSearch(model: string) {
	return webSearchModels.has(model)
}
