import { supabase } from '../config/supabase.js'

async function main() {
  console.log('Querying promotions...')
  const { data: promotions, error } = await supabase
    .from('promotions')
    .select('*')

  if (error) {
    console.error('Promotions fetch error:', error)
    return
  }

  console.log(promotions)
}

main().catch(console.error)
