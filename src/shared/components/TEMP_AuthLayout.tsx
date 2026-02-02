import TashaLogo from './NewTashaLogo';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
	return (
		<div
			className='flex min-h-screen w-full items-center justify-center'
			style={{
				background: 'linear-gradient(135deg, #09424A, #0C5E6A, #34ACBE)', // diagonal gradient
			}}
		>
			<div className='flex w-full max-w-[625px] flex-col items-center justify-center gap-y-8 rounded-2xl border border-slate-border bg-white-primary p-4 max-sm:min-h-screen sm:p-[90px]'>
				<TashaLogo />
				{children}
			</div>
		</div>
	);
}
