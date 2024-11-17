// Define the questions and their structure
const questions = [
    {
        header: "Skin Care Information",
        questions: [
            { text: "What is your skin type?", options: ["Dry", "Oily", "Combination", "Normal", "I'm not sure"] },
            { text: "What is your skin tone?", options: ["Fair", "Medium", "Tan", "Deep", "Ebony", "Olive", "Dark", "Light", "I'm not sure"], isColorQuestion: true },
            { text: "Do you have any specific undertone?", options: ["Cool", "Warm", "Neutral", "I'm not sure"] },
            { text: "Do you have sensitive skin?", options: ["Yes", "No", "I'm not sure"] },
            { text: "Do you use facial masks regularly?", options: ["Yes", "No", "Occasionally", "I'm not sure"] },
            { text: "Do you suffer from redness or irritation?", options: ["Yes", "No", "Sometimes", "I'm not sure"] }
        ]
    },
    {
        header: "Makeup Preferences",
        questions: [
            { text: "What is your typical makeup look?", options: ["Natural", "Glamorous", "Bold", "Minimal", "I'm not sure"] },
            { text: "What type of makeup products do you prefer?", options: ["Natural/Organic", "Fragrance-Free", "Cruelty-Free", "Luxury Brands", "Drugstore Brands", "I'm not sure"] },
            { text: "What is your preferred lip color?", options: ["Nudes", "Reds", "Pinks", "Purples", "Corals", "Browns", "Neutrals", "Brights", "I'm not sure"], isColorQuestion: true },
            { text: "What type of makeup finish do you prefer?", options: ["Matte", "Dewy", "Satin", "No preference", "I'm not sure"] },
            { text: "Do you prefer liquid or powder foundation?", options: ["Liquid", "Powder", "Both", "I'm not sure"] },
            { text: "Do you like to use highlighter?", options: ["Yes", "No", "Sometimes", "I'm not sure"] },
            { text: "What is your occasion for makeup?", options: ["Casual", "Work", "Night Out", "Special Event", "Wedding", "I'm not sure"] }
        ]
    },
    {
        header: "Makeup Usage & Lifestyle",
        questions: [
            { text: "How often do you wear makeup?", options: ["Daily", "Occasionally", "Only for special events", "Rarely"] },
            { text: "Do you need makeup that is long-lasting or sweat-resistant?", options: ["Yes", "No", "I'm not sure"] },
            { text: "Do you have a go-to makeup look for every occasion?", options: ["Yes", "No", "Sometimes", "I'm not sure"] },
            { text: "Do you like makeup that's easy to touch up throughout the day?", options: ["Yes", "No", "I'm not sure"] },
            { text: "Do you prefer matte or glossy lipstick?", options: ["Matte", "Glossy", "No preference", "I'm not sure"] }
        ]
    },
    {
        header: "Skin Concerns & Environment",
        questions: [
            { text: "Do you have any specific skin concerns?", options: ["Acne", "Dark spots", "Wrinkles", "None", "I'm not sure"] },
            { text: "Do you live in a humid or dry climate?", options: ["Humid", "Dry", "Temperate", "I'm not sure"] },
            { text: "Are you prone to any skin allergies (e.g., fragrance, nuts, latex)?", options: ["Yes", "No", "I'm not sure"] },
            { text: "Do you exercise frequently?", options: ["Yes", "No", "Occasionally", "I'm not sure"] },
            { text: "Do you wear sunscreen daily?", options: ["Yes", "No", "Sometimes", "I'm not sure"] },
            { text: "Do you work in an environment with heavy air pollution?", options: ["Yes", "No", "Occasionally", "I'm not sure"] }
        ]
    }
];

// Variables to track progress
let currentQuestionIndex = 0;
let currentSectionIndex = 0;
let answers = [];

// Calculate the total number of questions
const totalQuestions = questions.reduce((total, section) => total + section.questions.length, 0);
let answeredQuestions = 0;

// Populate the current question
function populateQuestion() {
    const questionText = document.getElementById("question-text");
    const optionsContainer = document.getElementById("options");
    const section = questions[currentSectionIndex];
    const question = section.questions[currentQuestionIndex];

    // Update progress bar
    const progressPercentage = (answeredQuestions / totalQuestions) * 100;
    document.getElementById("progress").style.width = `${progressPercentage}%`;

    // Set question text
    questionText.textContent = question.text;
    optionsContainer.innerHTML = ""; // Clear previous options

    // Create option buttons
    question.options.forEach((option) => {
        const optionButton = document.createElement("button");
        optionButton.className = "option";
        optionButton.textContent = option;
        optionButton.onclick = () => {
            answers.push(option);
            answeredQuestions++;
            nextQuestion();
        };
        optionsContainer.appendChild(optionButton);
    });
}

