// Display crops of the supplied PNGs. The source files remain byte-for-byte original;
// SVG viewports and clipping only control their presentation in the page.
export const OPENING_ART = {
  normal: new URL('../assets/loading/normal-mike-original.png',import.meta.url).href,
  super: new URL('../assets/loading/super-mike-original.png',import.meta.url).href,
  prince: new URL('../assets/loading/prince-xiaboo-original.png',import.meta.url).href,
};

const figures={
  normal:{label:'Normal Mike',subtitle:'THE EVERYDAY HERO',view:'28 88 440 1076',path:'M118 181 L149 137 L192 119 L210 94 L232 112 L266 94 L293 112 L336 107 L366 129 L388 160 L400 209 L393 267 L391 289 L385 334 L365 371 L348 411 L353 429 L397 451 L415 498 L425 550 L416 584 L419 637 L431 686 L435 746 L450 791 L445 821 L423 850 L404 837 L395 819 L389 921 L383 986 L400 1045 L405 1091 L446 1108 L461 1128 L457 1150 L421 1158 L342 1156 L316 1143 L315 1105 L299 1037 L276 947 L249 858 L229 897 L215 969 L197 1012 L188 1092 L211 1118 L209 1148 L172 1161 L101 1160 L73 1145 L70 1121 L87 1074 L84 1021 L100 962 L108 902 L117 847 L108 816 L102 839 L80 850 L56 843 L41 826 L34 787 L39 739 L44 685 L51 631 L61 583 L58 551 L69 506 L85 477 L115 452 L157 432 L193 415 L189 387 L160 367 L134 341 L116 303 L108 256 Z'},
  super:{label:'Super Mike',subtitle:'SAME MIKE. BIGGER POWER.',view:'140 8 656 1361',path:'M457 96 L481 48 L511 36 L513 20 L537 31 L571 10 L587 29 L617 29 L643 61 L651 94 L646 147 L651 178 L638 207 L621 224 L613 274 L637 293 L671 310 L702 343 L724 389 L734 430 L728 463 L741 511 L745 551 L763 578 L771 628 L773 679 L780 738 L790 791 L785 821 L759 842 L729 848 L708 834 L690 810 L695 863 L688 909 L680 954 L686 1005 L683 1060 L675 1125 L674 1169 L667 1207 L681 1239 L710 1254 L751 1268 L780 1289 L784 1312 L769 1327 L725 1332 L671 1325 L616 1315 L567 1309 L534 1291 L534 1275 L548 1237 L550 1204 L535 1169 L515 1117 L514 1072 L524 1023 L537 965 L516 912 L500 863 L473 912 L449 947 L421 976 L404 1028 L384 1072 L365 1110 L365 1156 L353 1195 L338 1227 L324 1270 L319 1306 L307 1339 L288 1360 L243 1370 L187 1366 L151 1351 L140 1328 L155 1297 L181 1263 L199 1222 L211 1185 L211 1144 L197 1107 L197 1062 L205 1005 L222 968 L249 929 L277 901 L304 869 L334 838 L311 846 L279 838 L239 835 L220 817 L217 782 L216 741 L211 691 L207 635 L208 578 L219 542 L224 494 L230 455 L244 418 L266 392 L276 355 L298 320 L330 296 L364 280 L409 269 L447 247 L468 229 L460 209 L450 178 L452 149 Z'},
  prince:{label:'Prince Xiaboo',subtitle:'THE ROYAL CAT WORTH SAVING',view:'12 314 730 918',path:'M245 412 L255 353 L272 342 L302 349 L340 367 L379 389 L407 400 L403 380 L407 366 L427 358 L443 375 L456 386 L473 356 L472 334 L481 320 L497 316 L509 329 L510 345 L513 356 L532 386 L546 370 L563 368 L575 382 L572 402 L558 416 L557 434 L585 407 L628 379 L670 363 L691 367 L699 384 L700 417 L693 474 L675 525 L666 568 L664 611 L657 647 L636 686 L662 712 L674 747 L663 781 L669 818 L693 861 L710 904 L724 957 L733 1012 L740 1058 L735 1102 L718 1145 L695 1180 L659 1208 L620 1225 L562 1227 L515 1222 L470 1229 L420 1224 L368 1228 L313 1224 L251 1224 L188 1217 L132 1204 L94 1182 L66 1154 L36 1121 L23 1082 L15 1048 L18 1002 L30 953 L51 905 L77 861 L112 825 L153 795 L195 771 L201 741 L225 707 L231 676 L222 639 L218 597 L223 553 L233 513 L239 467 Z'},
};

function figure(kind){const f=figures[kind];return `<figure class="opening-figure opening-${kind}"><svg viewBox="${f.view}" role="img" aria-label="${f.label} — original supplied illustration" focusable="false"><defs><clipPath id="opening-crop-${kind}"><path d="${f.path}"/></clipPath></defs><image href="${OPENING_ART[kind]}" width="1122" height="1402" clip-path="url(#opening-crop-${kind})"/></svg><figcaption><strong>${f.label}</strong><small>${f.subtitle}</small></figcaption></figure>`}

function letters(word){return [...word].map((letter,i)=>`<span class="logo-letter color-${i%4}" aria-hidden="true">${letter}</span>`).join('')}
export function openingMarkup(){return `<section class="opening-screen" aria-label="Loading the Kingdom of Xiaboo">
  <div class="opening-rays" aria-hidden="true"></div><div class="opening-spark spark-one" aria-hidden="true">✦</div><div class="opening-spark spark-two" aria-hidden="true">✦</div><div class="opening-spark spark-three" aria-hidden="true">✧</div>
  <header class="opening-heading"><p>A LITTLE HERO. A ROYAL ADVENTURE.</p><h1 class="arcade-logo" aria-label="Super Mike-oh"><span class="logo-super">${letters('SUPER')}</span><span class="logo-mike">${letters('MIKE-OH!')}</span></h1></header>
  <div class="opening-cast">${figure('normal')}${figure('super')}${figure('prince')}</div>
  <div class="opening-footer"><div class="opening-progress-copy"><span id="loading-message" role="status" aria-live="polite">Loading the Kingdom…</span><span id="loading-percent">0%</span></div><div id="opening-progress" class="opening-progress" role="progressbar" aria-label="Game loading progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><span id="loading-fill"></span></div><button class="opening-enter" id="opening-enter" data-action="enter" disabled>PREPARING THE KINGDOM…</button><p class="opening-tagline">START SMALL. POWER UP. SAVE THE PRINCE.</p></div>
</section>`}

export async function loadOpeningArt(){
  await Promise.all(Object.values(OPENING_ART).map(src=>new Promise((resolve,reject)=>{
    const image=new Image();image.decoding='async';image.onload=()=>Promise.resolve(image.decode?.()).then(resolve,reject);image.onerror=()=>reject(new Error('Opening illustration could not load.'));image.src=src;
  })));
}

export async function initializeOpening(tasks,onProgress){
  let complete=0;const failures=[];
  await Promise.all(tasks.map(async task=>{
    try{await task.run()}catch{failures.push(task.name)}
    complete++;onProgress(Math.round(complete/tasks.length*100),task.message);
  }));return failures;
}
