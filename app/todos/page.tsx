import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export default async function Page() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: todos } = await supabase.from('todos').select()

  return (
    <ul className="p-6 max-w-md mx-auto list-disc pl-8 space-y-1 text-sm font-medium">
      {todos?.map((todo) => (
        <li key={todo.id}>{todo.name}</li>
      ))}
      {(!todos || todos.length === 0) && (
        <p className="text-xs text-text-secondary">No todos found in Supabase.</p>
      )}
    </ul>
  )
}
