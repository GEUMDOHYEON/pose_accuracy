import { useEffect, useRef, useState } from "react";
import { Pose, POSE_CONNECTIONS } from "@mediapipe/pose";
import { Camera } from "@mediapipe/camera_utils";
import * as drawingUtils from "@mediapipe/drawing_utils";

function PoseAngleTracker() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [angleKnee, setAngleKnee] = useState(null);
  const [angleHip, setAngleHip] = useState(null);
  const [kneeFeedback, setKneeFeedback] = useState("");
  const [hipFeedback, setHipFeedback] = useState("");

  useEffect(() => {
    const pose = new Pose({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
    });

    pose.setOptions({
      selfieMode: true,
      modelComplexity: 1,
      smoothLandmarks: true,
      enableSegmentation: false,
      smoothSegmentation: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    pose.onResults((results) => {
      if (!results.poseLandmarks) return;

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

      const lm = results.poseLandmarks;

      const shoulder = { x: lm[11].x, y: lm[11].y };
      const hip = { x: lm[23].x, y: lm[23].y };
      const knee = { x: lm[25].x, y: lm[25].y };
      const ankle = { x: lm[27].x, y: lm[27].y };

      if (lm) {
        drawingUtils.drawConnectors(canvasCtx, lm, POSE_CONNECTIONS, {
          color: "#00FF00",
          lineWidth: 4,
        });

        drawingUtils.drawConnectors(canvasCtx, lm, {
          color: "#FF0000",
          lineWidth: 2,
        });
      }

      setAngleKnee(calculateAngle(hip, knee, ankle));
      setAngleHip(calculateAngle(shoulder, hip, knee));

      // 무릎보다 발끝이 앞에 나간 경우
      if (knee.x - ankle.x > 0.05) {
        setKneeFeedback("무릎이 발끝보다 나갔어요.");
      } else {
        setKneeFeedback("좋은 자세입니다.");
      }

      // 허리가 과도하게 숙여진 경우
      if (angleHip < 130) {
        setHipFeedback("허리를 너무 숙였습니다.");
      } else if (angleHip < 160) {
        setHipFeedback("상체를 조금만 세워야합니다.");
      } else {
        setHipFeedback("좋은 자세입니다.");
      }

      canvasCtx.restore();
    });

    const camera = new Camera(videoRef.current, {
      onFrame: async () => {
        await pose.send({ image: videoRef.current });
      },
      width: 640,
      height: 480,
    });

    camera.start();
  }, []);

  return (
    <div>
      <video ref={videoRef} style={{ display: "none" }} />
      <canvas ref={canvasRef} width={640} height={480} playsInline />
      <h1>angle_knee: {angleKnee}</h1>
      <h1>angle_hip: {angleHip}</h1>
      <h1>
        무릎 : {kneeFeedback}, 허리 : {hipFeedback}
      </h1>
    </div>
  );
}

function calculateAngle(a, b, c) {
  const radians =
    Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x); // 벡터 bc, 벡터 ba 방향으로 각도 설정

  let angle = Math.abs((radians * 180.0) / Math.PI);

  if (angle > 180.0) {
    angle = 360.0 - angle;
  }

  return angle;
}

export default PoseAngleTracker;
