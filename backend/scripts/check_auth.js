import { supabase } from '../config/supabase.js'

async function main() {
  console.log('Listing Supabase Auth users...\n')

  const { data, error } = await supabase.auth.admin.listUsers()

  if (error) {
    console.error('Error listing auth users:', error.message)
    return
  }

  console.log(`Found ${data.users.length} auth users:\n`)
  for (const u of data.users) {
    console.log(`- ID: ${u.id}`)
    console.log(`  Email: ${u.email}`)
    console.log(`  Created: ${u.created_at}`)
    console.log(`  Last Sign In: ${u.last_sign_in_at || 'Never'}`)
    console.log(`  Confirmed: ${u.email_confirmed_at ? 'Yes' : 'No'}`)
    console.log()
  }

  // Try to sign in with the problem credentials


  if (loginError) {
    console.error('❌ Login failed:', loginError.message)
  } else {
    console.log('✅ Login succeeded! User ID:', loginData.user?.id)
  }
}

main().catch(console.error)
