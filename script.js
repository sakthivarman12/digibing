import * as THREE from 'three';

/* ---------- Scroll Reveal ---------- */
const reveals = document.querySelectorAll('.reveal');
const io = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in-view');
      io.unobserve(entry.target);
    }
  });
}, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });
reveals.forEach((el) => io.observe(el));

/* ---------- Nav scroll state ---------- */
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 20);
}, { passive: true });

/* ---------- Mobile menu ---------- */
const menuToggle = document.getElementById('menuToggle');
const mobileMenu = document.getElementById('mobileMenu');
menuToggle.addEventListener('click', () => {
  const open = mobileMenu.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', open);
});
mobileMenu.querySelectorAll('a').forEach((a) =>
  a.addEventListener('click', () => {
    mobileMenu.classList.remove('open');
    menuToggle.setAttribute('aria-expanded', false);
  })
);

/* ---------- Footer year ---------- */
document.getElementById('year').textContent = new Date().getFullYear();

/* ---------- Contact form (static demo) ---------- */
const form = document.getElementById('contactForm');
const note = document.getElementById('formNote');
form.addEventListener('submit', (e) => {
  e.preventDefault();
  note.textContent = 'Thanks — we\'ll reach out on WhatsApp shortly.';
  form.reset();
});

/* ---------- Three.js: wireframe particle field ---------- */
const canvas = document.getElementById('bg-canvas');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.z = 9;

// Icosahedron wireframe cluster
const group = new THREE.Group();
scene.add(group);

const geo = new THREE.IcosahedronGeometry(3.2, 1);
const wireMat = new THREE.MeshBasicMaterial({ color: 0xf5f5f3, wireframe: true, transparent: true, opacity: 0.16 });
const mesh = new THREE.Mesh(geo, wireMat);
group.add(mesh);

const geo2 = new THREE.IcosahedronGeometry(4.6, 0);
const wireMat2 = new THREE.MeshBasicMaterial({ color: 0xf5f5f3, wireframe: true, transparent: true, opacity: 0.06 });
const mesh2 = new THREE.Mesh(geo2, wireMat2);
group.add(mesh2);

// Particle field
const particleCount = 700;
const positions = new Float32Array(particleCount * 3);
for (let i = 0; i < particleCount; i++) {
  const r = 8 + Math.random() * 10;
  const theta = Math.random() * Math.PI * 2;
  const phi = Math.acos((Math.random() * 2) - 1);
  positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
  positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
  positions[i * 3 + 2] = r * Math.cos(phi);
}
const particleGeo = new THREE.BufferGeometry();
particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
const particleMat = new THREE.PointsMaterial({ color: 0xf5f5f3, size: 0.035, transparent: true, opacity: 0.5 });
const particles = new THREE.Points(particleGeo, particleMat);
scene.add(particles);

let mouseX = 0, mouseY = 0;
window.addEventListener('mousemove', (e) => {
  mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
  mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
}, { passive: true });

let scrollFrac = 0;
window.addEventListener('scroll', () => {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  scrollFrac = max > 0 ? window.scrollY / max : 0;
}, { passive: true });

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const t = clock.getElapsedTime();

  group.rotation.y = t * 0.05 + scrollFrac * Math.PI * 0.6;
  group.rotation.x = t * 0.03 + scrollFrac * Math.PI * 0.2;
  particles.rotation.y = -t * 0.02 + scrollFrac * Math.PI * 0.3;

  camera.position.x += (mouseX * 0.6 - camera.position.x) * 0.02;
  camera.position.y += (-mouseY * 0.4 - camera.position.y) * 0.02;
  camera.lookAt(0, 0, 0);

  renderer.render(scene, camera);
}

if (!reduceMotion) {
  animate();
} else {
  renderer.render(scene, camera);
}
