import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// Change this to point at a different character model.
const MODEL_URL = './3d%20model/shon-3d.glb';

const AUTO_ROTATE_SPEED = 0.25; // radians per second when idle
const DRAG_SPEED = 0.01; // radians per pixel of drag
const MOMENTUM_DECAY = 3; // higher = drag momentum settles into auto-rotate faster
const TARGET_HEIGHT = 1.8; // world units the model is scaled to fill

class CharacterViewer {
  constructor(container) {
    this.container = container;
    this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
    this.camera.position.set(0, 1.4, 4);
    this.camera.lookAt(0, 1.1, 0);

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.container.appendChild(this.renderer.domElement);

    this.modelRoot = null;
    this.mixer = null;
    this.clock = new THREE.Clock();

    this.isDragging = false;
    this.pointerId = null;
    this.lastPointerX = 0;
    this.dragVelocity = 0;
    this.rotationVelocity = this.prefersReducedMotion ? 0 : AUTO_ROTATE_SPEED;

    this.raycaster = new THREE.Raycaster();
    this.pointerNDC = new THREE.Vector2();

    this.isVisible = true;
    this.rafId = null;

    this._addLights();
    this._bindEvents();
    this._loadModel();
    this._onResize();
    this._animate = this._animate.bind(this);
    this.rafId = requestAnimationFrame(this._animate);
  }

  _addLights() {
    const key = new THREE.DirectionalLight(0xfff4e0, 1.3);
    key.position.set(2.5, 3.5, 3);
    this.scene.add(key);

    const fill = new THREE.DirectionalLight(0xcfe0ff, 0.45);
    fill.position.set(-3, 1.5, 2);
    this.scene.add(fill);

    const rim = new THREE.DirectionalLight(0xc5b382, 0.9);
    rim.position.set(-1, 3, -4);
    this.scene.add(rim);

    const ambient = new THREE.AmbientLight(0xffffff, 0.18);
    this.scene.add(ambient);
  }

  _loadModel() {
    const loader = new GLTFLoader();
    loader.load(
      MODEL_URL,
      (gltf) => {
        const model = gltf.scene;

        // Normalize position/scale so any model appears centered and consistently sized.
        const box = new THREE.Box3().setFromObject(model);
        const size = new THREE.Vector3();
        box.getSize(size);
        const center = new THREE.Vector3();
        box.getCenter(center);

        const height = size.y || 1;
        const scale = TARGET_HEIGHT / height;
        model.scale.setScalar(scale);

        model.position.x -= center.x * scale;
        model.position.z -= center.z * scale;
        model.position.y -= box.min.y * scale;

        model.traverse((node) => {
          if (node.isMesh) {
            node.castShadow = false;
            node.receiveShadow = false;
          }
        });

        const wrapper = new THREE.Group();
        wrapper.add(model);
        this.scene.add(wrapper);
        this.modelRoot = wrapper;

        if (gltf.animations && gltf.animations.length > 0) {
          this.mixer = new THREE.AnimationMixer(model);
          const idleClip =
            gltf.animations.find((clip) => /idle/i.test(clip.name)) || gltf.animations[0];
          this.mixer.clipAction(idleClip).play();
        }
      },
      undefined,
      (error) => {
        console.error('Failed to load character model:', error);
      }
    );
  }

  _bindEvents() {
    this._onPointerDown = this._onPointerDown.bind(this);
    this._onPointerMove = this._onPointerMove.bind(this);
    this._onHoverMove = this._onHoverMove.bind(this);
    this._onPointerUp = this._onPointerUp.bind(this);
    this._onResize = this._onResize.bind(this);
    this._onVisibilityChange = this._onVisibilityChange.bind(this);

    this.container.addEventListener('pointerdown', this._onPointerDown);
    this.container.addEventListener('pointermove', this._onHoverMove);
    window.addEventListener('pointermove', this._onPointerMove);
    window.addEventListener('pointerup', this._onPointerUp);
    window.addEventListener('pointercancel', this._onPointerUp);

    // Explicitly block zoom/pan gestures over the viewer.
    this.container.addEventListener('wheel', (e) => e.preventDefault(), { passive: false });
    this.container.addEventListener('contextmenu', (e) => e.preventDefault());

    this.resizeObserver = new ResizeObserver(this._onResize);
    this.resizeObserver.observe(this.container);
    window.addEventListener('resize', this._onResize);

    document.addEventListener('visibilitychange', this._onVisibilityChange);
  }

