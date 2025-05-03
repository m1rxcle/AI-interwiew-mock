"use client"

import { signOut } from "@/lib/actions/auth.action"
import Image from "next/image"
import { useState } from "react"

const UserProfile = () => {
	const [isOpen, setIsOpen] = useState(false)
	return (
		<div onClick={() => setIsOpen(!isOpen)} className="relative flex items-center cursor-pointer ">
			<Image src="/profile.svg" width={40} height={40} alt="profile " className="rounded-full" />
			{isOpen && (
				<div onClick={() => signOut()} className="absolute right-20 -left-7 top-12 w-[100px] h-[25px] bg-gray-800/50 rounded-md ">
					<p className="text-[16px] text-red-500 mx-auto text-center">Sign Out</p>
				</div>
			)}
		</div>
	)
}
export default UserProfile
