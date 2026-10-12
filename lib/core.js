import {createClient} from '@supabase/supabase-js';
const url=process.env.SUPABASE_URL, anon=process.env.SUPABASE_ANON_KEY, service=process.env.SUPABASE_SERVICE_ROLE_KEY;
export function clients(){if(!url||!anon||!service)throw Error('Faltan variables de entorno Supabase');return {publicClient:createClient(url,anon,{auth:{persistSession:false,autoRefreshToken:false}}),admin:createClient(url,service,{auth:{persistSession:false,autoRefreshToken:false}})}}
export function cookies(req){return Object.fromEntries((req.headers.cookie||'').split(';').filter(Boolean).map(x=>{let p=x.indexOf('=');return [x.slice(0,p).trim(),decodeURIComponent(x.slice(p+1))]}))}
export function setSession(res,token){res.setHeader('Set-Cookie',`gs_session=${encodeURIComponent(token)}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=3600`)}
export function clearSession(res){res.setHeader('Set-Cookie','gs_session=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0')}
export async function identity(req){const {admin}=clients();const token=cookies(req).gs_session;if(!token)return null;const {data:{user},error}=await admin.auth.getUser(token);if(error||!user)return null;const {data:profile,error:pe}=await admin.from('perfiles_gusaniza').select('id,email,estado,administrador').eq('id',user.id).maybeSingle();if(pe)throw pe;return {user,profile}}
export function ok(res,data,status=200){res.status(status).json(data)}
export function fail(res,msg,status=400){res.status(status).json({error:msg})}
export function method(req,res,allowed){if(!allowed.includes(req.method)){fail(res,'Método no permitido',405);return false}return true}
export function safeError(res,e){console.error(e);fail(res,'No se pudo completar la operación. Revisa la configuración y los registros.',500)}
