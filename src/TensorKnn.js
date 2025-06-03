import React, { useEffect, useRef, useState } from "react";
import { Pose, POSE_LANDMARKS, POSE_CONNECTIONS } from "@mediapipe/pose";
import { Camera } from "@mediapipe/camera_utils";
import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";
import Webcam from "react-webcam";
import * as tf from "@tensorflow/tfjs";
import * as knnClassifier from "@tensorflow-models/knn-classifier";

// 사용자가 제공한 데이터셋
const dataset = [
  {
    label: "correct",
    data: [
      0.5407921075820923, 0.47158223390579224, -0.2208377569913864,
      0.5980788469314575, 0.7320543527603149, -0.11085762083530426,
      0.4565560221672058, 0.6762519478797913, -0.33191436529159546,
      0.5298165082931519, 0.8665697574615479, -0.1863258332014084,
    ],
  },
  {
    label: "correct",
    data: [
      0.5286201238632202, 0.4546341598033905, -0.24198992550373077,
      0.5973478555679321, 0.6965416073799133, -0.10893088579177856,
      0.4549766182899475, 0.6776984930038452, -0.342966765165329,
      0.527094841003418, 0.8667665123939514, -0.17129990458488464,
    ],
  },
  {
    label: "correct",
    data: [
      0.5427039861679077, 0.4737800359725952, -0.20697073638439178,
      0.5948212742805481, 0.744157612323761, -0.1121765524148941,
      0.454135000705719, 0.6774613857269287, -0.38189685344696045,
      0.525209903717041, 0.8637102842330933, -0.17521771788597107,
    ],
  },
  {
    label: "correct",
    data: [
      0.5153693556785583, 0.44884926080703735, -0.23786506056785583,
      0.5989149808883667, 0.6896093487739563, -0.11419987678527832,
      0.46094298362731934, 0.6686314344406128, -0.3467397689819336,
      0.5251838564872742, 0.8639519810676575, -0.2099258005619049,
    ],
  },
  {
    label: "wrong",
    data: [
      0.47766605019569397, 0.3511938750743866, -0.5304880142211914,
      0.6057236194610596, 0.516895055770874, -0.10973887145519257,
      0.5032463073730469, 0.6408748030662537, -0.49387088418006897,
      0.5379546284675598, 0.8674249053001404, -0.36829227209091187,
    ],
  },
  {
    label: "wrong",
    data: [
      0.43961167335510254, 0.3127010762691498, -0.41307583451271057,
      0.5974652767181396, 0.46937277913093567, -0.11642064899206161,
      0.521705687046051, 0.6402952671051025, -0.3828067481517792,
      0.5391358733177185, 0.8799484968185425, -0.37340307235717773,
    ],
  },
  {
    label: "wrong",
    data: [
      0.5690125226974487, 0.1263439655303955, -0.26324304938316345,
      0.5266690254211426, 0.40973979234695435, -0.011455535888671875,
      0.5268124938011169, 0.6304872632026672, -0.07765670120716095,
      0.5369119048118591, 0.8445268273353577, 0.13009503483772278,
    ],
  },
  {
    label: "wrong",
    data: [
      0.5679834485054016, 0.14602915942668915, -0.2479923963546753,
      0.5345195531845093, 0.4189179539680481, -0.010902633890509605,
      0.5260480046272278, 0.6282802820205688, -0.159084290266037,
      0.5319335460662842, 0.8470543026924133, 0.11711136251688004,
    ],
  },
  {
    label: "wrong",
    data: [
      0.5661607980728149, 0.16570626199245453, -0.295575886964798,
      0.5382753610610962, 0.42601025104522705, -0.018094457685947418,
      0.5244917869567871, 0.6256009340286255, -0.2348652333021164,
      0.5308369398117065, 0.8469831347465515, 0.025175252929329872,
    ],
  },
  {
    label: "wrong",
    data: [
      0.5935978293418884, 0.22942106425762177, -0.47861066460609436,
      0.5252276062965393, 0.4440850019454956, 0.024071604013442993,
      0.5573217272758484, 0.6384735703468323, -0.2085537165403366,
      0.5499722361564636, 0.8501502275466919, 0.1041828989982605,
    ],
  },
  {
    label: "wrong",
    data: [
      0.5882547497749329, 0.31361123919487, -0.20987637341022491,
      0.5330137610435486, 0.5734816789627075, 0.024676920846104622,
      0.5968904495239258, 0.7081455588340759, -0.40487661957740784,
      0.5485817193984985, 0.8607699871063232, 0.02639247477054596,
    ],
  },
  {
    label: "correct",
    data: [
      0.5747012495994568, 0.5202044248580933, -0.08729676902294159,
      0.5321537256240845, 0.7398642897605896, 0.02320883981883526,
      0.6168529987335205, 0.6777553558349609, -0.30558550357818604,
      0.5553639531135559, 0.8566848635673523, -0.23421797156333923,
    ],
  },
  {
    label: "correct",
    data: [
      0.5778012275695801, 0.5304434299468994, -0.10457949340343475,
      0.5326613187789917, 0.7481269240379333, 0.019983064383268356,
      0.618971049785614, 0.6772626638412476, -0.2815678119659424,
      0.5566492080688477, 0.8536919951438904, -0.24869410693645477,
    ],
  },
  {
    label: "correct",
    data: [
      0.5823961496353149, 0.4197414815425873, -0.251298189163208,
      0.5218386650085449, 0.6250471472740173, 0.0622299425303936,
      0.6071039438247681, 0.6671353578567505, -0.3041251301765442,
      0.558299720287323, 0.8467657566070557, -0.008400342427194118,
    ],
  },
  {
    label: "correct",
    data: [
      0.6344419717788696, 0.44228166341781616, 0.14858770370483398,
      0.5225455164909363, 0.6923217177391052, 0.12167588621377945,
      0.6446365118026733, 0.7484446167945862, 0.15232625603675842,
      0.5415497422218323, 0.7841905355453491, 0.3821719288825989,
    ],
  },
  {
    label: "correct",
    data: [
      0.6162334084510803, 0.46213215589523315, 0.1950642615556717,
      0.5204623937606812, 0.7062157988548279, 0.12026578187942505,
      0.6451851725578308, 0.7066031694412231, 0.027441734448075294,
      0.5143960118293762, 0.7739800214767456, 0.11866394430398941,
    ],
  },
  {
    label: "correct",
    data: [
      0.6092759370803833, 0.5308911204338074, 0.19473901391029358,
      0.5191247463226318, 0.7642109990119934, 0.10857665538787842,
      0.6621376276016235, 0.741265594959259, 0.09874521195888519,
      0.5295652151107788, 0.7929859161376953, 0.1310984194278717,
    ],
  },
  {
    label: "wrong",
    data: [
      0.5009856224060059, 0.1963045746088028, -0.3000021278858185,
      0.6154763698577881, 0.45728549361228943, -0.10975460708141327,
      0.5144512057304382, 0.6461913585662842, -0.3516213595867157,
      0.5448508858680725, 0.920282781124115, -0.2594333589076996,
    ],
  },
  {
    label: "wrong",
    data: [
      0.507708728313446, 0.2524280846118927, -0.3148042857646942,
      0.6114462614059448, 0.510863721370697, -0.10633828490972519,
      0.4730057716369629, 0.6577562093734741, -0.3785807192325592,
      0.5427957773208618, 0.9295599460601807, -0.2830565571784973,
    ],
  },
  {
    label: "wrong",
    data: [
      0.5005887150764465, 0.293002724647522, -0.3353000283241272,
      0.5533303618431091, 0.6110376715660095, -0.11929035186767578,
      0.4168131351470947, 0.7431586980819702, -0.3453647494316101,
      0.5272514820098877, 0.9305972456932068, -0.14323210716247559,
    ],
  },
  {
    label: "wrong",
    data: [
      0.5951800346374512, 0.19606547057628632, -0.5690230131149292,
      0.5125941634178162, 0.4160121977329254, 0.0424150712788105,
      0.5015496015548706, 0.6208450794219971, -0.11182010173797607,
      0.5201789140701294, 0.8741918802261353, 0.139846533536911,
    ],
  },
  {
    label: "wrong",
    data: [
      0.5814173221588135, 0.08120317757129669, -0.1998225450515747,
      0.5546514391899109, 0.38731950521469116, 0.020017584785819054,
      0.5533924102783203, 0.6303601861000061, -0.037986502051353455,
      0.545814037322998, 0.8740108609199524, 0.07774253934621811,
    ],
  },
  {
    label: "wrong",
    data: [
      0.6031770706176758, 0.09182531386613846, -0.2602227032184601,
      0.5529544949531555, 0.3972763419151306, 0.02360517904162407,
      0.5535610318183899, 0.6283237338066101, 0.030669311061501503,
      0.5492910146713257, 0.859466552734375, 0.21844801306724548,
    ],
  },
  {
    label: "wrong",
    data: [
      0.6060267090797424, 0.10608632862567902, -0.19387701153755188,
      0.548836350440979, 0.4035799205303192, 0.03155461698770523,
      0.5500744581222534, 0.6316697597503662, 0.005803435109555721,
      0.5450330376625061, 0.8656409978866577, 0.11462541669607162,
    ],
  },
  {
    label: "wrong",
    data: [
      0.6108301877975464, 0.11900287121534348, -0.26598963141441345,
      0.5459704399108887, 0.40739232301712036, 0.02952183410525322,
      0.5466136336326599, 0.625594437122345, -0.02396179735660553,
      0.5455695390701294, 0.8603538274765015, 0.1427983045578003,
    ],
  },
  {
    label: "wrong",
    data: [
      0.6111801266670227, 0.1407085806131363, -0.33835190534591675,
      0.5402228236198425, 0.410098135471344, 0.027896594256162643,
      0.5451272130012512, 0.6231352686882019, -0.06448736786842346,
      0.5464398264884949, 0.8584268689155579, 0.11974520981311798,
    ],
  },
  {
    label: "wrong",
    data: [
      0.5855440497398376, 0.09069524705410004, -0.23783692717552185,
      0.5492785573005676, 0.3881254494190216, 0.014446835033595562,
      0.5443251729011536, 0.6254681944847107, -0.12420177459716797,
      0.5470595955848694, 0.8623754978179932, 0.05042694881558418,
    ],
  },
  {
    label: "correct",
    data: [
      0.612605631351471, 0.4617859125137329, -0.007115026470273733,
      0.5458208322525024, 0.703467071056366, 0.058036547154188156,
      0.663713812828064, 0.6878252625465393, -0.3383295238018036,
      0.5773756504058838, 0.8763434886932373, -0.1806023269891739,
    ],
  },
  {
    label: "correct",
    data: [
      0.6086892485618591, 0.47575223445892334, -0.01161801628768444,
      0.5451144576072693, 0.7179737687110901, 0.05023152381181717,
      0.6663791537284851, 0.6865674257278442, -0.33053141832351685,
      0.5794991254806519, 0.8727891445159912, -0.28211647272109985,
    ],
  },
  {
    label: "correct",
    data: [
      0.6084031462669373, 0.4828803241252899, -0.015234504826366901,
      0.5480349063873291, 0.7295934557914734, 0.0469960942864418,
      0.6577364802360535, 0.688789427280426, -0.2950060963630676,
      0.5806553363800049, 0.8714358806610107, -0.20299175381660461,
    ],
  },
  {
    label: "correct",
    data: [
      0.608120322227478, 0.4876866638660431, -0.0004713159578386694,
      0.5468671321868896, 0.7387332320213318, 0.052694469690322876,
      0.6562796235084534, 0.6924521923065186, -0.27598828077316284,
      0.5812517404556274, 0.8725908994674683, -0.19008032977581024,
    ],
  },
  {
    label: "correct",
    data: [
      0.6090563535690308, 0.43689507246017456, -0.11518897861242294,
      0.544111430644989, 0.6763181686401367, 0.058733295649290085,
      0.6531513333320618, 0.6802724599838257, -0.4027952551841736,
      0.5787023305892944, 0.8709031343460083, -0.15665574371814728,
    ],
  },
  {
    label: "correct",
    data: [
      0.6075005531311035, 0.4066564738750458, -0.21196427941322327,
      0.5422289967536926, 0.6503700017929077, 0.05653706192970276,
      0.6498028039932251, 0.6674266457557678, -0.46350711584091187,
      0.5775540471076965, 0.8769876956939697, -0.12866920232772827,
    ],
  },
  {
    label: "correct",
    data: [
      0.607895016670227, 0.36558395624160767, -0.20757508277893066,
      0.5337604880332947, 0.5974543690681458, 0.0586211159825325,
      0.6306130886077881, 0.6557664275169373, -0.4240788519382477,
      0.5748393535614014, 0.8685132265090942, -0.1157006025314331,
    ],
  },
  {
    label: "correct",
    data: [
      0.6150563359260559, 0.47121745347976685, -0.10768958181142807,
      0.5507586002349854, 0.7153066992759705, 0.056153737008571625,
      0.6593760251998901, 0.7057533264160156, -0.34126460552215576,
      0.5780348181724548, 0.8792262673377991, -0.07457864284515381,
    ],
  },
  {
    label: "correct",
    data: [
      0.6137791275978088, 0.4374457597732544, -0.1736353039741516,
      0.551019549369812, 0.6786601543426514, 0.05839216709136963,
      0.660922110080719, 0.6994593739509583, -0.4166193902492523,
      0.5770435333251953, 0.8768264055252075, -0.09532073885202408,
    ],
  },
  {
    label: "correct",
    data: [
      0.528401792049408, 0.448311984539032, 0.11403763294219971,
      0.4924253523349762, 0.7119570374488831, 0.14748196303844452,
      0.6393746137619019, 0.7285242080688477, 0.16403616964817047,
      0.47262829542160034, 0.8091757893562317, 0.28547146916389465,
    ],
  },
  {
    label: "correct",
    data: [
      0.5377613306045532, 0.4529403746128082, 0.10057276487350464,
      0.5014109015464783, 0.7157960534095764, 0.13711760938167572,
      0.6472090482711792, 0.7167482972145081, 0.07816923409700394,
      0.5039283037185669, 0.8054812550544739, 0.2154356986284256,
    ],
  },
  {
    label: "correct",
    data: [
      0.5500204563140869, 0.4231335520744324, 0.09871964901685715,
      0.4943687319755554, 0.6731131672859192, 0.13574734330177307,
      0.6263654232025146, 0.7028779983520508, 0.13631200790405273,
      0.47763800621032715, 0.7941917777061462, 0.35302841663360596,
    ],
  },
  {
    label: "correct",
    data: [
      0.5473320484161377, 0.41888076066970825, 0.11870257556438446,
      0.48877137899398804, 0.6705358028411865, 0.13719090819358826,
      0.626204252243042, 0.6987926959991455, 0.09798596799373627,
      0.4962690770626068, 0.8191770911216736, 0.28800296783447266,
    ],
  },
  {
    label: "correct",
    data: [
      0.5518920421600342, 0.40946853160858154, 0.11259932816028595,
      0.4851323664188385, 0.6583109498023987, 0.14710202813148499,
      0.6236416697502136, 0.6911138892173767, 0.18240997195243835,
      0.5048097372055054, 0.8184061050415039, 0.3731284439563751,
    ],
  },
  {
    label: "correct",
    data: [
      0.550271213054657, 0.40808460116386414, 0.11670903116464615,
      0.4853286147117615, 0.6609306335449219, 0.14692461490631104,
      0.6184253096580505, 0.6904188394546509, 0.20941221714019775,
      0.492093950510025, 0.8139691948890686, 0.4143281877040863,
    ],
  },
  {
    label: "correct",
    data: [
      0.5512641668319702, 0.4304961860179901, 0.1063297837972641,
      0.48465004563331604, 0.6792376041412354, 0.14496329426765442,
      0.6144831776618958, 0.7006799578666687, 0.19310231506824493,
      0.4778400957584381, 0.8136040568351746, 0.37768828868865967,
    ],
  },
  {
    label: "correct",
    data: [
      0.5441267490386963, 0.43299785256385803, 0.11150582134723663,
      0.48510685563087463, 0.6785866022109985, 0.13975560665130615,
      0.6224231719970703, 0.6895469427108765, 0.14508073031902313,
      0.503576397895813, 0.8131696581840515, 0.33652377128601074,
    ],
  },
  {
    label: "correct",
    data: [
      0.5599135756492615, 0.44311684370040894, 0.12773510813713074,
      0.4908045828342438, 0.6920832395553589, 0.13583555817604065,
      0.6186422109603882, 0.6936593651771545, 0.17436286807060242,
      0.4880979061126709, 0.8052615523338318, 0.3257381319999695,
    ],
  },
];

