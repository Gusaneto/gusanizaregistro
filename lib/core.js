import {createClient} from '@supabase/supabase-js';
const url=process.env.SUPABASE_URL, anon=process.env.SUPABASE_ANON_KEY, service=process.env.SUPABASE_SERVICE_ROLE_KEY;
export function clients(){if(!url||!anon||!service)throw Error('Faltan variables de entorno Supabase');return {publicClient:createClient(url,anon,{auth:{persistSession:false,autoRefreshToken:false}}),admin:createClient(url,service,{auth:{persistSession:false,autoRefreshToken:false}})}}
export function cookies(req){
 const parsed={};
 for(const piece of String(req.headers.cookie||'').split(';')){
  const i=piece.indexOf('=');if(i<1)continue;
  const key=piece.slice(0,i).trim();
  try{parsed[key]=decodeURIComponent(piece.slice(i+1).trim())}catch{parsed[key]=piece.slice(i+1).trim()}
 }
 return parsed;
}
export function setSession(res,token){res.setHeader('Set-Cookie',`gs_session=${encodeURIComponent(token)}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=3600`)}
export function clearSession(res){res.setHeader('Set-Cookie','gs_session=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0')}
export async function identity(req){
 const token=cookies(req).gs_session;
 if(!token){console.warn('[Gusaniza session] Cookie gs_session ausente; cookie-header:',Boolean(req.headers.cookie));return null}
 console.info('[Gusaniza session] Cookie recibida; longitud:',token.length);
 const {publicClient,admin}=clients();
 const {data,error}=await publicClient.auth.getUser(token);
 const user=data?.user;
 if(error||!user){console.warn('[Gusaniza session] Token no validado:',error?.status||'sin usuario',error?.code||'');return null}
 const {data:profile,error:pe}=await admin.from('perfiles_gusaniza').select('id,estado,administrador').eq('id',user.id).maybeSingle();
 if(pe)throw pe;
 if(!profile)console.warn('[Gusaniza session] Perfil no encontrado');
 return {user,profile};
}
export function ok(res,data,status=200){res.status(status).json(data)}
export function fail(res,msg,status=400){res.status(status).json({error:msg})}
export function method(req,res,allowed){if(!allowed.includes(req.method)){fail(res,'Método no permitido',405);return false}return true}
export function safeError(res,e){console.error(e);fail(res,'No se pudo completar la operación. Revisa la configuración y los registros.',500)}
