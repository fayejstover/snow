import * as THREE from 'three';
import { CONFIG, applyPreset } from './config.js';
import { ParticleSystem } from './particles.js';
import { HandTracker } from './hand-tracking.js';

class SnowGalaxy {
  constructor() {
    this.time = 0;
    
    this.initRenderer();
    this.initScene();
    this.initCamera();
    this.initParticles();
    this.initHandTracking();
    this.initEventListeners();
    
    this.animate();
  }

  initRenderer() {
    const canvas = document.getElementById('main-canvas');
    this.renderer = new THREE.WebGLRenderer({ 
      canvas, 
      antialias: true, 
      alpha: true 
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }

  initScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x000000);
  }

  initCamera() {
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );
    this.camera.position.z = CONFIG.cameraZ;
  }

  initParticles() {
    this.particles = new ParticleSystem(this.renderer);
    this.scene.add(this.particles.getMesh());
  }

  initHandTracking() {
    const video = document.getElementById('video');
    const loading = document.getElementById('loading');
    
    this.handTracker = new HandTracker(video, () => {
      loading.style.display = 'none';
    });
  }

  initEventListeners() {
    window.addEventListener('resize', () => this.onResize());
    
    window.addEventListener('keydown', (e) => {
      switch(e.key) {
        case '1': this.setPreset('snow'); break;
        case '2': this.setPreset('fire'); break;
        case '3': this.setPreset('aurora'); break;
        case '4': this.setPreset('nebula'); break;
        case '5': this.setPreset('gold'); break;
      }
    });
  }

  setPreset(name) {
    applyPreset(name);
    console.log(`Preset changed to: ${name}`);
  }

  onResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.particles.updatePixelRatio(this.renderer.getPixelRatio());
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    
    this.time += 0.001;
    
    this.particles.update(
      this.handTracker.getPosition(),
      this.handTracker.getVelocity()
    );
    
    this.camera.position.x = Math.sin(this.time * CONFIG.cameraSwaySpeed) * CONFIG.cameraSwayAmount;
    this.camera.position.y = Math.cos(this.time * CONFIG.cameraSwaySpeed * 0.6) * CONFIG.cameraSwayAmount * 0.5;
    this.camera.lookAt(0, 0, 0);
    
    this.renderer.render(this.scene, this.camera);
  }
}

new SnowGalaxy();
