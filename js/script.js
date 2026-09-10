/* Local-only interactions; existing editorial content is preserved. */
(() => {
'use strict';
const $=(s,p=document)=>p.querySelector(s), $$=(s,p=document)=>[...p.querySelectorAll(s)];
const body=document.body, backdrop=$('.menu-backdrop'), triggers=$$('.menu-trigger');
let dialog=null, returnFocus=null;
document.addEventListener('click',e=>{if(e.target.closest('a[href="#"]'))e.preventDefault();});
function closeMenu(){
 triggers.forEach(b=>{b.setAttribute('aria-expanded','false');b.parentElement.classList.remove('menu-active');document.getElementById(b.getAttribute('aria-controls')).hidden=true;});
 backdrop.hidden=true;body.classList.remove('menu-open');
}
triggers.forEach(b=>b.addEventListener('click',()=>{
 const open=b.getAttribute('aria-expanded')!=='true';closeMenu();closeLanguage();
 body.style.setProperty('--scrollbar-gap',Math.max(0,innerWidth-document.documentElement.clientWidth)+'px');
 if(open){b.parentElement.classList.add('menu-active');b.setAttribute('aria-expanded','true');document.getElementById(b.getAttribute('aria-controls')).hidden=false;backdrop.hidden=false;body.classList.add('menu-open');}
}));
$$('.depth-flat').forEach((el,i)=>{const h=document.createElement('h2');h.textContent=el.closest('li').querySelector('.menu-trigger').textContent;el.prepend(h);});
$$('.depth-left button').forEach(b=>b.addEventListener('click',()=>{
 const wrap=b.closest('.depth-wrap');
 $$('.depth-left li',wrap).forEach(e=>e.classList.remove('depth-active'));
 $$('.depth-left button',wrap).forEach(e=>e.setAttribute('aria-expanded','false'));
 $$('.depth-panel',wrap).forEach(e=>{e.hidden=true;e.classList.remove('depth-active');});
 b.parentElement.classList.add('depth-active');b.setAttribute('aria-expanded','true');
 const p=document.getElementById(b.getAttribute('aria-controls'));p.hidden=false;p.classList.add('depth-active');
}));
backdrop.addEventListener('click',closeMenu);
const language=$('.language-popover'),languageButton=$('.utility-global');
languageButton.setAttribute('aria-controls',language.id);languageButton.setAttribute('aria-expanded','false');
function closeLanguage(){language.hidden=true;languageButton.setAttribute('aria-expanded','false');}
languageButton.addEventListener('click',()=>{
 const open=language.hidden;closeLanguage();if(!open)return;
 const r=languageButton.getBoundingClientRect();
 language.style.top=(r.bottom+scrollY+14)+'px';language.style.left=Math.min(innerWidth-224,r.left+r.width/2-108)+'px';
 language.hidden=false;languageButton.setAttribute('aria-expanded','true');
});
document.addEventListener('click',e=>{
 if(!e.target.closest('.main-menu'))closeMenu();
 if(!e.target.closest('.utility-global,.language-popover'))closeLanguage();
});
function closeDialog(restore=true){
 if(!dialog)return;dialog.hidden=true;dialog.classList.remove('site-active');
 [...body.children].forEach(e=>e.inert=false);body.classList.remove('modal-open');
 returnFocus?.setAttribute('aria-expanded','false');if(restore)returnFocus?.focus({preventScroll:true});dialog=null;
}
function openDialog(target,trigger){
 if(dialog)closeDialog(false);closeMenu();closeLanguage();returnFocus=trigger;dialog=target;
 target.hidden=false;target.classList.add('site-active');body.classList.add('modal-open');
 trigger.setAttribute('aria-expanded','true');
 [...body.children].forEach(e=>{if(e!==target&&e.tagName!=='SCRIPT')e.inert=true;});
 $('input:not([type="radio"]),button,a',target)?.focus({preventScroll:true});
}
$$('.site-list > li').forEach((li,i)=>{
 const a=$('a',li),b=document.createElement('button');b.type='button';b.textContent=a.textContent;
 b.setAttribute('aria-controls','site-modal-'+(i+1));b.setAttribute('aria-haspopup','dialog');a.replaceWith(b);
 b.addEventListener('click',()=>openDialog($('.site-modal-'+(i+1)),b));
});
[['.utility-view','.display-dialog'],['.log-item.sch','.search-dialog'],['.all-menu','.all-menu-dialog']].forEach(([a,b])=>{
 $(a).setAttribute('aria-haspopup','dialog');$(a).addEventListener('click',()=>openDialog($(b),$(a)));
});
$$('.dialog-close,.modal-close-btn,.display-close').forEach(b=>b.addEventListener('click',()=>closeDialog()));
$('.display-dialog').addEventListener('click',e=>{if(e.target===$('.display-dialog'))closeDialog();});
document.addEventListener('keydown',e=>{
 if(e.key==='Escape'){closeDialog();closeMenu();closeLanguage();}
 if(e.key==='Tab'&&dialog){
 const n=$$('a,button,input,select,[tabindex="0"]',dialog).filter(e=>!e.disabled&&e.getClientRects().length);
 if(e.shiftKey&&document.activeElement===n[0]){e.preventDefault();n.at(-1).focus();}
 else if(!e.shiftKey&&document.activeElement===n.at(-1)){e.preventDefault();n[0].focus();}
 }
});
$$('.sec-2-grid .tab-head').forEach((tabs,g)=>{
 const buttons=$$(':scope > li > a',tabs);
 function select(index){
 buttons.forEach((b,i)=>{const active=i===index;b.parentElement.classList.toggle('active',active);b.setAttribute('aria-selected',String(active));b.tabIndex=active?0:-1;
 const p=$('.tab-body',b.parentElement);p.hidden=!active;p.inert=!active;});
 $('.button-box a',tabs.parentElement).setAttribute('aria-label',buttons[index].textContent.trim()+' 더보기');
 }
 tabs.setAttribute('role','tablist');
 buttons.forEach((b,i)=>{
 b.id='news-tab-'+g+'-'+i;b.setAttribute('role','tab');
 const p=$('.tab-body',b.parentElement);p.id='news-panel-'+g+'-'+i;p.setAttribute('role','tabpanel');p.setAttribute('aria-labelledby',b.id);b.setAttribute('aria-controls',p.id);
 b.addEventListener('click',e=>{e.preventDefault();select(i);});
 b.addEventListener('keydown',e=>{
 const next=e.key==='ArrowRight'?(i+1)%buttons.length:e.key==='ArrowLeft'?(i+buttons.length-1)%buttons.length:e.key==='Home'?0:e.key==='End'?buttons.length-1:null;
 if(next!==null){e.preventDefault();select(next);buttons[next].focus();}
 });});select(0);
});
const sliders=[];
function setup(n,options,automatic=false){
 const host=$('.sec-'+n+'-swiper');if(!host)return;
 const instance=new Swiper(host,{
 speed:400,watchOverflow:true,navigation:{prevEl:$('.sec-'+n+'-prev'),nextEl:$('.sec-'+n+'-next'),addIcons:false},
 pagination:{el:$('.sec-'+n+'-pagination'),clickable:true,type:[3,6].includes(n)?'fraction':'bullets'},
 a11y:{prevSlideMessage:'이전',nextSlideMessage:'다음',paginationBulletMessage:'{{index}}번 슬라이드'},...options});
 sliders.push(instance);
 if(automatic){
 const button=$('.sec-'+n+'-autoplay-control');let userPaused=false;
 const reflect=()=>{button.classList.toggle('is-stop',userPaused);button.setAttribute('aria-label',userPaused?'슬라이드 재생':'슬라이드 멈춤');button.setAttribute('aria-pressed',String(userPaused));$('.sr-only',button).textContent=userPaused?'재생':'정지';host.dataset.paused=String(userPaused);};
 button.addEventListener('click',()=>{userPaused=!userPaused;if(userPaused)instance.autoplay.stop();else instance.autoplay.start();reflect();});
 // Navigation, drag and transition completion cannot override the user's explicit pause.
 instance.on('autoplayStart',()=>{if(userPaused)instance.autoplay.stop();});
 instance.on('slideChangeTransitionEnd',()=>{if(userPaused)instance.autoplay.stop();});
 reflect();
 }
}
setup(1,{loop:true,speed:1800,autoplay:{delay:2500,disableOnInteraction:false,pauseOnMouseEnter:true}},true);
setup(3,{loop:true,speed:800,spaceBetween:16,autoplay:{delay:4000,disableOnInteraction:false}},true);
setup(4,{spaceBetween:16,breakpoints:{0:{slidesPerView:1},420:{slidesPerView:2,spaceBetween:14},1300:{slidesPerView:3,spaceBetween:16}}});
setup(5,{spaceBetween:16,breakpoints:{0:{slidesPerView:2},599:{slidesPerView:3},1024:{slidesPerView:5},1300:{slidesPerView:6}}});
setup(6,{spaceBetween:16,breakpoints:{0:{slidesPerView:1},540:{slidesPerView:2},768:{slidesPerView:3},1280:{slidesPerView:4}}});
setup(8,{spaceBetween:24,breakpoints:{0:{slidesPerView:1},480:{slidesPerView:2,spaceBetween:16},1024:{slidesPerView:3},1300:{slidesPerView:4}}});
const input=$('#search-input'),clear=$('.search-clear');
input.addEventListener('input',()=>clear.hidden=!input.value);
clear.addEventListener('click',()=>{input.value='';clear.hidden=true;input.focus();});
$('.search-form').addEventListener('submit',e=>e.preventDefault());
const systemDark=matchMedia('(prefers-color-scheme: dark)');
function display(){
 const scale=$('input[name="scale"]:checked').value,mode=$('input[name="mode"]:checked').value;
 document.documentElement.style.fontSize={small:'56.25%',medium:'62.5%',large:'68.75%',xlarge:'75%',xxlarge:'81.25%'}[scale];
 document.documentElement.dataset.display=mode==='default'?(systemDark.matches?'dark':'light'):mode;
 sliders.forEach(e=>e.update());
}
$$('.display-options input').forEach(e=>e.addEventListener('change',display));systemDark.addEventListener('change',display);
$('.display-reset').addEventListener('click',()=>{$('input[name="scale"][value="medium"]').checked=true;$('input[name="mode"][value="light"]').checked=true;display();});
$$('.mobile-group > button').forEach(b=>b.addEventListener('click',()=>{const open=b.getAttribute('aria-expanded')!=='true';b.setAttribute('aria-expanded',String(open));b.nextElementSibling.hidden=!open;}));
const mobileTabs=$$('.all-menu-tabs button'),mobileArea=$('.all-menu-sections');
function selectMobile(b){mobileTabs.forEach(e=>{e.classList.toggle('active',e===b);if(e===b)e.setAttribute('aria-current','true');else e.removeAttribute('aria-current');});}
mobileTabs.forEach(b=>b.addEventListener('click',()=>{
 const area=$('.all-menu-sections'),section=document.getElementById(b.dataset.menuSection);
 area.scrollTo({top:section.offsetTop-area.firstElementChild.offsetTop,behavior:'smooth'});
 selectMobile(b);
}));
mobileArea.addEventListener('scroll',()=>{
 const sections=$$('section',mobileArea),top=mobileArea.scrollTop;
 let active=sections[0];sections.forEach(e=>{if(e.offsetTop-sections[0].offsetTop<=top+40)active=e;});
 selectMobile(mobileTabs.find(b=>b.dataset.menuSection===active.id));
},{passive:true});
selectMobile(mobileTabs[0]);
$('.mobile-language').addEventListener('click',()=>{const links=$('.mobile-language-links');links.hidden=!links.hidden;$('.mobile-language').setAttribute('aria-expanded',String(!links.hidden));});
const topButton=$('.go-top');topButton.addEventListener('click',()=>scrollTo({top:0,behavior:'smooth'}));
addEventListener('scroll',()=>{topButton.hidden=scrollY<150;},{passive:true});
addEventListener('resize',()=>{closeLanguage();if(innerWidth<1024)closeMenu();});
})();

