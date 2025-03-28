declare module '@ar-js-org/ar.js/three.js/build/ar-threex' {
  export class ArToolkitSource {
    constructor(params: any);
    init(onReady?: () => void): void;
    ready: boolean;
    domElement: HTMLElement;
    onResizeElement(): void;
    copyElementSizeTo(element: HTMLElement): void;
  }

  export class ArToolkitContext {
    constructor(params: any);
    init(onReady?: () => void): void;
    update(domElement: HTMLElement): void;
    getProjectionMatrix(): any;
    arController: any;
  }

  export class ArMarkerControls {
    constructor(context: ArToolkitContext, camera: THREE.Camera, params: any);
  }
} 