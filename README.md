# VR11KLE - Human Body Pose Estimation and Body Gestures Classification

This repository contains 3 main folders used for: 
1. Collecting annotated body keypoints from Posenet
2. Training and deploying static gestures classifer on a local web server
3. Training and deploying dynamic gestures classifer on a local web server

## PART 1:  Data Collection
1. [Run](#running-a-local-server) `Data Collection from Posenet/` on a local server, which sets up Posenet and captures body keypoints from the web camera
2. Pressing any keys other than `s` will act as a label for the current keypoints captured. The current limit to capture a keypoints is set to 60 seconds. i.e on pressing any key, say `j`, will collect the body keypoints for 60 seconds and adds a label `j` for all those keypoints. This can be repeated many times depending on the number of classes needed. And upon pressing `s` would save those keypoints along with corresponding labels into a JSON file 
3. Convert the JSON file into CSV using tools such as http://convertcsv.com/json-to-csv.htm and rename the headers to `x1,y1,x2,y2,x3,y3,x4,y4,x5,y5,x6,y6,x7,y7,x8,y8,x9,y9,x10,y10,x11,y11,x12,y12,x13,y13,x14,y14,x15,y15,x16,y16,x17,y17,label`

## PART 2: Static Gesture - Train and Deploy
### Training a Static Gesture Classifier
1. Go to `Static Gesture/Train Model/`
2. Place the training and testing dataset as `Static gesture train.csv` and `Static gesture test.csv` respectively, either using the dataset generated from part 1 **OR** use the dataset which is already present in the folder.
3. Run the notebook `PRISM_STATIC_GESTURE.ipynb` (preferrably on Google Colab). The notebook generates a zip file containg the original keras .h5 model along with the files required for Tensorflow JS - `group1-shard1of1.bin` and `model.json`

### Deploying Static Gesture Classifier
1. Download the zip file from notebook (as indicated in the above steps) and extract it to `Static Gesture/Deploy/Model` (At present, the folder already contains the model, which we had trained earlier and is ready to be deployed) 
2. [Run](#running-a-local-server) the local web server on `Static Gesture/Deploy/` 


## PART 3: Dynamic Gesture - Train and Deploy
### Training a Dynamic Gesture Classifier
1. Go to `Dynamic Gesture/Train Model/`
2. Place the training and testing dataset as `Dynamic gesture train.csv` and `Dynamic gesture test.csv` respectively, either using the dataset generated from part 1 **OR** use the dataset which is already present in the folder.
3. Run the notebook `PRISM_DYNAMIC_GESTURE.ipynb` (preferrably on Google Colab). The notebook contains 2 different models - LSTM and CNN LSTM. Run the cells on the preferred model. The notebook generates a zip file containg the original keras .h5 model along with the files required for Tensorflow JS - `group1-shard1of1.bin` and `model.json`

### Deploying Dynamic Gesture Classifier
1. Download the zip file from notebook (as indicated in the above steps) and extract it to `Dynamic Gesture/Deploy/LSTM Model` if the zip file contains the LSTM model otherwise extract it to `Dynamic Gesture/Deploy/CNN-LSTM Model` for CNN LSTM model. (At present, both the folders already contain the respective model, which we had trained earlier and is ready to be deployed) 
2. Before running the server, change the 20th line in `Dynamic Gesture/Deploy/index.html` to `<script src="CNN-LSTM Model/sketch-cnn-lstm.js"></script>` for deploying the CNN LSTM Model otherwise change it to `<script src="LSTM Model/sketch.js"></script>` to deploy LSTM Model.
3. [Run](#running-a-local-server) the local web server on `Dynamic Gesture/Deploy/` 


## Running a local server
1. To run a server, it is recommned to use `http-server` command on linux. For more - https://www.npmjs.com/package/http-server
2. The contents will be hosted on  `http://127.0.0.1:8080/`

Make sure to refresh the web page by holding down the shift button. This clears the cache of the previous script and loads as a new file
