import React, { useEffect, useRef, useState } from "react";
import { Pose } from "@mediapipe/pose";
import { Camera } from "@mediapipe/camera_utils";
import * as drawing from "@mediapipe/drawing_utils";

function PoseRecoder() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [landmarkList, setLandmarkList] = useState([]);
  const [currentLabel, setCurrentLabel] = useState("correct");
  const [latestLandmarks, setLatestLandmarks] = useState(null); // ⭐ 마지막 포즈 저장

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

    pose.onResults(onResults);

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

  const onResults = (results) => {
    const canvasCtx = canvasRef.current.getContext("2d");
    canvasCtx.save();
    canvasCtx.clearRect(
      0,
      0,
      canvasRef.current.width,
      canvasRef.current.height
    );
    canvasCtx.drawImage(
      results.image,
      0,
      0,
      canvasRef.current.width,
      canvasRef.current.height
    );

    if (results.poseLandmarks) {
      drawing.drawConnectors(
        canvasCtx,
        results.poseLandmarks,
        Pose.POSE_CONNECTIONS,
        { color: "#00FF00", lineWidth: 2 }
      );
      drawing.drawLandmarks(canvasCtx, results.poseLandmarks, {
        color: "#FF0000",
        lineWidth: 1,
      });

      setLatestLandmarks(results.poseLandmarks); // ⭐ 최신 포즈 저장
    }
    canvasCtx.restore();
  };

  // ⭐ 버튼 클릭 시 수동 저장
  const saveCurrentPose = () => {
    if (latestLandmarks) {
      const selectedIndices = [11, 23, 25, 27]; // 어깨, 골반, 무릎, 발목
      const selectedLandmarks = selectedIndices.map(
        (idx) => latestLandmarks[idx]
      );
      const flattened = selectedLandmarks.flatMap((lm) => [lm.x, lm.y, lm.z]);

      const sample = { label: currentLabel, data: flattened };
      setLandmarkList((prev) => [...prev, sample]);
      console.log("📥 저장된 데이터:", sample);
    } else {
      console.log("❌ 저장할 포즈 데이터 없음");
    }
  };

  const downloadJson = () => {
    const blob = new Blob([JSON.stringify(landmarkList, null, 2)], {
      type: "application/json",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "pose_data.json";
    link.click();
  };

  return (
    <div style={{ textAlign: "center" }}>
      <h1>🧍‍♀️ 실시간 자세 측정 + 라벨링</h1>

      <video
        ref={videoRef}
        width="640"
        height="480"
        style={{ display: "none" }}
      />
      <canvas ref={canvasRef} width="640" height="480" />

      <div style={{ marginTop: "20px" }}>
        <h3>
          현재 라벨:{" "}
          <span style={{ color: currentLabel === "correct" ? "green" : "red" }}>
            {currentLabel}
          </span>
        </h3>

        <button onClick={() => setCurrentLabel("correct")}>
          ✅ 올바른 자세
        </button>
        <button onClick={() => setCurrentLabel("wrong")}>❌ 잘못된 자세</button>
        <button onClick={saveCurrentPose}>📸 현재 자세 저장</button>
        <button onClick={downloadJson}>💾 JSON 저장</button>
      </div>

      <p>수집된 데이터 수: {landmarkList.length}</p>

      <pre
        style={{
          textAlign: "left",
          maxHeight: "200px",
          overflowY: "scroll",
          background: "#f9f9f9",
          padding: "10px",
          marginTop: "10px",
        }}
      >
        {JSON.stringify(landmarkList.slice(-1)[0], null, 2)}
      </pre>
    </div>
  );
}

export default PoseRecoder;
