import { UpgradePlanPage } from '@/app/[locale]/upgrade/_components/upgrade-plan'

export default async function Page(props: {
	readonly searchParams?: Promise<{ readonly returnTo?: string }>
}) {
	const searchParams = props.searchParams ? await props.searchParams : undefined
	return <UpgradePlanPage returnTo={searchParams?.returnTo} />
}
