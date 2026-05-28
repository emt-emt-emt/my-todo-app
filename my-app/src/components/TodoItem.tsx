'use client'

import { toggleTodo, deleteTodo } from '@/app/actions'

interface TodoItemProps {
  id: string
  title: string
  completed: boolean
}

export default function TodoItem({ id, title, completed }: TodoItemProps) {
  return (
    <div className="group flex items-center gap-3 px-4 py-3 bg-white rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-all">
      <form action={() => toggleTodo(id, completed)}>
        <button
          type="submit"
          className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all cursor-pointer ${
            completed
              ? 'bg-green-500 border-green-500'
              : 'border-gray-300 hover:border-blue-400'
          }`}
        >
          {completed && (
            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>
      </form>

      <span
        className={`flex-1 text-base transition-all ${
          completed ? 'text-gray-400 line-through' : 'text-gray-800'
        }`}
      >
        {title}
      </span>

      <form action={() => deleteTodo(id)}>
        <button
          type="submit"
          className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-all cursor-pointer"
          title="删除"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </form>
    </div>
  )
}
