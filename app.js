function microLab(){const d=window.MICRO_DATA;return {
active:'microscope',menuOpen:false,navItems:[{id:'microscope',label:'Microscope'},{id:'morphology',label:'Morphology'},{id:'culture',label:'Culture media'},{id:'identify',label:'Identify'},{id:'control',label:'Microbial control'},{id:'quiz',label:'Quiz'}],
completed:[],score:0,badges:[],toast:'',showLabels:false,magnification:40,focus:80,illumination:82,contrast:100,stageX:0,stageY:0,slideIndex:0,currentCells:[],morphFilter:'All forms',morphFilters:['All forms','Bacteria','Eukaryotic microbes'],morphAnswer:'',morphFeedback:false,
slides:d.slides,morphologies:d.morphologies,media:d.media,cases:d.cases,controlMethods:d.controlMethods,quizLevels:d.quizLevels,
selectedMedia:2,mediaAnswer:'',mediaFeedback:'',caseIndex:0,caseStep:0,caseChosen:'',caseMessage:'',controlSelected:0,controlAnswer:'',controlFeedback:'',quizLevel:0,quizQuestion:0,quizChoice:'',quizFeedback:'',quizHint:false,quizMode:'untimed',difficulty:'Foundation',quizAnswered:[],levelScores:{},
get totalMag(){return this.magnification*10},get focusClass(){return this.focus>=76?'sharp':this.focus>=42?'soft':'blur'},get moduleLabel(){return ({microscope:'Virtual microscope',morphology:'Morphology explorer',culture:'Culture media lab',identify:'Identification lab',control:'Microbial control',quiz:'Challenge mode'})[this.active]},
get filteredMorphologies(){if(this.morphFilter==='All forms')return this.morphologies;return this.morphologies.filter(m=>m.group===this.morphFilter)},
init(){this.drawSpecimen();this.completed=JSON.parse(localStorage.getItem('vml-completed')||'[]');this.score=Number(localStorage.getItem('vml-score')||0);this.badges=JSON.parse(localStorage.getItem('vml-badges')||'[]');this.quizAnswered=JSON.parse(sessionStorage.getItem('vml-answered')||'[]');this.levelScores=JSON.parse(sessionStorage.getItem('vml-levels')||'{}');document.body.dataset.appReady='true';document.querySelectorAll('section.module-section').forEach((el,i)=>{el.dataset.activeModule=i===0?'true':'false'});this.$watch('active',v=>{const ids=['microscope','morphology','culture','identify','control','quiz'];document.querySelectorAll('section.module-section').forEach((el,i)=>{el.dataset.activeModule=ids[i]===v?'true':'false'});});},
drawSpecimen(){
const s=this.slides[this.slideIndex];
const arr=[];
const layer=document.getElementById('specimen-cells');
if(!layer)return;
while(layer.firstChild)layer.removeChild(layer.firstChild);
if(s.photo){
 const NS='http://www.w3.org/2000/svg';
 const photo=document.createElementNS(NS,'image');
 const imagePath=new URL(s.photo,document.baseURI).href;
 photo.setAttribute('href',imagePath);
 photo.setAttributeNS('http://www.w3.org/1999/xlink','xlink:href',imagePath);
 const zoom={4:1,10:1.25,40:1.8,100:2.4}[this.magnification]||1;
 const size=564*zoom;
 photo.setAttribute('x',String(300-size/2)); photo.setAttribute('y',String(300-size/2));
 photo.setAttribute('width',String(size)); photo.setAttribute('height',String(size));
 photo.setAttribute('preserveAspectRatio','xMidYMid slice');
 photo.setAttribute('clip-path','url(#micrographClip)');
 photo.setAttribute('class','real-micrograph');
 photo.addEventListener('error',()=>{photo.remove();s.photo='';this.drawSpecimen();});
 layer.appendChild(photo);
 return;
}
for(let i=0;i<s.count;i++){
 let kind=s.kind;
 if(s.kind==='coccus'&&i%7===0)kind='cluster';
 if(s.kind==='coccus'&&i%8===0)kind='chain';
 const a=i*2.39996,r=18+Math.sqrt(i/s.count)*178,x=Math.max(70,Math.min(530,300+Math.cos(a)*r)),y=Math.max(70,Math.min(530,300+Math.sin(a)*r));
 arr.push({id:i,x,y,rot:(i*47)%180,scale:1.05+((i*13)%9)/18,kind});
}
this.currentCells=arr;
const NS='http://www.w3.org/2000/svg';
const node=(tag,attrs={})=>{const el=document.createElementNS(NS,tag);Object.entries(attrs).forEach(([k,v])=>el.setAttribute(k,String(v)));return el};
arr.forEach(cell=>{
 const g=node('g',{transform:'translate('+cell.x+' '+cell.y+') rotate('+cell.rot+') scale('+cell.scale+')'});
 const add=(tag,attrs)=>g.appendChild(node(tag,attrs));
 if(['coccus','cluster','chain'].includes(cell.kind)){
   const count=cell.kind==='chain'?4:cell.kind==='cluster'?5:1;
   for(let j=0;j<count;j++){
     const offsets=cell.kind==='chain'?[[-24,0],[-8,0],[8,0],[24,0]]:cell.kind==='cluster'?[[-8,-4],[5,-9],[13,2],[2,10],[-12,9]]:[[0,0]];
     const [cx,cy]=offsets[j];
     add('circle',{cx,cy,r:cell.kind==='coccus'?12:cell.kind==='chain'?8.5:10,fill:cell.kind==='chain'?'#528aa6':j%2?'#588aa4':'#477d9c',stroke:'#285a75','stroke-width':1.3});
   }
   if(cell.kind==='coccus')add('circle',{cx:-2.5,cy:-3,r:3.3,fill:'#e5f0ed',opacity:.65});
 } else if(['rod','coccobacillus'].includes(cell.kind)){
   add('rect',{x:cell.kind==='rod'?-25:-19,y:cell.kind==='rod'?-9:-10.5,width:cell.kind==='rod'?50:38,height:cell.kind==='rod'?18:21,rx:cell.kind==='rod'?9:10.5,fill:cell.kind==='rod'?'#b95d79':'#bb7d8f',stroke:'#874967','stroke-width':1.5});
   add('path',{d:'M-14 -3 Q0 -8 14 -2',fill:'none',stroke:'#f4c6c4','stroke-width':2});
 } else if(cell.kind==='vibrio'){
   add('path',{d:'M-23 7 Q-3 -19 18 -4 Q24 1 20 10 Q12 21 1 12',fill:'none',stroke:'#285e83','stroke-width':12,'stroke-linecap':'round'});
   add('path',{d:'M-22 6 Q-3 -16 17 -4',fill:'none',stroke:'#91bacb','stroke-width':3.5,'stroke-linecap':'round'});
 } else if(['spirillum','spirochete'].includes(cell.kind)){
   add('path',{d:cell.kind==='spirillum'?'M-31 0 C-25 -23 -13 -23 -6 0 S13 23 20 0 S31 -20 34 -6':'M-43 0 C-36 -10 -29 -10 -22 0 S-8 10 -1 0 S13 -10 20 0 S34 10 42 0',fill:'none',stroke:cell.kind==='spirillum'?'#267b78':'#276a75','stroke-width':cell.kind==='spirillum'?7:3.8,'stroke-linecap':'round'});
 } else if(cell.kind==='yeast'||cell.kind==='blood'){
   add('ellipse',{cx:0,cy:0,rx:cell.kind==='yeast'?18:19,ry:cell.kind==='yeast'?22:19,fill:cell.kind==='yeast'?'#b77b9d':'#c96870',stroke:'#824e7b','stroke-width':1.5});
   add('circle',{cx:0,cy:0,r:cell.kind==='yeast'?6:7,fill:cell.kind==='yeast'?'#f3d4e2':'#f4d8d2'});
   if(cell.kind==='yeast')add('circle',{cx:19,cy:-17,r:8,fill:'#c998b4',stroke:'#824e7b','stroke-width':1.3});
 } else if(cell.kind==='hypha'){
   add('path',{d:'M0 26 C-17 8 14 -2 0 -26',stroke:'#9c7355','stroke-width':8,'stroke-linecap':'round',fill:'none'});
   add('path',{d:'M0 5 L-12 -2 M1 -10 L13 -17',stroke:'#d9ae83','stroke-width':3,fill:'none'});
 }
 layer.appendChild(g);
});
},resetMicroscope(){this.magnification=40;this.focus=80;this.illumination=82;this.contrast=100;this.stageX=0;this.stageY=0;this.slideIndex=0;this.showLabels=false;this.drawSpecimen()},
completeModule(id){if(!this.completed.includes(id)){this.completed.push(id);this.persist();this.unlockBadge(id);this.showToast('Module completed — progress saved on this device.')}else this.showToast('This module is already marked complete.')},
unlockBadge(id){const labels={microscope:'Optics explorer',morphology:'Shape spotter',culture:'Culture selector',identify:'Evidence analyst',control:'Control concepts',quiz:'Knowledge challenger'};if(!this.badges.includes(labels[id])){this.badges.push(labels[id]);this.persist()}},
awardPoint(id){const key='award-'+id;if(sessionStorage.getItem(key))return;sessionStorage.setItem(key,'1');this.score+=10;this.persist();this.showToast('+10 points earned')},
persist(){localStorage.setItem('vml-completed',JSON.stringify(this.completed));localStorage.setItem('vml-score',this.score);localStorage.setItem('vml-badges',JSON.stringify(this.badges));sessionStorage.setItem('vml-answered',JSON.stringify(this.quizAnswered));sessionStorage.setItem('vml-levels',JSON.stringify(this.levelScores))},
showToast(t){this.toast=t;setTimeout(()=>{this.toast=''},2400)},
checkMediaAnswer(){if(!this.mediaAnswer){this.mediaFeedback='Select a medium first.';return}if(this.mediaAnswer==='MacConkey agar'){this.mediaFeedback='Correct. MacConkey agar is selective for many Gram-negative bacteria and differentiates lactose fermentation through colony colour changes.';this.awardPoint('media')}else this.mediaFeedback='Not the best fit. Look for a medium that is both selective for many Gram-negative enteric bacteria and differential for lactose fermentation.'},
submitCase(){if(!this.caseChosen){this.caseMessage='Choose an option before submitting.';return}if(this.caseChosen===this.cases[this.caseIndex].answer){this.caseMessage='Correct. Your choice is the best-supported option in this simplified teaching case. In real microbiology, identification uses validated methods and full context.';this.awardPoint('case-'+this.caseIndex);this.unlockBadge('identify')}else this.caseMessage='This choice is not the best match for the combined clues shown. Revisit the morphology, staining, culture, and physiology evidence, then compare all the evidence together.'},
checkControlAnswer(){if(!this.controlAnswer){this.controlFeedback='Select a method first.';return}if(this.controlAnswer==='Membrane filtration'){this.controlFeedback='Correct. Membrane filtration is commonly considered for compatible heat-sensitive liquids because it removes organisms rather than exposing the liquid to high heat. The filter and process still need appropriate validation.';this.awardPoint('control')}else this.controlFeedback='Review the material constraint: the goal is to avoid heat damage while removing microorganisms from a compatible liquid.'},
submitQuiz(){if(!this.quizChoice){this.quizFeedback='Choose an answer first.';return}const q=this.quizLevels[this.quizLevel].questions[this.quizQuestion],key=this.quizLevel+'-'+this.quizQuestion;if(!this.quizAnswered.includes(key)){this.quizAnswered.push(key);if(this.quizChoice===q.answer){const points=this.difficulty==='Foundation'?10:this.difficulty==='Intermediate'?15:20;this.score+=points;this.levelScores[this.quizLevel]=(this.levelScores[this.quizLevel]||0)+points;this.persist();this.quizFeedback='Correct. '+q.hint+' You earned '+points+' points.';this.unlockBadge('quiz')}else this.quizFeedback='The correct answer is '+q.answer+'. '+q.hint+' Use the clue to review the underlying concept.'}else this.quizFeedback=this.quizChoice===q.answer?'Correct — you already answered this question.':'The correct answer is '+q.answer+'. '+q.hint},
nextQuiz(){if(this.quizQuestion<this.quizLevels[this.quizLevel].questions.length-1){this.quizQuestion++;this.quizChoice='';this.quizFeedback='';this.quizHint=false;return}if(this.quizLevel<this.quizLevels.length-1){this.levelScores[this.quizLevel]=this.levelScores[this.quizLevel]||0;this.quizLevel++;this.quizQuestion=0;this.quizChoice='';this.quizFeedback='';this.quizHint=false;this.persist();return}this.completeModule('quiz');this.showToast('Challenge set completed! Review your competency report.')},
resetProgress(){if(!confirm('Reset all progress, points, and badges stored on this device?'))return;this.completed=[];this.score=0;this.badges=[];this.quizAnswered=[];this.levelScores={};['vml-completed','vml-score','vml-badges'].forEach(k=>localStorage.removeItem(k));['vml-answered','vml-levels'].forEach(k=>sessionStorage.removeItem(k));this.showToast('Learning progress reset.')}
}}