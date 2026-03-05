import { fetchJson } from './api'

export interface ChatListItem {
	readonly id: string
	readonly title: string
	readonly pinnedAt?: string | null
	readonly createdAt?: string
	readonly updatedAt?: string
	readonly model?: string | null
	readonly archivedAt?: string | null
}

export const chatsService = {
	async list(params: { readonly token: string }) {
		return fetchJson<{ readonly success: boolean; readonly data: ChatListItem[] }>({
			path: '/api/chats',
			token: params.token,
		})
	},

	async getById(params: { readonly token: string; readonly id: string; readonly branchId?: string | null }) {
		const query = params.branchId ? `?branchId=${encodeURIComponent(params.branchId)}` : ''
		return fetchJson<{ readonly success: boolean; readonly data: any }>({
			path: `/api/chats/${params.id}${query}`,
			token: params.token,
		})
	},

	async pin(params: { readonly token: string; readonly id: string }) {
		return fetchJson<{ readonly success: boolean }>({
			path: `/api/chats/${params.id}/pin`,
			method: 'PATCH',
			token: params.token,
		})
	},

	async unpin(params: { readonly token: string; readonly id: string }) {
		return fetchJson<{ readonly success: boolean }>({
			path: `/api/chats/${params.id}/unpin`,
			method: 'PATCH',
			token: params.token,
		})
	},

	async rename(params: { readonly token: string; readonly id: string; readonly title: string }) {
		return fetchJson<{ readonly success: boolean }>({
			path: `/api/chats/${params.id}/rename`,
			method: 'PATCH',
			token: params.token,
			body: { title: params.title },
		})
	},

	async archive(params: { readonly token: string; readonly id: string }) {
		return fetchJson<{ readonly success: boolean }>({
			path: `/api/chats/${params.id}/archive`,
			method: 'PATCH',
			token: params.token,
		})
	},

	async unarchive(params: { readonly token: string; readonly id: string }) {
		return fetchJson<{ readonly success: boolean }>({
			path: `/api/chats/${params.id}/unarchive`,
			method: 'PATCH',
			token: params.token,
		})
	},

	async delete(params: { readonly token: string; readonly id: string }) {
		return fetchJson<{ readonly success: boolean }>({
			path: `/api/chats/${params.id}`,
			method: 'DELETE',
			token: params.token,
		})
	},
}
