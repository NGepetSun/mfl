# MAPENDOS SIMPLE — GitHub HP Friendly

Hanya 5 file utama + 1 folder API. Tidak memakai Next.js, npm, atau node_modules.

## Upload GitHub via HP
Upload semua isi folder ini ke root repository:
- index.html
- vercel.json
- .env.example
- README.md
- hero-reference.png
- idp-crest.png
- ime-crest.png
- mapendos-wordmark.png
- pubg-logo.png
- api/state.js

## Vercel
Import repository → Settings → Environment Variables:
UPSTASH_REDIS_REST_URL
UPSTASH_REDIS_REST_TOKEN
ADMIN_PASSWORD
Lalu Redeploy.

Jika Upstash belum diisi, website tetap tampil memakai data default tetapi perubahan admin tidak tersimpan permanen.

## Admin
Tekan ADMIN LOGIN, masukkan ADMIN_PASSWORD. Password hanya disimpan di session browser dan dikirim saat menyimpan data.
