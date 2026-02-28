import { UpgradeCheckoutPage } from '@/app/[locale]/upgrade/_components/upgrade'

export default function Page(props: {
	searchParams?: {
		returnTo?: string
	}
}) {
	return (
		<UpgradeCheckoutPage
			plan="pro_monthly"
			returnTo={props.searchParams?.returnTo}
		/>
	)
}
