/**
 * Simplex Noise Implementation
 */
export class SimplexNoise {
  constructor(seed = Math.random()) {
    this.p = new Uint8Array(256);
    this.perm = new Uint8Array(512);
    
    for (let i = 0; i < 256; i++) this.p[i] = i;
    
    // Shuffle with seed
    for (let i = 255; i > 0; i--) {
      seed = (seed * 16807) % 2147483647;
      const j = seed % (i + 1);
      [this.p[i], this.p[j]] = [this.p[j], this.p[i]];
    }
    
    for (let i = 0; i < 512; i++) this.perm[i] = this.p[i & 255];
  }

  noise3D(x, y, z) {
    const floor = Math.floor;
    const X = floor(x) & 255;
    const Y = floor(y) & 255;
    const Z = floor(z) & 255;
    
    x -= floor(x);
    y -= floor(y);
    z -= floor(z);
    
    const u = this.fade(x);
    const v = this.fade(y);
    const w = this.fade(z);
    
    const A = this.perm[X] + Y;
    const AA = this.perm[A] + Z;
    const AB = this.perm[A + 1] + Z;
    const B = this.perm[X + 1] + Y;
    const BA = this.perm[B] + Z;
    const BB = this.perm[B + 1] + Z;

    return this.lerp(w,
      this.lerp(v,
        this.lerp(u, this.grad(this.perm[AA], x, y, z), this.grad(this.perm[BA], x - 1, y, z)),
        this.lerp(u, this.grad(this.perm[AB], x, y - 1, z), this.grad(this.perm[BB], x - 1, y - 1, z))
      ),
      this.lerp(v,
        this.lerp(u, this.grad(this.perm[AA + 1], x, y, z - 1), this.grad(this.perm[BA + 1], x - 1, y, z - 1)),
        this.lerp(u, this.grad(this.perm[AB + 1], x, y - 1, z - 1), this.grad(this.perm[BB + 1], x - 1, y - 1, z - 1))
      )
    );
  }

  fade(t) { return t * t * t * (t * (t * 6 - 15) + 10); }
  lerp(t, a, b) { return a + t * (b - a); }
  grad(hash, x, y, z) {
    const h = hash & 15;
    const u = h < 8 ? x : y;
    const v = h < 4 ? y : h === 12 || h === 14 ? x : z;
    return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
  }
}

/**
 * Curl Noise - creates divergence-free flow fields
 */
export class CurlNoise {
  constructor(seed) {
    this.noise = new SimplexNoise(seed);
    this.eps = 0.0001;
  }

  get(x, y, z, time) {
    const eps = this.eps;
    const n = this.noise;
    
    const n1 = n.noise3D(x, y + eps, z + time);
    const n2 = n.noise3D(x, y - eps, z + time);
    const n3 = n.noise3D(x, y, z + eps + time);
    const n4 = n.noise3D(x, y, z - eps + time);
    const n5 = n.noise3D(x + eps, y, z + time);
    const n6 = n.noise3D(x - eps, y, z + time);

    return {
      x: (n1 - n2 - n3 + n4) / (2 * eps),
      y: (n3 - n4 - n5 + n6) / (2 * eps),
      z: (n5 - n6 - n1 + n2) / (2 * eps)
    };
  }
}
