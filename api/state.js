const KEY = 'mapendos:state';

async function redis(command, ...args) {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) throw new Error('Upstash environment variables belum diatur');
  const r = await fetch(url, {
    method:'POST',
    headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},
    body:JSON.stringify([command,...args])
  });
  const data = await r.json();
  if (!r.ok || data.error) throw new Error(data.error || 'Upstash error');
  return data.result;
}

const emptyPlayers = () => Array.from({length:5},()=>({name:'',logo:''}));
const fallback = {
  date:'COMING SOON', mode:'PUBG MOBILE', playersPerTeam:5, map:'RANDOM', grandPrize:'Rp 15.000.000',
  prize:[['JUARA 1','Rp 7.000.000'],['JUARA 2','Rp 4.000.000'],['JUARA 3','Rp 2.500.000'],['JUARA 4','Rp 1.500.000']],
  streams:[{name:'MAPENDOS IDP',url:''},{name:'MAPENDOS IME',url:''}],
  teams:Array.from({length:16},(_,i)=>({id:`t${i}`,name:'',side:i<8?'IDP':'IME',logo:'',players:emptyPlayers()})),
  winners:{}
};

function send(res,status,data){res.status(status).json(data)}
function cleanPlayer(p){
  if(typeof p==='string') return {name:String(p).slice(0,50),logo:''};
  return {name:String(p?.name||'').slice(0,50),logo:String(p?.logo||'').slice(0,500)};
}
function cleanBody(body){
  const teams=body.teams.map((t,i)=>({
    id:t.id||`t${i}`,
    name:String(t.name||'').slice(0,60),
    side:t.side==='IME'?'IME':'IDP',
    logo:String(t.logo||'').slice(0,500),
    players:Array.from({length:5},(_,j)=>cleanPlayer(Array.isArray(t.players)?t.players[j]:null))
  }));
  return {
    date:String(body.date||'COMING SOON').slice(0,80),
    mode:String(body.mode||'PUBG MOBILE').slice(0,80),
    playersPerTeam:5,
    map:String(body.map||'RANDOM').slice(0,80),
    grandPrize:String(body.grandPrize||'').slice(0,80),
    prize:Array.isArray(body.prize)?body.prize.slice(0,8).map(x=>[String(x?.[0]||'').slice(0,40),String(x?.[1]||'').slice(0,40)]):fallback.prize,
    streams:Array.isArray(body.streams)?body.streams.slice(0,2).map((s,i)=>({name:i===0?'MAPENDOS IDP':'MAPENDOS IME',url:String(s?.url||'').slice(0,500)})):fallback.streams,
    teams,
    winners:body.winners&&typeof body.winners==='object'?body.winners:{}
  };
}

module.exports = async (req,res)=>{
  try {
    if(req.method==='GET'){
      const raw=await redis('GET',KEY);
      return send(res,200,raw?JSON.parse(raw):fallback);
    }
    if(req.method==='POST'){
      if(!process.env.ADMIN_PASSWORD || req.headers['x-admin-password']!==process.env.ADMIN_PASSWORD) return send(res,401,{error:'Password admin salah'});
      let body=req.body;
      if(typeof body==='string') body=JSON.parse(body);
      if(body?.action==='login') return send(res,200,{ok:true});
      if(!body || !Array.isArray(body.teams) || body.teams.length!==16) return send(res,400,{error:'Data harus memiliki tepat 16 team'});
      const cleaned=cleanBody(body);
      await redis('SET',KEY,JSON.stringify(cleaned));
      return send(res,200,{ok:true});
    }
    res.setHeader('Allow','GET,POST');
    return send(res,405,{error:'Method not allowed'});
  } catch(e){ return send(res,500,{error:e.message||'Server error'}); }
};
