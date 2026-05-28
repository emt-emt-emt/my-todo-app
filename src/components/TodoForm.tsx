'use client'

import { addTodo } from '@/app/actions'
import { useRef } from 'react'

export default function TodoForm() {
  const ref = useRef<HTMLFormElement>(null)

  return (
    <form
      ref={ref}
      action={async (formData) => {
        await addTodo(formData)
        ref.current?.reset()
      }}
      className="flex gap-2 w-full"
    >
      <input
        type="text"
        name="title"
        placeholder="输入新任务..."
        required
        className="flex-1 px-4 py-3 rounded-lg border border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
      />
      <button
        type="submit"
        className="px-6 py-3 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 active:scale-95 transition-all shadow-sm"
      >
        添加
      </button>
    </form>
  )
}
