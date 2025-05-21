import { useEffect, useRef } from 'react';
import * as THREE from 'three';

const FloorARViewer: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 20);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.xr.enabled = true;
    containerRef.current.appendChild(renderer.domElement);

    // AR 세션 시작 버튼
    const button = document.createElement('button');
    button.textContent = 'AR 시작';
    button.onclick = async () => {
      if (!navigator.xr) {
        alert('WebXR이 지원되지 않는 브라우저입니다.');
        return;
      }

      try {
        // 먼저 지원 여부 확인
        const supported = await navigator.xr.isSessionSupported('immersive-ar');
        if (!supported) {
          alert('AR이 지원되지 않는 기기입니다.');
          return;
        }

        // 더 기본적인 설정으로 세션 요청
        const session = await navigator.xr.requestSession('immersive-ar', {
          requiredFeatures: ['local'],  // hit-test와 local-floor 대신 local만 사용
          optionalFeatures: ['hit-test']  // hit-test를 optional로 변경
        });
        
        await renderer.xr.setSession(session);
      } catch (error) {
        console.error('AR 세션 시작 실패:', error);
        alert('AR 세션을 시작할 수 없습니다.');
      }
    };
    document.body.appendChild(button);

    // 바닥 평면에 오브젝트 배치
    const reticle = new THREE.Mesh(
      new THREE.RingGeometry(0.15, 0.2, 32).rotateX(-Math.PI / 2),
      new THREE.MeshBasicMaterial()
    );
    reticle.visible = false;
    reticle.matrixAutoUpdate = false;  // 수동으로 매트릭스 업데이트
    scene.add(reticle);

    renderer.setAnimationLoop((timestamp, frame) => {
      if (frame) {
        const referenceSpace = renderer.xr.getReferenceSpace();
        const session = renderer.xr.getSession();

        if (session && referenceSpace && session.requestHitTest) {
          session.requestHitTest(frame, referenceSpace).then((hitTestResults) => {
            if (hitTestResults.length && reticle.matrix) {  // matrix 존재 확인
              const hit = hitTestResults[0];
              const hitPose = hit.getPose?.(referenceSpace);
              if (hitPose?.transform?.matrix) {
                reticle.visible = true;
                reticle.matrix.fromArray(hitPose.transform.matrix);
              }
            }
          });
        }
      }
      renderer.render(scene, camera);
    });

    return () => {
      renderer.setAnimationLoop(null);
      containerRef.current?.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={containerRef} style={{ width: '100%', height: '100vh' }} />;
};

export default FloorARViewer; 