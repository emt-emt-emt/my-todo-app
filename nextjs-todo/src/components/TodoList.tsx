'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface Todo {
  id: string
  title: string
  is_complete: boolean
  created_at: string
}

export default function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [newTask, setNewTask] = useState('')
  const [loading, setLoading] = useState(true)

  // 获取所有任务
  const fetchTodos = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('获取任务失败:', error)
    } else {
      setTodos(data || [])
    }
    setLoading(false)
  }

  // 添加任务
  const addTodo = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTask.trim()) return

    const { data, error } = await supabase
      .from('todos')
      .insert([{ title: newTask.trim(), is_complete: false }])
      .select()

    if (error) {
      console.error('添加失败:', error)
      alert('添加任务失败')
    } else if (data) {
      setTodos([data[0], ...todos])
      setNewTask('')
    }
  }

  // 切换完成状态
  const toggleTodo = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('todos')
      .update({ is_complete: !currentStatus })
      .eq('id', id)

    if (error) {
      console.error('更新失败:', error)
    } else {
      setTodos(todos.map(todo =>
        todo.id === id ? { ...todo, is_complete: !currentStatus } : todo
      ))
    }
  }

  // 删除任务
  const deleteTodo = async (id: string) => {
    const { error } = await supabase
      .from('todos')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('删除失败:', error)
    } else {
      setTodos(todos.filter(todo => todo.id !== id))
    }
  }

  // 实时订阅
  useEffect(() => {
    fetchTodos()

    const channel = supabase
      .channel('todos')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'todos' },
        () => {
          fetchTodos()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const completedCount = todos.filter(t => t.is_complete).length
  const totalCount = todos.length

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      {/* 输入框 */}
      <form onSubmit={addTodo} className="flex gap-2 mb-6">
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="输入新任务..."
          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <button
          type="submit"
          disabled={!newTask.trim()}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
        >
          添加
        </button>
      </form>

      {/* 统计 */}
      <div className="mb-4 text-sm text-gray-600 flex justify-between">
        <span>总任务: {totalCount}</span>
        <span>已完成: {completedCount}</span>
      </div>

      {/* 任务列表 */}
      {loading ? (
        <div className="text-center py-8 text-gray-500">加载中...</div>
      ) : todos.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <p className="text-lg mb-2">📝</p>
          <p>暂无任务，添加一个吧！</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {todos.map((todo) => (
            <li
              key={todo.id}
              className={`flex items-center gap-3 p-4 rounded-lg border transition-all ${
                todo.is_complete
                  ? 'bg-gray-50 border-gray-200'
                  : 'bg-white border-gray-200 hover:border-blue-300'
              }`}
            >
              {/* 复选框 */}
              <input
                type="checkbox"
                checked={todo.is_complete}
                onChange={() => toggleTodo(todo.id, todo.is_complete)}
                className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
              />

              {/* 任务标题 */}
              <span
                className={`flex-1 text-lg ${
                  todo.is_complete
                    ? 'line-through text-gray-400'
                    : 'text-gray-800'
                }`}
              >
                {todo.title}
              </span>

              {/* 删除按钮 */}
              <button
                onClick={() => deleteTodo(todo.id)}
                className="px-3 py-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                title="删除"
              >
                🗑️
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
