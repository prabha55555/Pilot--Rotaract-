import { supabase } from '../config/supabase.js'

export const createNotification = async (userId, title, message, type, relatedId = null) => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .insert([
        {
          user_id: userId,
          title,
          message,
          type,
          related_id: relatedId,
          is_read: false
        }
      ])
      .select()
    
    if (error) throw error
    return data
  } catch (err) {
    console.error('❌ Error creating notification:', err.message)
    return null
  }
}

export const notifyRole = async (role, title, message, type, relatedId = null) => {
  try {
    // Fetch all active users with this role
    const { data: users, error } = await supabase
      .from('users')
      .select('id')
      .eq('role', role)
      .eq('status', 'Active')

    if (error) throw error

    if (users && users.length > 0) {
      const inserts = users.map(u => ({
        user_id: u.id,
        title,
        message,
        type,
        related_id: relatedId,
        is_read: false
      }))

      const { data, error: insertError } = await supabase
        .from('notifications')
        .insert(inserts)
        .select()

      if (insertError) throw insertError
      return data
    }
  } catch (err) {
    console.error(`❌ Error notifying role ${role}:`, err.message)
    return null
  }
}
