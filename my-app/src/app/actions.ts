'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'

const supabase = createClient(supabaseUrl, supabaseKey)

export async function addTodo(formData: FormData) {
  const title = formData.get('title') as string
  if (!title?.trim()) return

  await supabase.from('todos').insert({ title: title.trim() })
  revalidatePath('/')
}

export async function toggleTodo(id: string, completed: boolean) {
  await supabase.from('todos').update({ completed: !completed }).eq('id', id)
  revalidatePath('/')
}

export async function deleteTodo(id: string) {
  await supabase.from('todos').delete().eq('id', id)
  revalidatePath('/')
}
