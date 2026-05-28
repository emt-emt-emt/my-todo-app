import { supabase } from '@/lib/supabase'
import TodoItem from './TodoItem'
import TodoForm from './TodoForm'

interface Todo {
  id: string
  title: string
  completed: boolean
  created_at: string
}

export default async function TodoList() {
  const { data: todos, error } = await supabase
    .from('todos')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    return (
      <div className="text-center py-12 text-red-500">
        加载失败：{error.message}
      </div>
    )
  }

  const items: Todo[] = todos || []
  const completedCount = items.filter((t) => t.completed).length
  const totalCount = items.length

  return (
    <div className="w-full max-w-xl mx-auto space-y-6">
      {/* 头部 */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">📝 待办清单</h1>
        <p className="text-sm text-gray-500">
          {totalCount === 0
            ? '还没有任务，添加一个吧！'
            : `共 ${totalCount} 项，已完成 ${completedCount} 项`}
        </p>
      </div>

      {/* 添加表单 */}
      <TodoForm />

      {/* 列表 */}
      {items.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <svg className="w-16 h-16 mx-auto mb-4 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
          <p className="text-lg">空空的，添加点任务吧</p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((todo) => (
            <TodoItem
              key={todo.id}
              id={todo.id}
              title={todo.title}
              completed={todo.completed}
            />
          ))}
        </div>
      )}
    </div>
  )
}
