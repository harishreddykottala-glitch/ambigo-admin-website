import * as THREE from 'three';

export class EmergencyMapScene {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private animationId: number = 0;
  private vehicles: THREE.Group[] = [];

  constructor(container: HTMLDivElement) {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xf8fafc); // very light gray/blue
    this.scene.fog = new THREE.FogExp2(0xf8fafc, 0.002);

    this.camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 1, 1000);
    this.camera.position.set(200, 150, 200);
    this.camera.lookAt(0, 0, 0);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(this.renderer.domElement);

    this.setupLighting();
    this.buildCity();
    this.spawnAmbulance();

    this.animate = this.animate.bind(this);
    this.animate();

    window.addEventListener('resize', this.onWindowResize.bind(this, container));
  }

  private setupLighting() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    this.scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(100, 200, 50);
    this.scene.add(dirLight);

    // Premium orange accent light
    const orangeLight = new THREE.PointLight(0xff6b35, 2, 500);
    orangeLight.position.set(0, 50, 0);
    this.scene.add(orangeLight);
  }

  private buildCity() {
    // Grid ground
    const gridHelper = new THREE.GridHelper(500, 50, 0x94a3b8, 0xe2e8f0);
    gridHelper.position.y = -0.1;
    this.scene.add(gridHelper);

    // Buildings
    const buildingMaterial = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.9,
      shininess: 30,
    });

    for (let i = 0; i < 40; i++) {
      const w = Math.random() * 20 + 10;
      const h = Math.random() * 60 + 20;
      const d = Math.random() * 20 + 10;
      const geometry = new THREE.BoxGeometry(w, h, d);
      const mesh = new THREE.Mesh(geometry, buildingMaterial);
      
      const x = (Math.random() - 0.5) * 400;
      const z = (Math.random() - 0.5) * 400;
      
      // keep center relatively clear
      if (Math.abs(x) < 50 && Math.abs(z) < 50) continue;

      mesh.position.set(x, h / 2, z);
      this.scene.add(mesh);
    }
  }

  private spawnAmbulance() {
    const group = new THREE.Group();

    // Body
    const bodyMat = new THREE.MeshPhongMaterial({ color: 0xffffff });
    const bodyGeo = new THREE.BoxGeometry(8, 6, 16);
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 4;
    group.add(body);

    // Siren
    const sirenGeo = new THREE.BoxGeometry(4, 1, 2);
    const sirenMat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const siren = new THREE.Mesh(sirenGeo, sirenMat);
    siren.position.set(0, 7.5, 2);
    group.add(siren);

    // Flashing point light attached to siren
    const flashLight = new THREE.PointLight(0xff0000, 5, 50);
    flashLight.position.set(0, 8, 2);
    group.add(flashLight);
    (group as any).flashLight = flashLight;

    this.scene.add(group);
    this.vehicles.push(group);
  }

  private animate() {
    this.animationId = requestAnimationFrame(this.animate);

    const time = Date.now() * 0.001;

    // Move vehicles in circle
    this.vehicles.forEach((vehicle, i) => {
      const radius = 60 + i * 20;
      vehicle.position.x = Math.cos(time * 0.5) * radius;
      vehicle.position.z = Math.sin(time * 0.5) * radius;
      vehicle.rotation.y = -(time * 0.5);

      // Flash siren
      if ((vehicle as any).flashLight) {
        (vehicle as any).flashLight.intensity = (Math.sin(time * 10) > 0) ? 5 : 0;
      }
    });

    // Orbit camera slowly
    this.camera.position.x = Math.cos(time * 0.1) * 200;
    this.camera.position.z = Math.sin(time * 0.1) * 200;
    this.camera.lookAt(0, 0, 0);

    this.renderer.render(this.scene, this.camera);
  }

  private onWindowResize(container: HTMLDivElement) {
    this.camera.aspect = container.clientWidth / container.clientHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(container.clientWidth, container.clientHeight);
  }

  public dispose() {
    cancelAnimationFrame(this.animationId);
    window.removeEventListener('resize', this.onWindowResize as any);
    this.renderer.dispose();
    if (this.renderer.domElement.parentElement) {
      this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
    }
  }
}
