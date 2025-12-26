import * as THREE from 'three';
import { CurlNoise } from './noise.js';
import { CONFIG } from './config.js';

// Vertex shader
const vertexShader = `
  attribute float size;
  attribute vec3 color;
  varying vec3 vColor;
  varying float vAlpha;
  uniform float pixelRatio;
  
  void main() {
    vColor = color;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = size * pixelRatio * (300.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
    
    // Fade based on distance
    vAlpha = smoothstep(5.0, 1.0, -mvPosition.z);
  }
`;

// Fragment shader
const fragmentShader = `
  varying vec3 vColor;
  varying float vAlpha;
  
  void main() {
    vec2 center = gl_PointCoord - vec2(0.5);
    float dist = length(center);
    
    // Soft circular gradient
    float alpha = 1.0 - smoothstep(0.0, 0.5, dist);
    alpha = pow(alpha, 1.5);
    
    // Glow effect
    float glow = exp(-dist * 4.0) * 0.5;
    alpha += glow;
    
    alpha *= vAlpha;
    
    gl_FragColor = vec4(vColor, alpha * 0.8);
  }
`;

export class ParticleSystem {
  constructor(renderer) {
    this.renderer = renderer;
    this.curlNoise = new CurlNoise();
    this.time = 0;
    
    this.initGeometry();
    this.initMaterial();
    this.mesh = new THREE.Points(this.geometry, this.material);
  }

  initGeometry() {
    const count = CONFIG.particleCount;
    
    this.geometry = new THREE.BufferGeometry();
    this.positions = new Float32Array(count * 3);
    this.velocities = new Float32Array(count * 3);
    this.originalPositions = new Float32Array(count * 3);
    this.colors = new Float32Array(count * 3);
    this.sizes = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      
      // Spherical distribution
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = Math.pow(Math.random(), 0.5) * 1.5;
      
      this.positions[i3] = r * Math.sin(phi) * Math.cos(theta);
      this.positions[i3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      this.positions[i3 + 2] = r * Math.cos(phi) * 0.5;
      
      this.originalPositions[i3] = this.positions[i3];
      this.originalPositions[i3 + 1] = this.positions[i3 + 1];
      this.originalPositions[i3 + 2] = this.positions[i3 + 2];
      
      this.velocities[i3] = 0;
      this.velocities[i3 + 1] = 0;
      this.velocities[i3 + 2] = 0;
      
      // Random color from palette
      const color = CONFIG.colorPalette[Math.floor(Math.random() * CONFIG.colorPalette.length)];
      this.colors[i3] = color.r;
      this.colors[i3 + 1] = color.g;
      this.colors[i3 + 2] = color.b;
      
      this.sizes[i] = CONFIG.particleSize * (0.5 + Math.random() * 0.5);
    }

    this.geometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));
    this.geometry.setAttribute('color', new THREE.BufferAttribute(this.colors, 3));
    this.geometry.setAttribute('size', new THREE.BufferAttribute(this.sizes, 1));
  }

  initMaterial() {
    this.material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        pixelRatio: { value: this.renderer.getPixelRatio() }
      },
      vertexShader,
      fragmentShader,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
  }

  update(handPosition, handVelocity) {
    this.time += 0.001;
    this.material.uniforms.time.value = this.time;

    const posAttr = this.geometry.attributes.position;
    const count = CONFIG.particleCount;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      
      let px = posAttr.array[i3];
      let py = posAttr.array[i3 + 1];
      let pz = posAttr.array[i3 + 2];
      
      // Curl noise flow
      const curl = this.curlNoise.get(
        px * CONFIG.noiseScale * 400,
        py * CONFIG.noiseScale * 400,
        pz * CONFIG.noiseScale * 400 + this.time * 50,
        this.time * 30
      );
      
      this.velocities[i3] += curl.x * CONFIG.flowSpeed * 0.001;
      this.velocities[i3 + 1] += curl.y * CONFIG.flowSpeed * 0.001;
      this.velocities[i3 + 2] += curl.z * CONFIG.flowSpeed * 0.0005;
      
      // Hand interaction
      if (handPosition) {
        const dx = px - handPosition.x;
        const dy = py - handPosition.y;
        const dz = pz;
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
        
        if (dist < CONFIG.handInfluenceRadius) {
          const force = (1 - dist / CONFIG.handInfluenceRadius);
          const forceMult = force * force * CONFIG.handForceStrength;
          
          if (dist > 0.01) {
            this.velocities[i3] += (dx / dist) * forceMult + handVelocity.x * forceMult * 0.3;
            this.velocities[i3 + 1] += (dy / dist) * forceMult + handVelocity.y * forceMult * 0.3;
            this.velocities[i3 + 2] += (Math.random() - 0.5) * forceMult * 0.5;
          }
        }
      }
      
      // Return to origin
      this.velocities[i3] += (this.originalPositions[i3] - px) * CONFIG.returnSpeed * 0.01;
      this.velocities[i3 + 1] += (this.originalPositions[i3 + 1] - py) * CONFIG.returnSpeed * 0.01;
      this.velocities[i3 + 2] += (this.originalPositions[i3 + 2] - pz) * CONFIG.returnSpeed * 0.01;
      
      // Damping
      this.velocities[i3] *= CONFIG.damping;
      this.velocities[i3 + 1] *= CONFIG.damping;
      this.velocities[i3 + 2] *= CONFIG.damping;
      
      // Update position
      posAttr.array[i3] += this.velocities[i3];
      posAttr.array[i3 + 1] += this.velocities[i3 + 1];
      posAttr.array[i3 + 2] += this.velocities[i3 + 2];
    }
    
    posAttr.needsUpdate = true;
  }

  updatePixelRatio(ratio) {
    this.material.uniforms.pixelRatio.value = ratio;
  }

  getMesh() {
    return this.mesh;
  }
}
