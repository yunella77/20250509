// Hand Pose Detection with ml5.js
// https://thecodingtrain.com/tracks/ml5js-beginners-guide/ml5/hand-pose

let video;
let handPose;
let hands = [];
let circleX, circleY; // 圓的座標
let circleDiameter = 100; // 圓的直徑
let previousX, previousY; // 儲存圓的上一個位置
let leftPreviousX, leftPreviousY; // 儲存左手的上一個位置
let rightPreviousX, rightPreviousY; // 儲存右手的上一個位置

function preload() {
  // Initialize HandPose model with flipped video input
  handPose = ml5.handPose({ flipped: true });
}

function mousePressed() {
  console.log(hands);
}

function gotHands(results) {
  hands = results;
}

function setup() {
  createCanvas(640, 480); // 產生一個畫布，640*480
  video = createCapture(VIDEO, { flipped: true });
  video.hide();

  // Start detecting hands
  handPose.detectStart(video, gotHands);

  // 初始化圓的位置
  circleX = width / 2;
  circleY = height / 2;

  // 初始化上一個位置
  previousX = circleX;
  previousY = circleY;
  leftPreviousX = null;
  leftPreviousY = null;
  rightPreviousX = null;
  rightPreviousY = null;
}

function draw() {
  image(video, 0, 0);

  // 繪製圓
  fill(0, 255, 0);
  noStroke(); // 確保圓沒有邊框
  circle(circleX, circleY, circleDiameter);

  // 確保至少有一隻手被偵測到
  if (hands.length > 0) {
    for (let hand of hands) {
      if (hand.confidence > 0.1) {
        // 繪製手部關鍵點
        for (let i = 0; i < hand.keypoints.length; i++) {
          let keypoint = hand.keypoints[i];

          // 根據左右手設定顏色
          if (hand.handedness == "Left") {
            fill(255, 0, 255);
          } else {
            fill(255, 255, 0);
          }

          noStroke(); // 確保手部關鍵點沒有邊框
          circle(keypoint.x, keypoint.y, 16);
        }

        // 檢查食指（keypoint 8）和大拇指（keypoint 4）是否同時碰觸圓
        let indexFinger = hand.keypoints[8];
        let thumb = hand.keypoints[4];
        let dIndex = dist(indexFinger.x, indexFinger.y, circleX, circleY);
        let dThumb = dist(thumb.x, thumb.y, circleX, circleY);

        if (dIndex < circleDiameter / 2 && dThumb < circleDiameter / 2) {
          // 如果食指和大拇指同時碰觸到圓，讓圓跟隨手指移動
          circleX = (indexFinger.x + thumb.x) / 2; // 圓心移動到兩點的中間
          circleY = (indexFinger.y + thumb.y) / 2;

          // 畫出圓心的軌跡
          if (hand.handedness == "Left") {
            stroke(0, 255, 0); // 綠色線條（左手）
            strokeWeight(2);
            if (leftPreviousX !== null && leftPreviousY !== null) {
              line(leftPreviousX, leftPreviousY, circleX, circleY);
            }
            leftPreviousX = circleX;
            leftPreviousY = circleY;
          } else {
            stroke(255, 0, 0); // 紅色線條（右手）
            strokeWeight(2);
            if (rightPreviousX !== null && rightPreviousY !== null) {
              line(rightPreviousX, rightPreviousY, circleX, circleY);
            }
            rightPreviousX = circleX;
            rightPreviousY = circleY;
          }

          // 更新上一個位置
          previousX = circleX;
          previousY = circleY;
        }
      }
    }
  }
}
