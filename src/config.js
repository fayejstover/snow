import * as THREE from 'three';

export const CONFIG = {
  // Particle settings
  particleCount: 35000,
  particleSize: 3.5,
  
  // Flow field
  flowSpeed: 0.3,
  noiseScale: 0.002,
  
  // Hand interaction
  handInfluenceRadius: 0.25,
  handForceStrength: 0.08,
  
  // Physics
  returnSpeed: 0.02,
  damping: 0.96,
  
  // Visual
  colorPalette: [
    new THREE.Color(0xffffff),  // Pure white
    new THREE.Color(0xe8f4ff),  // Ice blue
    new THREE.Color(0xd0e8ff),  // Light blue
    new THREE.Color(0xc0d8ff),  // Soft blue
  ],
  
  // Camera
  cameraZ: 2,
  cameraSwayAmount: 0.1,
  cameraSwaySpeed: 0.5,
};

// Preset configurations
export const PRESETS = {
  snow: {
    particleCount: 35000,
    flowSpeed: 0.3,
    handForceStrength: 0.08,
    colorPalette: [
      new THREE.Color(0xffffff),
      new THREE.Color(0xe8f4ff),
      new THREE.Color(0xd0e8ff),
    ]
  },
  
  fire: {
    particleCount: 25000,
    flowSpeed: 0.5,
    handForceStrength: 0.12,
    colorPalette: [
      new THREE.Color(0xff6b35),
      new THREE.Color(0xf7c59f),
      new THREE.Color(0xffaa00),
      new THREE.Color(0xff4400),
    ]
  },
  
  aurora: {
    particleCount: 30000,
    flowSpeed: 0.2,
    handForceStrength: 0.06,
    colorPalette: [
      new THREE.Color(0x00ff87),
      new THREE.Color(0x60efff),
      new THREE.Color(0xb967ff),
      new THREE.Color(0x00ffcc),
    ]
  },
  
  nebula: {
    particleCount: 40000,
    flowSpeed: 0.15,
    handForceStrength: 0.05,
    colorPalette: [
      new THREE.Color(0x7b2cbf),
      new THREE.Color(0x9d4edd),
      new THREE.Color(0xc77dff),
      new THREE.Color(0xe0aaff),
    ]
  },
  
  gold: {
    particleCount: 30000,
    flowSpeed: 0.25,
    handForceStrength: 0.08,
    colorPalette: [
      new THREE.Color(0xffd700),
      new THREE.Color(0xffec8b),
      new THREE.Color(0xffc125),
      new THREE.Color(0xeec900),
    ]
  }
};

export function applyPreset(presetName) {
  const preset = PRESETS[presetName];
  if (preset) {
    Object.assign(CONFIG, preset);
  }
}
