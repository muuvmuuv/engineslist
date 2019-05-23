/*!
 * NPM Supervisor v0.2.0
 * https://github.com/muuvmuuv/npm-supervisor
 *
 * Copyright 2019 Marvin Heilemann
 * Released under the MIT license
 *
 * Date: 23.05.2019
 */
import e from"listr";import s from"path";import t from"chalk";import r from"execa";import o from"read-pkg";import n from"semver";var i=function(){return(i=Object.assign||function(e){for(var s,t=1,r=arguments.length;t<r;t++)for(var o in s=arguments[t])Object.prototype.hasOwnProperty.call(s,o)&&(e[o]=s[o]);return e}).apply(this,arguments)};function a(e,s){var t,r,o,n,i={label:0,sent:function(){if(1&o[0])throw o[1];return o[1]},trys:[],ops:[]};return n={next:a(0),throw:a(1),return:a(2)},"function"==typeof Symbol&&(n[Symbol.iterator]=function(){return this}),n;function a(n){return function(a){return function(n){if(t)throw new TypeError("Generator is already executing.");for(;i;)try{if(t=1,r&&(o=2&n[0]?r.return:n[0]?r.throw||((o=r.return)&&o.call(r),0):r.next)&&!(o=o.call(r,n[1])).done)return o;switch(r=0,o&&(n=[2&n[0],o.value]),n[0]){case 0:case 1:o=n;break;case 4:return i.label++,{value:n[1],done:!1};case 5:i.label++,r=n[1],n=[0];continue;case 7:n=i.ops.pop(),i.trys.pop();continue;default:if(!(o=(o=i.trys).length>0&&o[o.length-1])&&(6===n[0]||2===n[0])){i=0;continue}if(3===n[0]&&(!o||n[1]>o[0]&&n[1]<o[3])){i.label=n[1];break}if(6===n[0]&&i.label<o[1]){i.label=o[1],o=n;break}if(o&&i.label<o[2]){i.label=o[2],i.ops.push(n);break}o[2]&&i.ops.pop(),i.trys.pop();continue}n=s.call(e,i)}catch(e){n=[6,e],r=0}finally{t=o=0}if(5&n[0])throw n[1];return{value:n[0]?n[1]:void 0,done:!0}}([n,a])}}}var u=function(){function u(s){this.results={};var t={debug:!1,cwd:process.cwd(),ignoreLocal:!0,silent:!0};this.options=i({},t,s),this.tasks=new e({renderer:this.options.debug?"verbose":this.options.silent?"silent":"default",concurrent:!1,exitOnError:!1}),this.options.ignoreLocal&&this.ignoreLocal(),this.options.engines||this.findEngines(),this.buildTasks()}return u.prototype.run=function(){return e=this,s=void 0,r=function(){return a(this,function(e){switch(e.label){case 0:if(!this.tasks)throw new Error("No tasks found!");return[4,this.tasks.run()];case 1:return e.sent(),[2,this.results]}})},new((t=void 0)||(t=Promise))(function(o,n){function i(e){try{u(r.next(e))}catch(e){n(e)}}function a(e){try{u(r.throw(e))}catch(e){n(e)}}function u(e){e.done?o(e.value):new t(function(s){s(e.value)}).then(i,a)}u((r=r.apply(e,s||[])).next())});var e,s,t,r},u.prototype.ignoreLocal=function(){var e=process.env.PATH;if(e){var t=s.resolve(this.options.cwd,"node_modules",".bin"),r=new RegExp(":?"+t.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")+":?","i"),o=e.replace(r,"");process.env.PATH=o}},u.prototype.buildTasks=function(){var e=this,s=this.options.engines;if(!s)throw new Error("No engines found!");Object.keys(s).forEach(function(t){var r=s[t];e.addTask(t,r)})},u.prototype.addTask=function(s,r){var o=this;this.results[s]={success:!1,tasks:[]},this.tasks.add({title:"Checking engine: "+t.green(s)+" ("+t.dim(r)+")",task:function(){return new e([{title:"Check availability",task:function(e,t){return o.checkAvailability(e,t,s)}},{title:"Get command version",task:function(e,t){return o.getVersion(e,t,s)}},{title:"Validate range",task:function(e,t){return o.validateVersion(e,t,s,r)}},{title:"Check version against range",task:function(e,t){return o.checkVersion(e,t,s,r)}},{title:t.dim("Update results"),task:function(){return o.results[s].success=!0,Promise.resolve()}}],{exitOnError:!0})}})},u.prototype.findEngines=function(){var e=o.sync({cwd:this.options.cwd});if(!e)throw new Error("No package.json found!");this.options.engines=e.engines},u.prototype.checkAvailability=function(e,s,t){try{var o=r.sync("command",["-v",t],{preferLocal:!1}).stdout;return this.options.debug&&console.log("Command:",o),o.includes(t)?(this.results[t].tasks.push({task:s,success:!0,message:"Executable found!",data:o}),Promise.resolve("Executable found!")):(this.results[t].tasks.push({task:s,success:!1,message:"Executable not found!",data:o}),Promise.reject(new Error("Executable not found!")))}catch(e){return this.options.debug&&console.log(e.message),this.results[t].tasks.push({task:s,success:!1,message:"Error executing program!",data:e}),Promise.reject(new Error("Error executing program!"))}},u.prototype.getVersion=function(e,s,t){try{var o=r.sync(t,["--version"],{preferLocal:!1}).stdout,i=n.coerce(o);if(this.options.debug&&(console.log("Version:",o),console.log("Normalized:",i?i.version:null)),i){var a=n.valid(i.version);if(a)return e.version=a,this.results[t].tasks.push({task:s,success:!0,message:"Got a valid version",data:{version:o,normalized:i,validVersion:a}}),Promise.resolve()}return this.results[t].tasks.push({task:s,success:!1,message:"No valid version found! Please fill in an issue on GitHub.",data:{stdout:o,normalized:i}}),Promise.reject(new Error("No valid version found! Please fill in an issue on GitHub."))}catch(e){return this.options.debug&&console.log(e.message),this.results[t].tasks.push({task:s,success:!1,message:"Error fetching version!",data:e}),Promise.reject(new Error("Error fetching version!"))}},u.prototype.validateVersion=function(e,s,t,r){var o=n.validRange(r);return this.options.debug&&(console.log("Range:",r),console.log("Valid:",o)),o?(this.results[t].tasks.push({task:s,success:!0,message:"This version is valid!",data:{range:r}}),Promise.resolve("This version is valid!")):(this.results[t].tasks.push({task:s,success:!1,message:"This is not a valid version ("+r+")!",data:{range:r}}),Promise.reject(new Error("This is not a valid version ("+r+")!")))},u.prototype.checkVersion=function(e,s,t,r){var o=e.version,i=n.satisfies(o,r);return this.options.debug&&(console.log("Version:",o),console.log("Range:",r),console.log("Satisfies:",i)),i?(this.results[t].tasks.push({task:s,success:!0,message:"Yeah, your program version satisfies the required range!",data:{version:o,range:r,satisfies:i}}),Promise.resolve("Yeah, your program version satisfies the required range!")):(this.results[t].tasks.push({task:s,success:!1,message:"Ooh, the required range ("+r+") does not satisfies your program version ("+o+")!",data:{version:o,range:r,satisfies:i}}),Promise.reject(new Error("Ooh, the required range ("+r+") does not satisfies your program version ("+o+")!")))},u}();export{u as Supervisor};