  _intersectsCharacter(clientX, clientY) {
    if (!this.modelRoot) return false;
    const rect = this.container.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return false;
    this.pointerNDC.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    this.pointerNDC.y = -((clientY - rect.top) / rect.height) * 2 + 1;
    this.raycaster.setFromCamera(this.pointerNDC, this.camera);
    return this.raycaster.intersectObject(this.modelRoot, true).length > 0;
  }

  _onPointerDown(event) {
    if (!this._intersectsCharacter(event.clientX, event.clientY)) return;

    this.isDragging = true;
    this.pointerId = event.pointerId;
    this.lastPointerX = event.clientX;
    this.dragVelocity = 0;
    this.container.style.cursor = 'grabbing';
    this.container.setPointerCapture?.(event.pointerId);
  }

  _onHoverMove(event) {
    if (this.isDragging) return;
    this.container.style.cursor = this._intersectsCharacter(event.clientX, event.clientY)
      ? 'grab'
      : 'default';
  }

  _onPointerMove(event) {
    if (!this.isDragging || event.pointerId !== this.pointerId || !this.modelRoot) return;
    const deltaX = event.clientX - this.lastPointerX;
    this.lastPointerX = event.clientX;

    const rotationDelta = deltaX * DRAG_SPEED;
    this.modelRoot.rotation.y += rotationDelta;

    const dt = Math.max(this.clock.getDelta(), 1 / 240);
    this.dragVelocity = rotationDelta / dt;
  }

  _onPointerUp(event) {
    if (event.pointerId !== undefined && event.pointerId !== this.pointerId) return;
    this.isDragging = false;
    this.pointerId = null;
    this.container.style.cursor = 'default';
    // Carry drag momentum into the idle spin; it eases toward auto-rotate speed in _animate.
    this.rotationVelocity = this.dragVelocity;
  }

  _onResize() {
    const width = this.container.clientWidth || 1;
    const height = this.container.clientHeight || 1;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height, false);
  }

  _onVisibilityChange() {
    this.isVisible = document.visibilityState === 'visible';
    if (this.isVisible) {
      this.clock.getDelta(); // avoid a large jump after being hidden
      this.rafId = requestAnimationFrame(this._animate);
    }
  }

  _animate() {
    if (!this.isVisible) return;
    this.rafId = requestAnimationFrame(this._animate);

    const delta = this.clock.getDelta();

    if (this.mixer) this.mixer.update(delta);

    if (this.modelRoot && !this.isDragging) {
      const target = this.prefersReducedMotion ? 0 : AUTO_ROTATE_SPEED;
      this.rotationVelocity += (target - this.rotationVelocity) * Math.min(MOMENTUM_DECAY * delta, 1);
      this.modelRoot.rotation.y += this.rotationVelocity * delta;
    }

    this.renderer.render(this.scene, this.camera);
  }

  destroy() {
    cancelAnimationFrame(this.rafId);
    this.resizeObserver?.disconnect();
    window.removeEventListener('resize', this._onResize);
    window.removeEventListener('pointermove', this._onPointerMove);
    window.removeEventListener('pointerup', this._onPointerUp);
    window.removeEventListener('pointercancel', this._onPointerUp);
    document.removeEventListener('visibilitychange', this._onVisibilityChange);
    this.container.removeEventListener('pointerdown', this._onPointerDown);
    this.container.removeEventListener('pointermove', this._onHoverMove);

    this.scene.traverse((node) => {
      if (node.isMesh) {
        node.geometry?.dispose();
        const materials = Array.isArray(node.material) ? node.material : [node.material];
        materials.forEach((material) => {
          if (!material) return;
          Object.values(material).forEach((value) => {
            if (value && value.isTexture) value.dispose();
          });
          material.dispose();
        });
      }
    });

    this.renderer.dispose();
    if (this.renderer.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
    }
  }
}

const container = document.getElementById('character-viewer');
if (container) {
  const viewer = new CharacterViewer(container);
  window.addEventListener('pagehide', () => viewer.destroy(), { once: true });
}
