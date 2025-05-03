import UserProfile from "@/components/shared/UserProfile"
import { isAuthenticated } from "@/lib/actions/auth.action"
import Image from "next/image"
import Link from "next/link"
import { redirect } from "next/navigation"

const RootLayout = async ({ children }: { children: React.ReactNode }) => {
	const isUserAuthenticated = await isAuthenticated()

	if (!isUserAuthenticated) redirect("/sign-in")

	return (
		<div className="root-layout">
			<nav className="flex items-center justify-between">
				<div>
					<Link href="/" className="flex items-center gap-2">
						<Image src="/logo.svg" width={38} height={32} alt="logo" />
						<h2 className="text-primary-100">PrepWise</h2>
					</Link>
				</div>
				<div>
					<UserProfile />
				</div>
			</nav>
			{children}
		</div>
	)
}
export default RootLayout
