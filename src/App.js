import "./App.css";
import PoseAngleTracker from "./PoseAngleTracker";
import PoseKnnChecker from "./PoseKnnChecker";
import PoseRecorder from "./PoseRecoder";
import TensorKnn from "./TensorKnn";
import PoseKnnCounter from "./PoseKnnCounter";
import SquatCounter from "./SqautCounter";
// import * as pose from "@mediapipe/pose";
// import smoothLandmarks from "mediapipe-pose-smooth"; // ES6
// import * as cam from "@mediapipe/camera_utils";
// import * as drawingUtils from "@mediapipe/drawing_utils";
// import { useRef, useEffect, useState } from "react";

function App() {
  return (
    <>
      {/* <PoseAngleTracker /> */}
      {/* <PoseRecorder /> */}
      {/* <PoseKnnChecker /> */}
      {/* <TensorKnn /> */}
      {/* <PoseKnnCounter /> */}
      <SquatCounter />
    </>
  );
}

export default App;

// function App() {
//   const webcamRef = useRef(null);
//   const canvasRef = useRef(null);
//   var camera = null;
//   const [didLoad, setdidLoad] = useState(false);
//   const [isSquatting, setIsSquatting] = useState(false);

//   function detectSquat(landmarks) {
//     if (!landmarks) return false;
//     const hip = landmarks[24]; // 오른쪽 엉덩이
//     const knee = landmarks[26]; // 오른쪽 무릎
//     return hip.y > knee.y; // 엉덩이가 무릎보다 아래에 있으면 true (스쿼트 상태)
//   }

//   function onResults(results) {
//     const canvasElement = canvasRef.current;
//     const canvasCtx = canvasElement.getContext("2d");
//     canvasCtx.save();
//     canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
//     canvasCtx.drawImage(
//       results.image,
//       0,
//       0,
//       canvasElement.width,
//       canvasElement.height
//     );
//     const landmarks = results.poseLandmarks.landmarks;
//     if (results.poseLandmarks) {
//       drawingUtils.drawConnectors(
//         canvasCtx,
//         results.poseLandmarks,
//         pose.POSE_CONNECTIONS,
//         { visibilityMin: 0.65, color: "white" }
//       );
//       drawingUtils.drawLandmarks(
//         canvasCtx,
//         Object.values(pose.POSE_LANDMARKS_LEFT).map(
//           (index) => results.poseLandmarks[index]
//         ),
//         { visibilityMin: 0.65, color: "white", fillColor: "rgb(255,138,0)" }
//       );
//       drawingUtils.drawLandmarks(
//         canvasCtx,
//         Object.values(pose.POSE_LANDMARKS_RIGHT).map(
//           (index) => results.poseLandmarks[index]
//         ),
//         { visibilityMin: 0.65, color: "white", fillColor: "rgb(0,217,231)" }
//       );
//       drawingUtils.drawLandmarks(
//         canvasCtx,
//         Object.values(pose.POSE_LANDMARKS_NEUTRAL).map(
//           (index) => results.poseLandmarks[index]
//         ),
//         { visibilityMin: 0.65, color: "white", fillColor: "white" }
//       );
//     }

//     // 스쿼트 감지 및 상태 업데이트
//     setIsSquatting(detectSquat(results.poseLandmarks));
//     // var angle_knee = calculateAngle()
//     canvasCtx.restore();
//   }

//   useEffect(() => {
//     if (!didLoad) {
//       const mpPose = new pose.Pose({
//         locateFile: (file) => {
//           return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
//         },
//       });

//       mpPose.setOptions({
//         selfieMode: true,
//         modelComplexity: 1,
//         smoothLandmarks: true,
//         enableSegmentation: false,
//         smoothSegmentation: true,
//         minDetectionConfidence: 0.5,
//         minTrackingConfidence: 0.5,
//       });

//       camera = new cam.Camera(webcamRef.current, {
//         onFrame: async () => {
//           const canvasElement = canvasRef.current;
//           const aspect = window.innerHeight / window.innerWidth;
//           let width, height;
//           if (window.innerWidth > window.innerHeight) {
//             height = window.innerHeight;
//             width = height / aspect;
//           } else {
//             width = window.innerWidth;
//             height = width * aspect;
//           }
//           canvasElement.width = width;
//           canvasElement.height = height;
//           await mpPose.send({ image: webcamRef.current });
//         },
//       });
//       camera.start();

//       mpPose.onResults((results) => smoothLandmarks(results, onResults));
//       setdidLoad(true);
//     }
//   }, [didLoad]);

//   return (
//     <div className="App">
//       <div className="container">
//         <video className="input_video" ref={webcamRef} />
//         <canvas ref={canvasRef} className="output_canvas"></canvas>
//         <h2>{isSquatting ? "스쿼트 감지됨!" : "일반 자세"}</h2>
//       </div>
//     </div>
//   );
// }

// function calculateAngle(a, b, c) {
//   // 각 점은 {x: Number, y: Number}
//   const radians =
//     Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);

//   let angle = Math.abs((radians * 180.0) / Math.PI);

//   if (angle > 180.0) {
//     angle = 360.0 - angle;
//   }

//   return angle;
// }

// export default App;
