import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '待办清单 - Todo List',
  description: '使用 Next.js + Supabase 构建的待办清单应用',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className="bg-gray-100 min-h-screen">{children}</body>
    </html>
  )
}
