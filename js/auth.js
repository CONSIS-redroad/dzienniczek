const Auth = {
  init(){
    if(CONFIG.googleClientId){
      const s=document.createElement("script"); s.src="https://accounts.google.com/gsi/client"; s.async=true; s.defer=true; s.onload=()=>this.initGSI(); document.head.appendChild(s);
    }
    this.render();
  },
  initGSI(){
    if(!window.google?.accounts?.id) return;
    google.accounts.id.initialize({client_id:CONFIG.googleClientId,callback:r=>this.onCredential(r),use_fedcm_for_prompt:false});
    google.accounts.id.renderButton(document.getElementById("gsi-button"),{type:"standard",shape:"pill",theme:"outline",text:"signin_with",locale:"pl"});
  },
  onCredential(response){
    try{
      const part=response.credential.split(".")[1];
      const json=decodeURIComponent(atob(part.replace(/-/g,"+").replace(/_/g,"/")).split("").map(c=>`%${(`00${c.charCodeAt(0).toString(16)}`).slice(-2)}`).join(""));
      const p=JSON.parse(json); if(!p.sub) throw new Error("Brak identyfikatora użytkownika");
      AppState.user={name:p.name||"Użytkownik",email:p.email||"",avatar:p.picture||null,sub:p.sub,guest:false};
      this.render(); App.onLogin();
    }catch(e){console.error("Błąd profilu Google",e);showToast("Nie udało się odczytać profilu Google.","error");}
  },
  demo(){AppState.user={name:"Użytkownik gość",email:"",avatar:null,sub:"guest_session",guest:true};this.render();App.onLogin();},
  logout(){AppState.user=null;AppState.days={};AppState.quotes={};this.render();App.onLogout();},
  render(){
    const u=AppState.user;
    document.getElementById("auth-login-view").style.display=u?"none":"flex";
    document.getElementById("auth-user-view").style.display=u?"flex":"none";
    document.getElementById("landing").style.display=u?"none":"flex";
    document.getElementById("main-app").style.display=u?"block":"none";
    if(u){
      document.getElementById("user-name").textContent=u.name;
      const img=document.getElementById("user-avatar"), ph=document.getElementById("user-avatar-placeholder");
      if(u.avatar){img.src=u.avatar;img.style.display="inline-block";ph.style.display="none";}else{img.style.display="none";ph.textContent=(u.name?.[0]||"U").toUpperCase();ph.style.display="flex";}
    }
  }
};
