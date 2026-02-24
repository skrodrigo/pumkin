import { UpgradePlanPage } from '@/app/upgrade/_components/upgrade-plan'

export default function Page(props: {
	searchParams?: {
		returnTo?: string
	}
}) {
	return <UpgradePlanPage returnTo={props.searchParams?.returnTo} />
}
