import { createServerSupabaseClient } from '@/lib/supabase/server'

export default async function Page() {
  const supabase = await createServerSupabaseClient()

  const { data: todos } = await supabase.from('todos').select()

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-4">Supabase Todos Checklist</h1>
      <ul className="list-disc pl-5 space-y-2">
        {todos?.map((todo) => (
          <li key={todo.id} className="text-sm font-medium">{todo.name}</li>
        ))}
      </ul>
      {(!todos || todos.length === 0) && (
        <p className="text-xs text-text-secondary">No todos found in Supabase todos table.</p>
      )}
    </div>
  )
}
