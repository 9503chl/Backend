import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { ArToolkitSource, ArToolkitContext, ArMarkerControls } from '@ar-js-org/ar.js/three.js/build/ar-threex';

const ARViewer: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Three.js 설정
    const scene = new THREE.Scene();
    const camera = new THREE.Camera();
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true
    });

    renderer.setSize(window.innerWidth, window.innerHeight);
    containerRef.current.appendChild(renderer.domElement);

    // 조명 설정
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(0, 1, 0);
    scene.add(directionalLight);

    // AR 소스 설정
    const arToolkitSource = new ArToolkitSource({
      sourceType: 'webcam',
      sourceWidth: 1920,  // FullHD 너비
      sourceHeight: 1080, // FullHD 높이
      displayWidth: window.innerWidth,
      displayHeight: window.innerHeight,
      facingMode: 'environment'  // 후면 카메라 사용
    });

    // AR 컨텍스트 설정
    const arToolkitContext = new ArToolkitContext({
      cameraParametersUrl: '/camera_para.dat',
      detectionMode: 'mono',
      maxDetectionRate: 60,  // 초당 최대 감지 횟수
      canvasWidth: 1920,    // 처리할 캔버스 너비
      canvasHeight: 1080    // 처리할 캔버스 높이
    });

    // AR 초기화
    arToolkitContext.init(() => {
      camera.projectionMatrix.copy(arToolkitContext.getProjectionMatrix());
    });

    // 마커 컨트롤 설정
    const markerRoot = new THREE.Group();
    scene.add(markerRoot);

    new ArMarkerControls(arToolkitContext, markerRoot, {
      type: 'pattern',
      patternUrl: '/dreamy.patt',
      changeMatrixMode: 'modelViewMatrix',
    });

    // FBX 모델 로드
    const loader = new FBXLoader();
    loader.load(
      '/Geumnam_Girl_1.fbx',
      (object: THREE.Object3D) => {
        // 모델 크기 및 위치 조정
        object.scale.set(0.01, 0.01, 0.01);
        object.position.set(0, 0, 0);
        markerRoot.add(object); // 마커의 자식으로 추가
      },
      (xhr: ProgressEvent) => {
        console.log((xhr.loaded / xhr.total * 100) + '% 로드됨');
      },
      (error: unknown) => {
        if (error instanceof Error) {
          console.error('FBX 로드 중 에러 발생:', error.message);
        } else {
          console.error('FBX 로드 중 에러 발생:', String(error));
        }
      }
    );

    // AR 소스 초기화
    arToolkitSource.init(() => {
      setTimeout(() => {
        onResize();
      }, 200);
    });

    // 리사이즈 핸들러
    function onResize() {
      arToolkitSource.onResizeElement();
      arToolkitSource.copyElementSizeTo(renderer.domElement);
      if (arToolkitContext.arController !== null) {
        arToolkitSource.copyElementSizeTo(arToolkitContext.arController.canvas);
      }
    }

    window.addEventListener('resize', onResize);

    // 렌더링 루프
    const animate = () => {
      requestAnimationFrame(animate);

      if (arToolkitSource.ready) {
        arToolkitContext.update(arToolkitSource.domElement);
      }

      renderer.render(scene, camera);
    };

    animate();

    // 클린업
    return () => {
      window.removeEventListener('resize', onResize);
      containerRef.current?.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={containerRef} style={{ width: '100%', height: '100vh' }} />;
};

export default ARViewer;
