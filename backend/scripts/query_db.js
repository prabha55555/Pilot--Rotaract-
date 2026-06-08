import { supabase } from '../config/supabase.js'

async function main() {
  console.log('Querying users...')
  const { data: users, error } = await supabase
    .from('users')
    .select('*')

  if (error) {
    console.error('Users fetch error:', error)
    return
  }

  console.log(`Found ${users.length} users:`)
  for (const u of users) {
    console.log(`- ID: ${u.id}, Name: "${u.name}", Email: "${u.email}", Role: "${u.role}", Status: "${u.status}"`)
  }
}

main().catch(console.error)
