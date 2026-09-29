/* =========================================================
   1. BARRE DU HAUT
   Quand l'en-tête (photo + nom) sort de l'écran, on ajoute la classe
   « is-scrolled » sur <body> : le CSS fait alors apparaître la photo,
   le nom et les icônes dans la barre du haut.
   ========================================================= */
const hero = document.querySelector('.hero');

if (hero) {
  const observer = new IntersectionObserver(([entry]) => {
    document.body.classList.toggle('is-scrolled', !entry.isIntersecting);
  }, { rootMargin: '-64px 0px 0px 0px' }); // 64px = hauteur de la barre du haut
  observer.observe(hero);
}

/* =========================================================
   2. NEIGE EN FOND (inspirée du menu de Skyrim)
   Des petits points blancs tombent lentement en se balançant.
   Si la personne a demandé à limiter les animations dans son système,
   la neige est dessinée une fois, sans bouger.
   ========================================================= */
const canvas = document.getElementById('snow');
const ctx = canvas.getContext('2d');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let width = 0;
let height = 0;
let flakes = [];

// Crée un flocon. « anywhere » : n'importe où à l'écran (au démarrage)
// ou juste au-dessus de l'écran (quand un flocon est tombé en bas).
function createFlake(anywhere) {
  return {
    x: Math.random() * width,
    y: anywhere ? Math.random() * height : -10,
    radius: 0.6 + Math.random() * 1.9,      // taille du flocon
    speed: 0.25 + Math.random() * 0.75,     // vitesse de chute
    sway: Math.random() * Math.PI * 2,      // position de départ du balancement
    opacity: 0.25 + Math.random() * 0.55,   // plus ou moins visible
  };
}

// Adapte le canvas à la taille de la fenêtre
function resize() {
  const widthChanged = window.innerWidth !== width;
  const dpr = window.devicePixelRatio || 1; // pour rester net sur les écrans Retina
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  // On ne recrée les flocons que si la largeur change : sur mobile, la hauteur
  // bouge à chaque défilement (barre d'adresse), et la neige ne doit pas sauter.
  if (widthChanged) {
    const count = Math.min(160, Math.round((width * height) / 9000)); // plus d'écran = plus de flocons
    flakes = Array.from({ length: count }, () => createFlake(true));
  }
  if (reduceMotion) draw();
}

// Dessine tous les flocons
function draw() {
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = '#fff';
  for (const flake of flakes) {
    ctx.globalAlpha = flake.opacity;
    ctx.beginPath();
    ctx.arc(flake.x, flake.y, flake.radius, 0, Math.PI * 2);
    ctx.fill();
  }
}

// Fait avancer chaque flocon. « step » vaut 1 à 60 images par seconde :
// la neige tombe à la même vitesse quel que soit l'écran.
function update(step) {
  for (const flake of flakes) {
    flake.sway += 0.01 * step;
    flake.y += flake.speed * step;
    flake.x += (Math.sin(flake.sway) * 0.3 + 0.1) * step; // balancement + léger vent vers la droite

    if (flake.y > height + 10) Object.assign(flake, createFlake(false)); // retour en haut
    if (flake.x > width + 10) flake.x = -10;                              // sortie à droite : revient à gauche
    else if (flake.x < -10) flake.x = width + 10;
  }
}

// Boucle d'animation : environ 60 fois par seconde
let lastTime = performance.now();
function loop(now) {
  const step = Math.min((now - lastTime) / (1000 / 60), 3); // limité à 3 pour éviter un saut au retour sur l'onglet
  lastTime = now;
  update(step);
  draw();
  requestAnimationFrame(loop);
}

resize();
window.addEventListener('resize', resize);
if (!reduceMotion) requestAnimationFrame(loop);
