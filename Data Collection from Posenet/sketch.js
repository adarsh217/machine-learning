let video;
let poseNet;
let pose;
let skeleton;
let brain;
let targetLabel;
let poses = [];
let inputs = [];
let state = 'waiting';


function delay(time) {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, time);
  });
}

function preload() {
  let options = {
    // inputs: 34,
    // outputs: 2,
    task: 'classification',
    debug: true
  }
  brain = ml5.neuralNetwork(options);
}

async function keyPressed() {
  if (key == 's') {
    brain.saveData();
  } else {
    targetLabel = key;
    console.log(targetLabel);

    await delay(2000);
    console.log('collecting');
    state = 'collecting';

    await delay(60000);
    console.log('not collecting');
    state = 'waiting';
  }
}


function setup() {
  createCanvas(640, 480);
  video = createCapture(VIDEO);
  video.hide();

  poseNet = ml5.poseNet(video, modelReady);
  poseNet.on('pose', function(results) {
    poses = results;

    if (poses.length > 0) {
      pose = poses[0].pose;
      skeleton = poses[0].skeleton;

      if (state == 'collecting') {
        let cur = [];
        for (let i = 0; i < pose.keypoints.length; i++) {
          let x = pose.keypoints[i].position.x;
          let y = pose.keypoints[i].position.y;
          cur.push(x);
          cur.push(y);
        }

        let target = [targetLabel];
        brain.addData(cur, target);

      }
      
    }

  });

}

function dataReady() {
  console.log("Loaded Data!");
}

function modelReady() {
  console.log('Model Loaded');
}

function draw() {
  translate(video.width, 0);
  scale(-1, 1);
  image(video, 0, 0, width, height);
  if (poses.length > 0) {
    drawKeypoints();
    drawSkeleton();
  }
}


function drawKeypoints() {
  for (let j = 0; j < pose.keypoints.length; j++) {
    let keypoint = pose.keypoints[j];
    if (keypoint.score > 0.2) {
      fill(255, 0, 0);
      noStroke();
      ellipse(keypoint.position.x, keypoint.position.y, 10, 10);
    }
  }
}

function drawSkeleton() {
  for (let j = 0; j < skeleton.length; j++) {
    let partA = skeleton[j][0];
    let partB = skeleton[j][1];
    stroke(255, 0, 0);
    line(partA.position.x, partA.position.y, partB.position.x, partB.position.y);
  }
}