// Navigate to the next question
function nextQuestion() {
    const section = questions[currentSectionIndex];
    if (currentQuestionIndex < section.questions.length - 1) {
        currentQuestionIndex++;
    } else if (currentSectionIndex < questions.length - 1) {
        currentSectionIndex++;
        currentQuestionIndex = 0;
    } else {
        // All questions answered, open camera
        openCamera();
        return;
    }

    populateQuestion();
}

// Navigate to the previous question
function previousQuestion() {
    const section = questions[currentSectionIndex];
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
    } else if (currentSectionIndex > 0) {
        currentSectionIndex--;
        currentQuestionIndex = questions[currentSectionIndex].questions.length - 1;
    }
    populateQuestion();
}

// Open the front-facing camera and integrate face-api.js
async function openCamera() {
    const constraints = {
        video: {
            facingMode: "user" // Ensures the front camera is used
        }
    };

    try {
        // Load face-api.js models
        await loadModels();

        // Get media stream
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        document.body.innerHTML = ""; // Clear the page for the camera

        // Create container for the video feed
        const videoContainer = document.createElement("div");
        videoContainer.style.width = "100%";
        videoContainer.style.height = "50vh"; // Top half of the screen
        videoContainer.style.position = "relative";
        videoContainer.style.overflow = "hidden";
        document.body.appendChild(videoContainer);

        // Create and set up the video element
        const videoElement = document.createElement("video");
        videoElement.srcObject = stream;
        videoElement.autoplay = true;
        videoElement.style.width = "100%";
        videoElement.style.height = "100%";
        videoElement.style.objectFit = "cover";
        videoContainer.appendChild(videoElement);

        // Create and set up the canvas element
        const canvas = document.createElement("canvas");
        canvas.style.position = "absolute";
        canvas.style.top = 0;
        canvas.style.left = 0;
        canvas.style.width = "100%";
        canvas.style.height = "100%";
        videoContainer.appendChild(canvas);

        const displaySize = { width: videoElement.videoWidth, height: videoElement.videoHeight };
        const faceApiCanvas = faceapi.createCanvasFromMedia(videoElement);
        canvas.width = displaySize.width;
        canvas.height = displaySize.height;
        videoContainer.appendChild(faceApiCanvas);

        // Start the face detection loop
        detectFaces(videoElement, faceApiCanvas);
    } catch (err) {
        console.error("Camera access error: ", err);
        alert("Could not access the camera. Please check your device settings.");
    }
}

// Load face-api.js models
async function loadModels() {
    await faceapi.nets.ssdMobilenetv1.loadFromUri("/models");
    await faceapi.nets.faceLandmark68Net.loadFromUri("/models");
    await faceapi.nets.faceRecognitionNet.loadFromUri("/models");
}

// Detect faces in the video stream
async function detectFaces(videoElement, canvas) {
    const displaySize = { width: videoElement.videoWidth, height: videoElement.videoHeight };
    faceapi.matchDimensions(canvas, displaySize);

    setInterval(async () => {
        const detections = await faceapi.detectAllFaces(videoElement).withFaceLandmarks().withFaceDescriptors();
        const resizedDetections = faceapi.resizeResults(detections, displaySize);
        canvas?.clear();
        faceapi.draw.drawDetections(canvas, resizedDetections);
        faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
    }, 100);
}

// Function to display GIFs sequentially at the center of the video feed
function displayGIFs(videoContainer) {
    const gifContainer = document.createElement("div");
    gifContainer.style.position = "absolute";
    gifContainer.style.top = "50%"; // Center vertically within video area
    gifContainer.style.left = "50%"; // Center horizontally
    gifContainer.style.transform = "translate(-50%, -50%)"; // Adjust to ensure proper centering
    gifContainer.style.zIndex = "1000"; // Make sure GIFs are above the video feed
    gifContainer.style.width = "150px"; // Set GIF size
    gifContainer.style.height = "150px";

    videoContainer.appendChild(gifContainer);

    const gifs = ["images/tone23.gif", "images/tone24.gif", "images/tone22.gif"];
    let currentGIFIndex = 0;

    function showNextGIF() {
        gifContainer.style.backgroundImage = `url(${gifs[currentGIFIndex]})`;
        gifContainer.style.backgroundSize = "cover";
        gifContainer.style.backgroundPosition = "center";
        currentGIFIndex = (currentGIFIndex + 1) % gifs.length; // Loop back to the first GIF
        setTimeout(showNextGIF, 30000); // Show each GIF for 30 seconds
    }

    showNextGIF();
}

// Initialize the app
window.onload = () => {
    populateQuestion();
};