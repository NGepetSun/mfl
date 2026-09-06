# MAPENDOS LIVE — Upstash Redis

Website ini mempertahankan `index.html` bracket full yang sudah dibuat sebelumnya, lalu menambahkan sinkronisasi state melalui Vercel Function + Upstash Redis.

## Environment Variables
Set:
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`

Gunakan **Standard Token hanya di server/Vercel Environment Variables**. Jangan menaruh token Standard di HTML/JS browser.

## Deploy
1. Upload folder ini ke GitHub.
2. Import repository ke Vercel.
3. Tambahkan dua environment variables di Vercel.
4. Deploy.

Admin melakukan perubahan seperti input team, draw, rolling, winner, dan skor. Perubahan disimpan ke Redis. Pengunjung publik melakukan polling state terbaru dan DOM mereka diperbarui otomatis.
