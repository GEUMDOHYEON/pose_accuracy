import React, { useEffect, useRef, useState } from "react";
import { Pose } from "@mediapipe/pose";

const PoseModel = () => {
  const poseModel = useRef(null);
  const [isPoseLoaded, setIsPoseLoaded] = useState(false);
  const [isPoseInitialized, setIsPoseInitialized] = useState(false);

  const initializePoseModel = () => {
    poseModel.current = new Pose({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/pose${file}`;
      },
    });

    poseModel.current.setOptions({
      modelComplexity: 1,
      selfieMode: true,
      smoothLandmarks: true,
      enableSegmentation: true,
      smoothSegmentation: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    setIsPoseLoaded(true);
  };

  useEffect(() => {
    initializePoseModel();
  }, []);

  return <></>;
};

export default PoseModel;
