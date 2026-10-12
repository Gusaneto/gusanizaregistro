import {clients,identity,ok,fail,method,setSession,clearSession,safeError} from '../lib/core.js';
export default async function handler(req,res){try{
 const action=String(req.query.action||''); const {publicClient,admin}=clients();
 if(action==='signup'){
 if(!method(req,res,['POST']))return;
 const {email,password}=req.body||{};if(typeof email!=='string'||typeof password!=='string'||password.length<10||password.length>128)return fail(res,'Correo válido y contraseña de al menos 10 caracteres');
 const {error}=await publicClient.auth.signUp({email:email.trim().toLowerCase(),password});if(error)return fail(res,error.message);
 return ok(res,{message:'Registro recibido. Confirma tu correo si se solicita y espera aprobación del administrador.'});
 }
 if(action==='login'){
 if(!method(req,res,['POST']))return;
 const {email,password}=req.body||{};const {data,error}=await publicClient.auth.signInWithPassword({email,password});if(error||!data.session)return fail(res,'Credenciales incorrectas o correo sin confirmar',401);
 const {data:profile,error:pe}=await admin.from('perfiles_gusaniza').select('estado,administrador').eq('id',data.user.id).maybeSingle();if(pe)throw pe;
 if(!profile||profile.estado!=='aprobado')return fail(res,'Tu cuenta todavía no está aprobada o está bloqueada',403);
 setSession(res,data.session.access_token);return ok(res,{message:'Sesión iniciada',admin:profile.administrador===true});
 }
 if(action==='logout'){if(!method(req,res,['POST']))return;clearSession(res);return ok(res,{message:'Sesión cerrada'})}
 if(action==='me'){if(!method(req,res,['GET']))return;const x=await identity(req);if(!x||x.profile?.estado!=='aprobado')return fail(res,'Sesión no autorizada',401);return ok(res,{email:x.user.email,admin:x.profile.administrador===true})}
 if(action==='reset-password'){
 if(!method(req,res,['POST']))return;
 const {access_token,password}=req.body||{};
 if(typeof access_token!=='string'||access_token.length<20||typeof password!=='string'||password.length<10||password.length>128)return fail(res,'Enlace o contraseña inválidos');
 const {data:{user},error:ue}=await admin.auth.getUser(access_token);
 if(ue||!user)return fail(res,'El enlace expiró o es inválido. Solicita uno nuevo.',401);
 const {error:re}=await admin.auth.admin.updateUserById(user.id,{password});if(re)throw re;
 clearSession(res);return ok(res,{message:'Contraseña actualizada. Ya puedes iniciar sesión.'});
 }
 if(action==='recover'){if(!method(req,res,['POST']))return;const email=req.body?.email;if(typeof email!=='string')return fail(res,'Correo requerido');const {error}=await publicClient.auth.resetPasswordForEmail(email,{redirectTo:`https://${req.headers.host}/`});if(error)return fail(res,error.message);return ok(res,{message:'Si el correo existe, recibirás instrucciones de recuperación.'})}
 return fail(res,'Acción desconocida',404);
 }catch(e){safeError(res,e)}}
