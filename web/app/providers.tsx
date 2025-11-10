'use client'

import { useEffect, useState } from 'react'
import { TamaguiProvider, Theme } from 'tamagui'
import config from '../tamagui.config'

export default function Providers({ children }: { children: React.ReactNode }) {
	const [themeName, setThemeName] = useState<'latte' | 'mocha'>('latte')

	useEffect(() => {
		const mql = window.matchMedia('(prefers-color-scheme: dark)')
		const update = () => setThemeName(mql.matches ? 'mocha' : 'latte')
		update()
		mql.addEventListener?.('change', update)
		return () => mql.removeEventListener?.('change', update)
	}, [])

	return (
		<TamaguiProvider config={config}>
			<Theme name={themeName}>{children}</Theme>
		</TamaguiProvider>
	)
}
