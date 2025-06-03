import React, { useRef, useEffect, useState } from "react";
import { Pose } from "@mediapipe/pose";
import { Camera } from "@mediapipe/camera_utils";

function calculateAngle(a, b, c) {
  const radians =
    Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
  let angle = Math.abs((radians * 180.0) / Math.PI);
  if (angle > 180.0) angle = 360 - angle;
  return angle;
}

export default function SquatCounter() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [count, setCount] = useState(0);
  const isDownRef = useRef(false);

  useEffect(() => {
    const pose = new Pose({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
    });

    pose.setOptions({
      modelComplexity: 1,
      smoothLandmarks: true,
      enableSegmentation: false,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    pose.onResults((results) => {
      const landmarks = results.poseLandmarks;
      if (landmarks) {
        const hip = landmarks[24];
        const knee = landmarks[26];
        const ankle = landmarks[28];

        const isVisible =
          hip.visibility > 0.3 &&
          knee.visibility > 0.3 &&
          ankle.visibility > 0.3;

        if (isVisible) {
          const angle = calculateAngle(hip, knee, ankle);
          console.log("무릎 각도:", angle);

          const downThreshold = 100; // 약간 여유를 줌
          const upThreshold = 155;

          if (angle < downThreshold && !isDownRef.current) {
            isDownRef.current = true;
            console.log("⬇️ 내려감 감지");
          }

          if (angle > upThreshold && isDownRef.current) {
            setCount((prev) => prev + 1);
            isDownRef.current = false;
            console.log("⬆️ 올라감 + 카운트");
          }
        }
      }

      const ctx = canvasRef.current.getContext("2d");
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      ctx.drawImage(
        results.image,
        0,
        0,
        canvasRef.current.width,
        canvasRef.current.height
      );
    });

    if (videoRef.current) {
      const camera = new Camera(videoRef.current, {
        onFrame: async () => {
          await pose.send({ image: videoRef.current });
        },
        width: 640,
        height: 480,
      });
      camera.start();
    }
  }, []);

  return (
    <div>
      <video
        ref={videoRef}
        style={{ display: "none" }}
        width="640"
        height="480"
      />
      <canvas
        ref={canvasRef}
        width="640"
        height="480"
        style={{ border: "1px solid black" }}
      />
      <h2>스쿼트 횟수: {count}</h2>
    </div>
  );
}
