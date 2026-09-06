const KEY = 'mapendos:live:state:v1';

function redisConfig() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) throw new Error('Missing UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN');
  return { url: url.replace(/\/$/, ''), token };
}

async function redis(command) {
  const { url, token } = redisConfig();
  const res = await fetch(`${url}/${command.map(encodeURIComponent).join('/')}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch { data = { result: text }; }
  if (!res.ok) throw new Error(data?.error || `Redis HTTP ${res.status}`);
  return data.result;
}

module.exports = async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const raw = await redis(['get', KEY]);
      res.setHeader('Cache-Control', 'no-store');
      return res.status(200).json({ ok: true, state: raw ? JSON.parse(raw) : null });
    }

    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      if (!body || typeof body !== 'object') return res.status(400).json({ ok:false, error:'Invalid state' });
      const payload = JSON.stringify({ ...body, updatedAt: Date.now() });
      await redis(['set', KEY, payload]);
      res.setHeader('Cache-Control', 'no-store');
      return res.status(200).json({ ok:true, updatedAt: Date.now() });
    }

    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ ok:false, error:'Method not allowed' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok:false, error: err.message || 'Server error' });
  }
};
