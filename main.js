// import * as THREE from 'three';
// import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// Create a scene
const scene = new THREE.Scene();

// Create a renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true; // Enable shadows
document.body.appendChild(renderer.domElement);

scene.background = new THREE.Color(0x62a4bf);

// Create a plane geometry for terrain
const geometry = new THREE.PlaneGeometry(28, 11, 50, 50);

// Create a height map texture
const textureLoader = new THREE.TextureLoader();
const maps = {
    0: {map: './heightMaps/1.png', name: "Snowdonia"},
    1: {map: './heightMaps/2.png', name: "Scottish Highlands"},
    2: {map: './heightMaps/3.png', name: "Swiss Alps"},
}
const map = maps[Math.floor(Math.random()*3)]
console.log(map.name)
const heightMap = textureLoader.load(map.map);
const waterMap = textureLoader.load(map.map);
heightMap.wrapS = THREE.RepeatWrapping;
heightMap.wrapT = THREE.RepeatWrapping;
waterMap.wrapS = THREE.RepeatWrapping;
waterMap.wrapT = THREE.RepeatWrapping;
heightMap.repeat.set(1.5, 1.5);
waterMap.repeat.set(10, 10);

// Create a standard material with displacement map
const grassTexture = textureLoader.load('./assets/grass.avif');
grassTexture.wrapS = THREE.RepeatWrapping;
grassTexture.wrapT = THREE.RepeatWrapping;
grassTexture.repeat.set(25, 25);
const material = new THREE.MeshPhongMaterial({
    wireframe: false,
    displacementMap: heightMap,
    displacementScale: 1,
    map: grassTexture,
    shininess: 2,
});

// Create a terrain mesh
const terrain = new THREE.Mesh(geometry, material);
terrain.castShadow = true;
terrain.receiveShadow = true; // Enable receiving shadows
scene.add(terrain);

const waterGeometry = new THREE.PlaneGeometry(28, 11, 100, 100);
const waterMaterial = new THREE.MeshPhongMaterial({
    color: 0x0e87cc,
    wireframe: false,
    transparent: true,
    opacity: 0.9,
    shininess: 100,
    displacementMap: waterMap,
    displacementScale: 0.1,
})
const water = new THREE.Mesh(waterGeometry, waterMaterial)
water.position.z = 0.15
scene.add(water)

// Add ambient light to the scene
const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
scene.add(ambientLight);

// Add directional light to the scene
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
directionalLight.position.set(1, 5, 10);
directionalLight.castShadow = true;
scene.add(directionalLight);

// Set up shadow properties for the directional light
directionalLight.shadow.mapSize.width = 1024; // Adjust shadow map size
directionalLight.shadow.mapSize.height = 1024; // Adjust shadow map size
directionalLight.shadow.camera.near = 0.5; // Adjust shadow camera near value
directionalLight.shadow.camera.far = 50; // Adjust shadow camera far value

// Set up the shadow properties for the terrain mesh
terrain.receiveShadow = true;

//load plane model
const loader = new GLTFLoader();
let plane
loader.load('./assets/plane.glb', (object) => {
    plane = object.scene;
    scene.add(plane);
    plane.scale.set(0.01, 0.01, 0.01);
    plane.rotation.x = 0;
    plane.position.z = 0;
    plane.position.y = 0;
    plane.position.x = 0;
    plane.castShadow = true;
    plane.receiveShadow = true;
    console.log(plane)
})


//Clouds
for(let i=0; i<600; i++){
    const cloudGeometry = new THREE.IcosahedronGeometry(Math.random()*0.5, Math.floor(Math.random()*2)+2);
    const cloudMaterial = new THREE.MeshPhongMaterial({
        color: 0xffffff,
        wireframe: false,
        transparent: true,
        opacity: Math.random()*0.2 + 0.1,
        shininess: 100,
        displacementMap: waterMap,
        displacementScale: Math.random()*0.3 + 0.2,
    })
    const cloud = new THREE.Mesh(cloudGeometry, cloudMaterial)
    cloud.position.z = Math.random() + 2
    cloud.position.x = Math.random() * 32 - 16
    cloud.position.y = Math.random() * 16 - 8
    cloud.castShadow = true;
    scene.add(cloud)
}



// Create a camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 1;
camera.position.y = -3;
camera.rotation.x = Math.PI/2;

let mousePos = 0
let mouseVertical = 0
document.addEventListener('mousemove', (e) => {
    mousePos = e.clientX / window.innerWidth - 0.5
    mouseVertical = e.clientY / window.innerHeight - 0.6
})

const touchPos = (e) => {
    let evt = (typeof e.originalEvent === 'undefined') ? e : e.originalEvent;
    let touch = evt.touches[0] || evt.changedTouches[0];
    mousePos = touch.pageX / window.innerWidth - 0.5
    mouseVertical = touch.pageY / window.innerHeight - 1
}
document.addEventListener("touchstart", touchPos, false);
document.addEventListener("touchmove", touchPos, false);
document.addEventListener("touchend", () => {
    mousePos = 0
    mouseVertical = 0
});

//render loop
let cameraAngle = Math.PI/2;
let time = 0
const velocity = 0.003;
const animate = () => {
    requestAnimationFrame(animate);

    cameraAngle -= mousePos*0.01
    camera.rotation.y = cameraAngle - Math.PI/2
    camera.position.x += velocity * Math.cos(cameraAngle);
    camera.position.y += velocity * Math.sin(cameraAngle);
    camera.position.z -= 0.8 * mouseVertical * 0.005;

    plane.position.x = camera.position.x + 0.25 * Math.cos(cameraAngle)
    plane.position.y = camera.position.y + 0.25 * Math.sin(cameraAngle)
    plane.position.z = camera.position.z - 0.07
    plane.rotation.x = -mouseVertical * 0.3 + Math.PI/2
    plane.rotation.y = cameraAngle + Math.PI/2
    plane.rotation.z = mousePos * 0.3

    time += 0.0005; //Distance
    directionalLight.position.x += Math.cos(time) * 0.003; //Speed
    
    renderer.render(scene, camera);
};


// Resize handling
window.addEventListener('resize', () => {
    const newWidth = window.innerWidth;
    const newHeight = window.innerHeight;


    camera.aspect = newWidth / newHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(newWidth, newHeight);
});

animate();
