javascript:(function(){
const link=prompt("Cole o link da mensagem do Chat:");
if(!link||!/^https?:\/\/.+/.test(link))return alert("Link inválido.");
const opcoes=[15,30,60,120,1440,2880,4320];
const opcoesTexto=["1 - +15 min","2 - +30 min","3 - +1h","4 - +2h","5 - +24h","6 - +48h","7 - +72h"];
const escolha=prompt("Escolha o tempo para o lembrete( ex: 1 para 15 min ):\n"+opcoesTexto.join("\n"));
const idx=parseInt(escolha);
if(isNaN(idx)||idx<1||idx>opcoes.length)return alert("Escolha inválida.");
const titulo="VERIFICAR THREAD: "+link;
const a=new Date(),ini=new Date(a.getTime()+opcoes[idx-1]*60000),fim=new Date(ini.getTime()+30*60000);
const pad=n=>n.toString().padStart(2,"0");
const fmt=d=>d.getUTCFullYear()+pad(d.getUTCMonth()+1)+pad(d.getUTCDate())+"T"+pad(d.getUTCHours())+pad(d.getUTCMinutes())+"00Z";
const s=fmt(ini),e=fmt(fim);
const url=`https://calendar.google.com/calendar/r/eventedit?text=${encodeURIComponent(titulo)}&dates=${s}/${e}`;
window.open(url,"_blank");
})();
