import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from '@/components/ui/avatar'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from '@/components/ui/sidebar'
import {
	ArrowUpDownIcon,
	DatabaseIcon,
	LaptopPhoneSyncIcon,
	Logout05Icon,
	Moon02Icon,
	Sun02Icon,
	UserIcon,
	Wallet01Icon,
} from '@hugeicons/core-free-icons'
import { Icon } from '@/components/ui/icon'
import { cn } from '@/lib/utils'

type SettingsSection = 'account' | 'data-controls' | 'subscription'

type ThemeMode = 'system' | 'light' | 'dark'

interface NavUserMenuUser {
	name: string
	email: string
	avatar: string
}

interface NavUserMenuProps {
	user: NavUserMenuUser
	initials: string
	isMobile: boolean
	selectedTheme: ThemeMode
	selectedThemeIndex: number
	setTheme: (theme: ThemeMode) => void
	openSettings: (section: SettingsSection) => void
	logout: () => void
}

export function NavUserMenu({
	user,
	initials,
	isMobile,
	selectedTheme,
	selectedThemeIndex,
	setTheme,
	openSettings,
	logout,
}: NavUserMenuProps) {
	return (
		<SidebarMenu>
			<SidebarMenuItem>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<SidebarMenuButton
							size="lg"
							className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
						>
							<Avatar className="size-8 rounded-md">
								<AvatarImage src={user.avatar} alt={user.name} />
								<AvatarFallback className="rounded-md">
									{initials}
								</AvatarFallback>
							</Avatar>
							<div className="grid flex-1 text-left text-sm leading-tight">
								<span className="truncate font-medium text-foreground/80">
									{user.name}
								</span>
								<span className="truncate text-xs text-foreground/40">
									{user.email}
								</span>
							</div>
							<Icon icon={ArrowUpDownIcon} className="ml-auto size-4" />
						</SidebarMenuButton>
					</DropdownMenuTrigger>
					<DropdownMenuContent
						className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-md"
						side={isMobile ? 'bottom' : 'right'}
						align="end"
						sideOffset={4}
					>
						<DropdownMenuLabel className="p-0 font-normal">
							<div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
								<Avatar className="size-8 rounded-md">
									<AvatarImage src={user.avatar} alt={user.name} />
									<AvatarFallback className="rounded-md">
										{initials}
									</AvatarFallback>
								</Avatar>
								<div className="grid flex-1 text-left text-sm leading-tight">
									<span className="truncate font-medium text-foreground/80">
										{user.name}
									</span>
									<span className="truncate text-xs text-foreground/40">
										{user.email}
									</span>
								</div>
							</div>
						</DropdownMenuLabel>
						<DropdownMenuItem onClick={() => openSettings('account')}>
							<Icon icon={UserIcon} />
							Conta
						</DropdownMenuItem>
						<DropdownMenuItem onClick={() => openSettings('data-controls')}>
							<Icon icon={DatabaseIcon} />
							Dados
						</DropdownMenuItem>
						<DropdownMenuItem onClick={() => openSettings('subscription')}>
							<Icon icon={Wallet01Icon} />
							Assinatura
						</DropdownMenuItem>
						<DropdownMenuItem
							className="cursor-default bg-transparent focus:bg-transparent data-highlighted:bg-transparent"
							onSelect={(e) => e.preventDefault()}
						>
							<div
								className="w-full"
								onClick={(e) => e.stopPropagation()}
							>
								<div className="flex w-full items-center justify-between gap-3">
									<span className="text-xs text-muted-foreground">Tema</span>
									<div className="relative h-8 w-[92px] overflow-hidden rounded-full border border-border">
										<div className="absolute inset-0 pointer-events-none">
											<div
												className="h-full w-1/3 flex items-center justify-center transition-transform duration-300"
												style={{
													transform: `translateX(${selectedThemeIndex * 100}%)`,
												}}
											>
												<div className="h-7 w-7 rounded-full border border-border bg-muted dark:bg-background" />
											</div>
										</div>
										<div className="relative grid h-full w-full grid-cols-3 place-items-center">
											<button
												type="button"
												className={cn(
													'flex h-full w-full items-center justify-center',
													'text-muted-foreground hover:text-foreground',
													selectedTheme === 'system' && 'text-foreground',
												)}
												onClick={() => setTheme('system')}
												aria-label="Theme: system"
											>
												<Icon
													icon={LaptopPhoneSyncIcon}
													className="size-4"
												/>
											</button>
											<button
												type="button"
												className={cn(
													'flex h-full w-full items-center justify-center',
													'text-muted-foreground hover:text-foreground',
													selectedTheme === 'light' && 'text-foreground',
												)}
												onClick={() => setTheme('light')}
												aria-label="Theme: light"
											>
												<Icon icon={Sun02Icon} className="size-4" />
											</button>
											<button
												type="button"
												className={cn(
													'flex h-full w-full items-center justify-center',
													'text-muted-foreground hover:text-foreground',
													selectedTheme === 'dark' && 'text-foreground',
												)}
												onClick={() => setTheme('dark')}
												aria-label="Theme: dark"
											>
												<Icon icon={Moon02Icon} className="size-4" />
											</button>
										</div>
									</div>
								</div>
							</div>
						</DropdownMenuItem>
						<DropdownMenuSeparator />
						<DropdownMenuItem className="focus:bg-destructive/20" onClick={logout}>
							<Icon icon={Logout05Icon} />
							Log out
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</SidebarMenuItem>
		</SidebarMenu>
	)
}
