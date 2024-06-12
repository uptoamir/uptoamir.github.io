import "./style.css";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { TWEEN } from "three/examples/jsm/libs/tween.module.min.js";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry";

const SCENE_CONFIG = {
  antialias: true,
  backgroundColor: 0xd8c7b6,
  camera: {
    fov: 75,
    near: 0.1,
    far: 1000,
    startPosition: { x: 1, y: 10.6, z: 45 },
  },
  lights: {
    ambient: {
      color: 0xffffff,
      intensity: 1.0,
    },
    directional: {
      color: 0xffffff,
      intensity: 1.0,
      position: { x: 5, y: 10, z: 7.5 },
    },
  },
};

class BaseScene {
  constructor() {
    this._scene = null;
    this._renderer = null;
    this._camera = null;
    this._windowSizes = {};
    this._closeIcon = {};
    this._clickMonitorIcon = {};

    this._init();
  }

  _init() {
    this._initScene();
    this._initRenderer();
    this._initCamera();
    this._initLights();
    this._initLinks();
    this._loadRoomModel();
    this._initControls();
    this._initOnResize();
    this._animate();
    this._setupMouseEvents();
  }

  _initLinks() {
    const linkElementLinkedin = document.createElement("a");
    linkElementLinkedin.id = "linkedin_link";
    window.document.body.appendChild(linkElementLinkedin);
  }

  _initScene() {
    this._scene = new THREE.Scene();
    this._scene.background = new THREE.Color(SCENE_CONFIG.backgroundColor);
  }

