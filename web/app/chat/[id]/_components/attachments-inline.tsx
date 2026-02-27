'use client'

import {
	Attachment,
	AttachmentHoverCard,
	AttachmentHoverCardContent,
	AttachmentHoverCardTrigger,
	AttachmentInfo,
	AttachmentPreview,
	AttachmentRemove,
	Attachments,
	getAttachmentLabel,
	getMediaCategory,
} from '@/components/ai-elements/attachments'
import type { AttachmentData } from '@/components/ai-elements/attachments'

interface AttachmentsInlineProps {
	attachments: AttachmentData[]
	onRemoveAttachment: (id: string) => void
}

export function AttachmentsInline({
	attachments,
	onRemoveAttachment,
}: AttachmentsInlineProps) {
	if (attachments.length === 0) return null

	return (
		<div className="mb-2 px-2">
			<Attachments variant="inline">
				{attachments.map((attachment) => {
					const mediaCategory = getMediaCategory(attachment)
					const label = getAttachmentLabel(attachment)

					return (
						<AttachmentHoverCard key={attachment.id}>
							<AttachmentHoverCardTrigger asChild>
								<Attachment
									data={attachment}
									onRemove={() =>
										onRemoveAttachment(attachment.id)
									}
								>
									<AttachmentPreview className="size-5 rounded bg-background" />
									<AttachmentInfo className="pr-6" />
									<AttachmentRemove
										className="absolute right-1 dark:hover:bg-transparent hover:bg-transparent"
										label="Remove"
									/>
								</Attachment>
							</AttachmentHoverCardTrigger>
							<AttachmentHoverCardContent>
								<div className="space-y-3">
									{mediaCategory === 'image' &&
										attachment.type === 'file' &&
										attachment.url && (
											<div className="flex max-h-96 w-80 items-center justify-center overflow-hidden rounded-md border">
												<img
													alt={label}
													className="max-h-full max-w-full object-contain"
													height={384}
													src={attachment.url}
													width={320}
												/>
											</div>
										)}
									<div className="space-y-1 px-0.5">
										<h4 className="font-semibold text-sm leading-none">
											{label}
										</h4>
										{attachment.mediaType && (
											<p className="font-mono text-muted-foreground text-xs">
												{attachment.mediaType}
											</p>
										)}
									</div>
								</div>
							</AttachmentHoverCardContent>
						</AttachmentHoverCard>
					)
				})}
			</Attachments>
		</div>
	)
}
