let video;
let poseNet;
let pose;
let skeleton;
let brain;
let inputs = [];
let cur = [];
let poses = [];
let nums = [];
let n_steps = 4;
let n_length = 32;
let fill_nums_done = false;
let classifyPose_done = false;
let completed = false;
let paused = false;
let broke = false;
let res = "";


async function keyPressed() {
  if (key == 'p') {
    paused = !paused;
  }
  if (key == 'b'){
    broke = true;
  }
}

function delay(time) {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, time);
  });
}

async function preload(){
  brain = await tf.loadLayersModel('CNN-LSTM Model/model.json');
        
}

function normalized(cur){
  let x1 = cur[10];
  let y1 = cur[11];
  let x2 = cur[12];
  let y2 = cur[13];

  var a = x1 - x2;
  var b = y1 - y2;

  var shoulderDistance = Math.sqrt( a*a + b*b );

  var noseX = cur[0];
  var noseY = cur[1];

  for(let i = 0; i + 1 < cur.length; i+=2){
    cur[i] = (cur[i] - noseX) / shoulderDistance;
    cur[i + 1] = (cur[i + 1] - noseY) / shoulderDistance;
  }

  cur.shift();
  cur.shift(); // remove first 2 elements i.e coordinates of nose keypoint

  return cur;
}

async function fill_nums(){
    while(nums.length < n_length){
      await new Promise(next =>{
          cur = [];
          classifyPose();

          async function finish() {
            await delay(20);
            if (classifyPose_done) {
              cur = cur.slice(0, 18);
              data = normalized(cur);
              nums.push(data);
              classifyPose_done = false;
              
              next();

            } else {
              finish(); //wait
            }
          }

          finish();
      });
    }

  fill_nums_done = true;
}

async function do_task(){
  while(inputs.length < n_steps){
    await new Promise(next => {
      nums = []; 
      fill_nums();

      async function fill_inputs(){
        if(nums.length == n_length && fill_nums_done){
          inputs.push(nums);
          next();
        }
        else{ //wait
          await delay(5);
          fill_inputs();
        }
      }

      fill_inputs();
    });
  }

completed = true;
}


async function setup() {

  createCanvas(640, 480);
  video = createCapture(VIDEO);
  video.hide();
  poseNet = ml5.poseNet(video, modelLoaded);
  poseNet.on('pose', function(results) {
    poses = results;
    if (poses.length > 0) {
      pose = poses[0].pose;
      skeleton = poses[0].skeleton;
  }
  });

  while(1){ 
    await new Promise(next => {
      inputs.shift(); // remove prevoius poses in the inputs
      
      do_task(); // add the current poses to the inputs

      async function start(){
        if(inputs.length == n_steps && completed){

          var start_time = window.performance.now();
          let r = await brain.predict(tf.tensor([inputs]));
          var end_time = window.performance.now();

          console.log(`Execution time: ${end_time - start_time} ms`);
          

          r.data().then(function(label){ 
            if(label[0] > 0.5){
            res = "jumping\n"         //+ label[0].toFixed(2);     // uncomment to print accuracy along with labels
            }else if(label[1] > 0.90){
              res = "left waving\n"   //+ label[1].toFixed(2);
            }else if(label[3] > 0.90){
              res = "right waving\n"  //+ label[3].toFixed(2);
            }else{
              res = "neutral";
            }
            
          });

          completed = false;
          next();
          
        }else{

          await delay(25);
          start();
        }
    }


    async function check(){
      if(paused){
        await delay(1000);
        console.log("waiting");
        check();
      }else if(broke){
        exit();
      }else{
        start();
      }
    }

    check();
    });

  }

}


async function classifyPose() {  
  if(pose){

    for (let i = 0; i < pose.keypoints.length; i++) {
      let x = pose.keypoints[i].position.x;
      let y = pose.keypoints[i].position.y;
      cur.push(x);
      cur.push(y);
    }
    classifyPose_done = true;

  } else {
    console.log('no pose detected, waiting');
    await delay(100);
    classifyPose();
  }

}


function modelLoaded() {
  console.log('poseNet ready');
}


function draw() {
  push();
  translate(video.width, 0);
  scale(-1, 1);
  image(video, 0, 0, width, height);
  if(poses.length > 0){
    drawKeypoints();
    drawSkeleton();
    pop();
    drawResult();
  }
}


function drawKeypoints()  {
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

function drawResult(){
  fill(255, 0, 255);
  noStroke();
  textSize(100);
  textAlign(CENTER, CENTER);
  text(res, width / 2, height / 2);
  
}