  _initRenderer() {
    this._windowSizes = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    const canvas = document.querySelector("canvas.webgl");
    this._renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: SCENE_CONFIG.antialias,
    });

    this._renderer.setSize(this._windowSizes.width, this._windowSizes.height);
    this._renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    this._renderer.outputEncoding = THREE.sRGBEncoding;
    this._renderer.shadowMap.enabled = true;
    this._renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  }

  _initCamera() {
    const { fov, near, far, startPosition } = SCENE_CONFIG.camera;
    this._camera = new THREE.PerspectiveCamera(
      fov,
      this._windowSizes.width / this._windowSizes.height,
      near,
      far
    );
    this._camera.position.set(
      startPosition.x,
      startPosition.y,
      startPosition.z
    );
    this._camera.lookAt(0, 0, 0);
    this._scene.add(this._camera);
  }

  _initLights() {
    const { ambient, directional } = SCENE_CONFIG.lights;

    const ambientLight = new THREE.AmbientLight(
      ambient.color,
      ambient.intensity
    );
    this._scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(
      directional.color,
      directional.intensity
    );
    directionalLight.position.set(
      directional.position.x,
      directional.position.y,
      directional.position.z
    );
    directionalLight.castShadow = true;

    directionalLight.shadow.camera.left = -10;
    directionalLight.shadow.camera.right = 10;
    directionalLight.shadow.camera.top = 9;
    directionalLight.shadow.camera.bottom = -9;
    directionalLight.shadow.camera.far = 18;
    directionalLight.shadow.mapSize.set(1024, 1024);

    this._scene.add(directionalLight);
  }

  addIconsToScene(scene) {
    const linkedinTexturePath = "/linkedin.png";
    const color = 0x2868b2;
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(linkedinTexturePath, (linkedinTexture) => {
      const materials = [
        new THREE.MeshBasicMaterial({ color }),
        new THREE.MeshBasicMaterial({ color }),
        new THREE.MeshBasicMaterial({ color }),
        new THREE.MeshBasicMaterial({ color }),
        new THREE.MeshBasicMaterial({
          map: linkedinTexture,
          transparent: true,
        }),
        new THREE.MeshBasicMaterial({ color }),
      ];
      const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
      const boxMesh = new THREE.Mesh(boxGeometry, materials);
      boxMesh.position.set(-19, 10.25, 14.4);
      boxMesh.rotation.set(-66, -99, 66);
      boxMesh.scale.set(1.4, 1.4, 1.4);
      boxMesh.name = "LinkedInBox";
      scene.add(boxMesh);
    });
  }

  _loadRoomModel() {
    const loader = new GLTFLoader();

    loader.load(
      "/models/room.glb",
      (gltf) => {
        const room = gltf.scene;

        room.scale.set(10, 10, 10);
        room.position.set(-10, -10, 0);

        room.traverse((node) => {
          if (node.name.includes("polySurface1299")) {
            if (node.children.length > 0) {
              node.children[0].material.color = new THREE.Color(0x020a09);
            }
          }
          if (node.isMesh) {
            node.castShadow = true;
            node.receiveShadow = true;
          }
        });
        this._scene.add(room);
        const textureLoader = new THREE.TextureLoader();

        const textureMonitorIcon = textureLoader.load("/click.png", () => {
          const geometry = new THREE.PlaneGeometry(5, 5);
          const material = new THREE.MeshBasicMaterial({
            map: textureMonitorIcon,
            transparent: true,
          });
          const mesh = new THREE.Mesh(geometry, material);
          this._clickMonitorIcon = mesh;
          mesh.position.set(24.5, -0.45, -6);
          mesh.scale.set(1.4, 0.5, 0.5);
          mesh.rotation.set(
            THREE.MathUtils.degToRad(0),
            THREE.MathUtils.degToRad(-27),
            THREE.MathUtils.degToRad(0)
          );
          mesh.name = "clickMonitorMesh";
          this._scene.add(mesh);
          mesh.addEventListener("click", (event) => {
            mesh.visible = false;
          });
        });
      },
      (xhr) => {
        console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
      },
      (error) => {
        console.error("An error occurred", error);
      }
    );
    const renderer = this._renderer;
    document.body.appendChild(renderer.domElement);

    const textureLoader = new THREE.TextureLoader();

    const texture = textureLoader.load("/close-icon.png", () => {
      const geometry = new THREE.PlaneGeometry(5, 5);
      const material = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
      });
      const mesh = new THREE.Mesh(geometry, material);
      this._closeIcon = mesh;
      mesh.visible = false;
      mesh.position.set(24.5, 2.1, -6);
      mesh.scale.set(0.1, 0.1, 0.1);
      mesh.rotation.set(
        THREE.MathUtils.degToRad(0),
        THREE.MathUtils.degToRad(-30),
        THREE.MathUtils.degToRad(0)
      );
      mesh.name = "clickableMesh";
      const originalPosition = new THREE.Vector3(
        SCENE_CONFIG.camera.startPosition.x,
        SCENE_CONFIG.camera.startPosition.y,
        SCENE_CONFIG.camera.startPosition.z
      );
      const originalTargetPosition = this._controls.target.clone();
      mesh.userData.originalCameraPosition = originalPosition;
      mesh.userData.originalTargetPosition = originalTargetPosition;
      this._scene.add(mesh);
      mesh.addEventListener("click", (event) => {
        const iframe = document.getElementById("iframe");
        iframe.style.visibility = "hidden";
        this._controls.enabled = true;
        new TWEEN.Tween(this._camera.position)
          .to(
            {
              x: originalPosition.x,
              y: originalPosition.y,
              z: originalPosition.z,
            },
            1000
          )
          .easing(TWEEN.Easing.Quadratic.InOut)
          .onComplete(() => {
            new TWEEN.Tween(this._controls.target)
              .to(
                {
                  x: originalTargetPosition.x,
                  y: originalTargetPosition.y,
                  z: originalTargetPosition.z,
                },
                1000
              )
              .easing(TWEEN.Easing.Quadratic.InOut)
              .onUpdate(() => {
                this._controls.update();
              })
              .start();
          })
          .start();
        mesh.visible = false;
        this._clickMonitorIcon.visible = true;
      });
    });

    loader.load("/models/avatar.glb", (gltf) => {
      const model = gltf.scene;
      model.position.set(-8, -10, 8.5);
      model.scale.set(9, 9, 9);
      this._scene.add(model);
      const mixer = new THREE.AnimationMixer(model);
      gltf.animations.forEach((clip) => {
        mixer.clipAction(clip).play();
      });
      this.addIconsToScene(this._scene);
      const clock = new THREE.Clock();
      const animate = () => {
        requestAnimationFrame(animate);
        mixer.update(clock.getDelta());
        this._renderer.render(this._scene, this._camera);
      };

      animate();
    });
  }

  _initControls() {
    this._controls = new OrbitControls(this._camera, this._renderer.domElement);
    this._controls.enableDamping = true;
  }

  _initOnResize() {
    window.addEventListener("resize", () => {
      this._windowSizes.width = window.innerWidth;
      this._windowSizes.height = window.innerHeight;

      this._camera.aspect = this._windowSizes.width / this._windowSizes.height;
      this._camera.updateProjectionMatrix();

      this._renderer.setSize(this._windowSizes.width, this._windowSizes.height);
      this._renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    });
  }

  _animate() {
    requestAnimationFrame(() => this._animate());
    if (this._controls.enabled) {
      this._controls.update();
    }
    this._renderer.render(this._scene, this._camera);
    TWEEN.update();
  }
  _setupMouseEvents() {
    window.addEventListener("click", (event) => this._onMouseClick(event));
    window.addEventListener("touchstart", (event) => this._onTouchStart(event));
  }

  _onMouseClick(event) {
    this._handleClick(event.clientX, event.clientY);
  }

  _onTouchStart(event) {
    const touch = event.touches[0];
    this._handleClick(touch.clientX, touch.clientY, true);
  }

  _handleClick(clientX, clientY, isTouch = false) {
    const mouse = new THREE.Vector2();
    mouse.x = (clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(clientY / window.innerHeight) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, this._camera);

    const intersects = raycaster.intersectObjects(this._scene.children, true);

    if (intersects.length > 0) {
      const intersectedObject = intersects[0].object;
      if (
        !(isTouch && /Mobi|Android/i.test(navigator.userAgent)) &&
        intersectedObject.name === "clickableMesh"
      ) {
        intersectedObject.dispatchEvent({ type: "click" });
      }
      if (intersectedObject.name === "LinkedInBox") {
        const link = document.getElementById("linkedin_link");
        link.setAttribute(
          "href",
          "https://www.linkedin.com/in/amirhossein-khoshbin-4011a8198/"
        );
        if (!(isTouch && /Mobi|Android/i.test(navigator.userAgent))) {
          link.target = "_blank";
        }
        link.click();
      }
      if (
        !(isTouch && /Mobi|Android/i.test(navigator.userAgent)) &&
        (intersectedObject.name === "pCube292_metal_0" ||
          intersectedObject.name === "clickMonitorMesh")
      ) {
        this._clickMonitorIcon.visible = false;
        const targetPosition = new THREE.Vector3(22.7, -0.4, -2.35);
        const direction = new THREE.Vector3();
        this._camera.getWorldDirection(direction);
        this._controls.enabled = false;
        const targetLookAt = targetPosition.clone().add(direction);

        new TWEEN.Tween(this._camera.position)
          .to(
            {
              x: targetPosition.x,
              y: targetPosition.y,
              z: targetPosition.z,
            },
            1000
          )
          .easing(TWEEN.Easing.Quadratic.InOut)
          .onComplete(() => {
            new TWEEN.Tween(this._controls.target)
              .to(
                {
                  x: 28.54,
                  y: -0.4,
                  z: -14,
                },
                1600
              )
              .easing(TWEEN.Easing.Quadratic.InOut)
              .onUpdate(() => {
                this._controls.update();
              })
              .start()
              .onComplete(() => {
                this._closeIcon.visible = true;
                const iframe = document.getElementById("iframe");
                iframe.style.visibility = "visible";
              });
          })
          .start();

        new TWEEN.Tween(this._controls.target)
          .to(
            {
              x: targetLookAt.x,
              y: targetLookAt.y,
              z: targetLookAt.z,
            },
            1000
          )
          .easing(TWEEN.Easing.Quadratic.InOut)
          .onUpdate(() => {
            this._controls.update();
          })
          .start();
      }
    }
  }
}

const baseScene = new BaseScene();
