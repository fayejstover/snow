/**
 * Hand Tracking using MediaPipe Hands
 */
export class HandTracker {
  constructor(videoElement, onReady) {
    this.video = videoElement;
    this.onReady = onReady;
    
    this.position = null;
    this.velocity = { x: 0, y: 0 };
    this.lastPosition = null;
    
    this.hands = null;
    this.camera = null;
    
    this.init();
  }

  async init() {
    // Load MediaPipe Hands
    this.hands = new window.Hands({
      locateFile: (file) => 
        `https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1675469240/${file}`
    });

    this.hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.7,
      minTrackingConfidence: 0.5
    });

    this.hands.onResults((results) => this.onResults(results));

    await this.startCamera();
  }

  async startCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 640, height: 480 } 
      });
      this.video.srcObject = stream;
      
      this.camera = new window.Camera(this.video, {
        onFrame: async () => {
          await this.hands.send({ image: this.video });
        },
        width: 640,
        height: 480
      });
      
      await this.camera.start();
      
      if (this.onReady) {
        this.onReady();
      }
    } catch (err) {
      console.error('Camera error:', err);
      throw err;
    }
  }

  onResults(results) {
    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
      const landmarks = results.multiHandLandmarks[0];
      const palm = landmarks[9]; // Middle finger base
      
      // Convert to normalized scene coordinates
      const newPos = {
        x: (1 - palm.x) * 2 - 1,  // Mirror and map to -1..1
        y: -(palm.y * 2 - 1)       // Flip Y and map to -1..1
      };
      
      // Calculate velocity
      if (this.lastPosition) {
        this.velocity.x = (newPos.x - this.lastPosition.x) * 10;
        this.velocity.y = (newPos.y - this.lastPosition.y) * 10;
      }
      
      this.lastPosition = { ...newPos };
      this.position = newPos;
    } else {
      this.position = null;
      this.velocity = { x: 0, y: 0 };
    }
  }

  getPosition() {
    return this.position;
  }

  getVelocity() {
    return this.velocity;
  }

  isTracking() {
    return this.position !== null;
  }
}
