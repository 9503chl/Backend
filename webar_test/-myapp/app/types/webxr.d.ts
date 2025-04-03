interface XRSession {
  requestHitTest: (frame: XRFrame, referenceSpace: XRReferenceSpace) => Promise<XRHitResult[]>;
}

interface XRFrame {
  session: XRSession;
}

interface XRHitResult {
  getPose: (referenceSpace: XRReferenceSpace) => XRPose | undefined;
}

interface XRPose {
  transform: {
    matrix: Float32Array;
  };
} 