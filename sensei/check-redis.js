import { createClient } from 'redis';

async function main() {
  const r = createClient({ url: 'redis://127.0.0.1:6379' });
  await r.connect();
  const keys = await r.keys('sensei:*');
  console.log('Active Redis Keys for Sensei:');
  for (const k of keys) {
    const val = await r.get(k);
    console.log(`  ${k} -> ${val}`);
  }
  await r.disconnect();
}

main().catch(console.error);