// 사용할 랜드마크 인덱스 (왼쪽 어깨, 왼쪽 엉덩이, 왼쪽 무릎, 왼쪽 발목)
const SQUAT_LANDMARKS_INDICES = [
  POSE_LANDMARKS.LEFT_SHOULDER, // 11
  POSE_LANDMARKS.LEFT_HIP, // 23
  POSE_LANDMARKS.LEFT_KNEE, // 25
  POSE_LANDMARKS.LEFT_ANKLE, // 27
];

const K_VALUE = 3; // KNN의 K값

function TensorKnn() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const poseRef = useRef(null); // MediaPipe Pose 인스턴스
  const knnClassifierRef = useRef(null); // KNN 분류기 인스턴스
  const [count, setCount] = useState(0);
  const [prevLabel, setPrevLabel] = useState(null); // 이전 자세 라벨 저장
  const prevLabelRef = useRef(null);
  const [prediction, setPrediction] = useState("모델 및 카메라 초기화 중...");
  const [modelReady, setModelReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 1. MediaPipe Pose 및 KNN 분류기 초기화 및 학습
  useEffect(() => {
    async function initializeModels() {
      setPrediction("KNN 분류기 생성 중...");
      knnClassifierRef.current = knnClassifier.create();
      console.log("KNN Classifier created");

      setPrediction("KNN 모델 학습 중...");
      console.log("Training KNN model...");
      const numCorrectExamples = dataset.filter(
        (item) => item.label === "correct"
      ).length;
      const numWrongExamples = dataset.filter(
        (item) => item.label === "wrong"
      ).length;

      if (numCorrectExamples === 0 || numWrongExamples === 0) {
        console.error(
          "데이터셋에 'correct' 또는 'wrong' 레이블의 예제가 충분하지 않습니다."
        );
        setPrediction("오류: 데이터셋 예제 부족");
        setIsLoading(false);
        return;
      }

      dataset.forEach((item) => {
        if (item.data && Array.isArray(item.data) && item.data.length === 12) {
          const tensor = tf.tensor2d([item.data]); // 2D 텐서로 변경 [1, 12]
          knnClassifierRef.current.addExample(tensor, item.label);
        } else {
          console.warn("잘못된 데이터 형식 건너뜀:", item);
        }
      });
      console.log("KNN model trained.");

      if (knnClassifierRef.current.getNumClasses() < 2) {
        console.error(
          "KNN 모델이 2개 미만의 클래스로 학습되었습니다. 데이터셋을 확인하세요."
        );
        setPrediction("오류: KNN 학습 실패 (클래스 부족)");
        setIsLoading(false);
        if (knnClassifierRef.current.getNumClasses() > 0) {
          console.log(
            "Class counts:",
            knnClassifierRef.current.getClassExampleCount()
          );
        }
        return;
      }
      console.log("Num classes:", knnClassifierRef.current.getNumClasses());
      console.log(
        "Class counts:",
        knnClassifierRef.current.getClassExampleCount()
      );

      setPrediction("MediaPipe Pose 모델 로딩 중...");
      const pose = new Pose({
        locateFile: (file) =>
          `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
      });
      pose.setOptions({
        modelComplexity: 1,
        smoothLandmarks: true,
        enableSegmentation: false, // 세그멘테이션 비활성화 (성능 향상)
        smoothSegmentation: false,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });
      pose.onResults(onResults); // 결과 콜백 설정
      poseRef.current = pose;
      console.log("MediaPipe Pose initialized");

      setModelReady(true);
      setIsLoading(false);
      setPrediction("준비 완료. 자세를 취해주세요.");
    }

    initializeModels();

    return () => {
      // 컴포넌트 언마운트 시 정리
      if (poseRef.current) {
        poseRef.current
          .close()
          .catch((err) => console.error("Error closing pose:", err));
      }
      if (knnClassifierRef.current) {
        knnClassifierRef.current.clearAllClasses();
        // knnClassifierRef.current.dispose(); // dispose 메서드는 knn-classifier에 없음
      }
      tf.disposeVariables(); // TensorFlow.js 변수 정리
      console.log("Cleanup complete");
    };
  }, []); // 빈 배열: 컴포넌트 마운트 시 1회 실행

  // 2. 모델 준비 완료 후 카메라 설정
  useEffect(() => {
    if (modelReady && webcamRef.current && webcamRef.current.video) {
      const videoElement = webcamRef.current?.video;
      if (!videoElement) return;
      // videoElement.onloadedmetadata가 호출된 후에 camera를 시작해야 올바른 width, height를 가짐
      videoElement.onloadedmetadata = () => {
        if (webcamRef.current && webcamRef.current.video) {
          // 다시 한번 확인
          const camera = new Camera(videoElement, {
            onFrame: async () => {
              if (videoElement.readyState === 4) {
                // 비디오가 현재 프레임 데이터를 가지고 있는지 확인
                await poseRef.current.send({ image: videoElement });
              }
            },
            width: videoElement.videoWidth, // 실제 비디오 너비 사용
            height: videoElement.videoHeight, // 실제 비디오 높이 사용
          });
          camera
            .start()
            .then(() => console.log("Camera started"))
            .catch((err) => console.error("Camera start error:", err));

          // 클린업 함수에서 camera.stop() 호출
          return () => {
            camera
              .stop()
              .then(() => console.log("Camera stopped"))
              .catch((err) => console.error("Camera stop error:", err));
          };
        }
      };
      // 비디오가 이미 로드된 경우 대비
      if (videoElement.readyState >= 2) {
        // HAVE_CURRENT_DATA 이상
        videoElement.onloadedmetadata();
      }
    }
  }, [modelReady]);

  // 3. MediaPipe Pose 결과 처리 및 KNN 예측
  const onResults = async (results) => {
    const canvasElement = canvasRef.current;
    if (
      !canvasElement ||
      !knnClassifierRef.current ||
      knnClassifierRef.current.getNumClasses() < 2
    ) {
      if (canvasElement) {
        // 캔버스가 있으면 지우기
        const canvasCtx = canvasElement.getContext("2d");
        canvasCtx.save();
        canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
        canvasCtx.restore();
      }
      return;
    }

    const canvasCtx = canvasElement.getContext("2d");
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

    // react-webcam의 mirrored=true일 경우 캔버스도 좌우반전시켜서 올바르게 표시
    if (webcamRef.current && webcamRef.current.props.mirrored) {
      canvasCtx.translate(canvasElement.width, 0);
      canvasCtx.scale(-1, 1);
    }

    if (results.poseLandmarks) {
      // 모든 랜드마크 그리기 (시각화용)
      drawConnectors(canvasCtx, results.poseLandmarks, POSE_CONNECTIONS, {
        color: "#00FF00",
        lineWidth: 3,
      });
      drawLandmarks(canvasCtx, results.poseLandmarks, {
        color: "#FF0000",
        lineWidth: 2,
        radius: 3,
      });

      // KNN 입력으로 사용할 특정 랜드마크 추출
      const currentPoseFeatures = [];
      let allRequiredLandmarksVisible = true;
      SQUAT_LANDMARKS_INDICES.forEach((index) => {
        const landmark = results.poseLandmarks[index];
        // landmark.visibility가 0.5 이상일 때 유효한 것으로 간주
        if (
          landmark &&
          (landmark.visibility === undefined || landmark.visibility > 0.5)
        ) {
          currentPoseFeatures.push(landmark.x, landmark.y, landmark.z);
        } else {
          allRequiredLandmarksVisible = false;
        }
      });

      if (
        allRequiredLandmarksVisible &&
        currentPoseFeatures.length === SQUAT_LANDMARKS_INDICES.length * 3
      ) {
        const inputTensor = tf.tensor2d([currentPoseFeatures]); // 2D 텐서 [1, 12]
        try {
          // KNN 예측 (K값 설정)
          const knnPrediction = await knnClassifierRef.current.predictClass(
            inputTensor,
            K_VALUE
          );
          setPrediction(
            `자세: ${knnPrediction.label} (정확도: ${knnPrediction.confidences[
              knnPrediction.label
            ].toFixed(2)})`
          );

          const currentLabel = knnPrediction.label;
          const prevLabel = prevLabelRef.current;

          if (currentLabel === "correct" && prevLabel === "wrong") {
            setCount((prev) => prev + 1);
          }

          prevLabelRef.current = currentLabel;
        } catch (error) {
          console.error("KNN 예측 오류:", error);
          setPrediction("자세 예측 중 오류 발생");
        } finally {
          tf.dispose(inputTensor); // 텐서 메모리 해제
        }
      } else if (
        results.poseLandmarks.length > 0 &&
        !allRequiredLandmarksVisible
      ) {
        setPrediction("주요 랜드마크가 모두 보이지 않습니다.");
      } else {
        setPrediction("자세를 감지할 수 없습니다.");
      }
    } else {
      setPrediction("자세 감지 중... (랜드마크 없음)");
    }
    canvasCtx.restore(); // 캔버스 상태 복원 (좌우반전 등)
  };

  const webcamWidth = 640;
  const webcamHeight = 480;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        fontFamily: "sans-serif",
      }}
    >
      <h1>실시간 스쿼트 자세 측정 (MediaPipe + TensorFlow.js KNN)</h1>
      <h1>{count}</h1>
      <div
        style={{
          position: "relative",
          width: `${webcamWidth}px`,
          height: `${webcamHeight}px`,
          border: "1px solid black",
        }}
      >
        {isLoading && (
          <div
            style={{
              position: "absolute",
              top: "40%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              color: "white",
              background: "rgba(0,0,0,0.7)",
              padding: "20px",
              borderRadius: "10px",
              zIndex: 12,
            }}
          >
            <p>{prediction}</p>
            <p>모델과 카메라를 로드하고 있습니다. 잠시 기다려주세요...</p>
          </div>
        )}
        <Webcam
          ref={webcamRef}
          audio={false}
          width={webcamWidth}
          height={webcamHeight}
          mirrored={true} // 사용자에게 거울처럼 보이도록 설정 (일반적)
          videoConstraints={{
            width: webcamWidth,
            height: webcamHeight,
            facingMode: "user",
          }}
          style={{
            position: "absolute",
            zIndex: 8, // 캔버스보다 아래
          }}
          onUserMediaError={(error) => {
            console.error("Webcam error:", error);
            setPrediction("웹캠을 사용할 수 없습니다. 권한을 확인해주세요.");
            setIsLoading(false);
          }}
        />
        <canvas
          ref={canvasRef}
          width={webcamWidth}
          height={webcamHeight}
          style={{
            position: "absolute",
            zIndex: 9, // 웹캠 위에 오버레이
          }}
        />
        {!isLoading && (
          <div
            style={{
              position: "absolute",
              bottom: "10px",
              left: "10px",
              backgroundColor: "rgba(0,0,0,0.7)",
              color: "white",
              padding: "10px",
              borderRadius: "5px",
              zIndex: 10, // 최상단
              fontSize: "16px",
            }}
          >
            {prediction}
          </div>
        )}
      </div>
      <div
        style={{
          marginTop: "20px",
          padding: "10px",
          border: "1px solid #ccc",
          borderRadius: "5px",
          backgroundColor: "#f9f9f9",
        }}
      >
        <p>
          <strong>사용된 랜드마크 (왼쪽 기준):</strong> 어깨, 엉덩이, 무릎, 발목
        </p>
        <p>
          <strong>KNN 모델 K값:</strong> {K_VALUE}
        </p>
        <p>
          <strong>참고:</strong> 정확한 측정을 위해 카메라 정면에서 전신이 잘
          보이도록 자세를 취해주세요.
        </p>
      </div>
    </div>
  );
}

export default TensorKnn;
