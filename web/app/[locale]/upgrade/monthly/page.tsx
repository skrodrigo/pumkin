import { UpgradeCheckoutPage } from '@/app/[locale]/upgrade/_components/upgrade'

export default async function Page(props: {
	searchParams?: Promise<{
		returnTo?: string
		coupon?: string
	}>
}) {
	const searchParams = await props.searchParams
	return (
		<UpgradeCheckoutPage
			plan="pro_monthly"
			returnTo={searchParams?.returnTo}
			coupon={searchParams?.coupon}
		/>
	)
}
