
var isReady=false;var onReadyCallbacks=[];
var isServiceReady=false;var onServiceReadyCallbacks=[];
var __uniConfig = {"pages":["pages/book/index","pages/comic/index","pages/music/index","pages/music/mix","pages/music/album","pages/music/singer","pages/music/rank","pages/music/more","pages/music/detail","pages/music/player","pages/music/playlist","pages/music/search","pages/user/index","modules/comment","modules/edit","modules/catalog","modules/security"],"window":{"disableScroll":true,"navigationStyle":"custom","backgroundColor":"transparent","titleNView":false,"background":"transparent","animationType":"fade-in"},"tabBar":{"color":"#666666","selectedColor":"#2ca2f9","borderStyle":"black","backgroundColor":"#131313","list":[{"pagePath":"pages/book/index","iconPath":"static/tabbar/book_default.png","selectedIconPath":"static/tabbar/book_default-actived.png","text":"小说"},{"pagePath":"pages/comic/index","iconPath":"static/tabbar/comic_default.png","selectedIconPath":"static/tabbar/comic_default-actived.png","text":"漫画"},{"pagePath":"pages/music/index","iconPath":"static/tabbar/music_default.png","selectedIconPath":"static/tabbar/music_default-actived.png","text":"音乐"},{"pagePath":"pages/user/index","iconPath":"static/tabbar/user_default.png","selectedIconPath":"static/tabbar/user_default-actived.png","text":"我的"}]},"networkTimeout":{"request":50000,"downloadFile":50000,"connectSocket":60000,"uploadFile":60000},"nvueCompiler":"uni-app","nvueStyleCompiler":"uni-app","renderer":"auto","splashscreen":{"alwaysShowBeforeRender":true,"autoclose":false},"appname":"好用聚合","compilerVersion":"3.1.13","entryPagePath":"pages/book/index"};
var __uniRoutes = [{"path":"/pages/book/index","meta":{"isQuit":true,"isNVue":true,"isTabBar":true},"window":{}},{"path":"/pages/comic/index","meta":{"isQuit":true,"isNVue":true,"isTabBar":true},"window":{}},{"path":"/pages/music/index","meta":{"isQuit":true,"isNVue":true,"isTabBar":true},"window":{}},{"path":"/pages/music/mix","meta":{"isNVue":true},"window":{}},{"path":"/pages/music/album","meta":{"isNVue":true},"window":{}},{"path":"/pages/music/singer","meta":{"isNVue":true},"window":{}},{"path":"/pages/music/rank","meta":{"isNVue":true},"window":{}},{"path":"/pages/music/more","meta":{"isNVue":true},"window":{}},{"path":"/pages/music/detail","meta":{"isNVue":true},"window":{}},{"path":"/pages/music/player","meta":{"isNVue":true},"window":{"backgroundColor":"rgba(0,0,0,0)","bounce":"none","animationType":"fade-in","background":"transparent","popGesture":"none"}},{"path":"/pages/music/playlist","meta":{"isNVue":true},"window":{"backgroundColor":"rgba(0,0,0,0)","bounce":"none","animationType":"fade-in","background":"transparent","popGesture":"none"}},{"path":"/pages/music/search","meta":{"isNVue":true},"window":{}},{"path":"/pages/user/index","meta":{"isQuit":true,"isNVue":true,"isTabBar":true},"window":{}},{"path":"/modules/comment","meta":{"isNVue":true},"window":{"backgroundColor":"rgba(0,0,0,0)","navigationStyle":"custom","bounce":"none","animationType":"fade-in","background":"transparent","popGesture":"none"}},{"path":"/modules/edit","meta":{"isNVue":true},"window":{"backgroundColor":"rgba(0,0,0,0)","navigationStyle":"custom","bounce":"none","animationType":"fade-in","background":"transparent","popGesture":"none"}},{"path":"/modules/catalog","meta":{"isNVue":true},"window":{"backgroundColor":"rgba(0,0,0,0)","navigationStyle":"custom","bounce":"none","animationType":"fade-in","background":"transparent","popGesture":"none"}},{"path":"/modules/security","meta":{"isNVue":true},"window":{"backgroundColor":"rgba(0,0,0,0)","navigationStyle":"custom","bounce":"none","animationType":"fade-in","background":"transparent","popGesture":"none"}}];
__uniConfig.onReady=function(callback){if(__uniConfig.ready){callback()}else{onReadyCallbacks.push(callback)}};Object.defineProperty(__uniConfig,"ready",{get:function(){return isReady},set:function(val){isReady=val;if(!isReady){return}const callbacks=onReadyCallbacks.slice(0);onReadyCallbacks.length=0;callbacks.forEach(function(callback){callback()})}});
__uniConfig.onServiceReady=function(callback){if(__uniConfig.serviceReady){callback()}else{onServiceReadyCallbacks.push(callback)}};Object.defineProperty(__uniConfig,"serviceReady",{get:function(){return isServiceReady},set:function(val){isServiceReady=val;if(!isServiceReady){return}const callbacks=onServiceReadyCallbacks.slice(0);onServiceReadyCallbacks.length=0;callbacks.forEach(function(callback){callback()})}});
service.register("uni-app-config",{create(a,b,c){if(!__uniConfig.viewport){var d=b.weex.config.env.scale,e=b.weex.config.env.deviceWidth,f=Math.ceil(e/d);Object.assign(__uniConfig,{viewport:f,defaultFontSize:Math.round(f/20)})}return{instance:{__uniConfig:__uniConfig,__uniRoutes:__uniRoutes,global:void 0,window:void 0,document:void 0,frames:void 0,self:void 0,location:void 0,navigator:void 0,localStorage:void 0,history:void 0,Caches:void 0,screen:void 0,alert:void 0,confirm:void 0,prompt:void 0,fetch:void 0,XMLHttpRequest:void 0,WebSocket:void 0,webkit:void 0,print:void 0}}}});
