import { supabase } from '../config/supabase.js'

async function main() {
  console.log('Querying users...')
  const { data: users, error: userErr } = await supabase
    .from('users')
    .select('*')

  if (userErr) {
    console.error('Users fetch error:', userErr)
    return
  }

  console.log('--- USERS ---')
  console.log(users.map(u => ({ id: u.id, name: u.name, role: u.role, status: u.status })))

  console.log('Querying promotions...')
  const { data: promotions, error } = await supabase
    .from('promotions')
    .select('*')

  if (error) {
    console.error('Promotions fetch error:', error)
    return
  }

  console.log('--- PROMOTIONS ---')
  console.log(promotions)

  console.log('Querying activities...')
  const { data: activities, error: actErr } = await supabase
    .from('activities')
    .select('*')

  if (actErr) {
    console.error('Activities fetch error:', actErr)
    return
  }

  console.log('--- ACTIVITIES ---')
  console.log(activities)
}

main().catch(console.error)
