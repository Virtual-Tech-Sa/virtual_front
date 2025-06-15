// CameraPage.jsx
import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './CameraPage.module.css';
// Import face-api.js models
import * as faceapi from 'face-api.js';

const CameraPage = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [cameraStarted, setCameraStarted] = useState(false);
  const [stream, setStream] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const [personId, setPersonId] = useState('');
  const navigate = useNavigate();
  const [modelsLoaded, setModelsLoaded] = useState(false);

  // Load face-api models
  useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = '/models/';
      try {
        console.log("Loading face-api.js models...");
        await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
        await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
        await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
        if (!faceapi.nets.tinyFaceDetector.params) {
          console.warn("Model params not loaded yet");
        }
        console.log("✅ All face-api.js models loaded successfully.");
        setModelsLoaded(true);
      } catch (error) {
        console.error("❌ Failed to load face-api.js models:", error);
        alert("Face recognition models failed to load. Please refresh and try again.");
      }
    };
    loadModels();
  }, []);

  // Get person ID from localStorage
  useEffect(() => {
    const savedData = JSON.parse(localStorage.getItem('applicationFormData')) || {};
    const registrationData = localStorage.getItem(`applicationData_${localStorage.getItem("currentUserEmail")}`);
    if (registrationData) {
      const userData = JSON.parse(registrationData);
      setPersonId(userData.PersonId || '');
    } else if (savedData.PersonId) {
      setPersonId(savedData.PersonId);
    }
  }, []);

  // Start camera
  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = mediaStream;
      setStream(mediaStream);
      setCameraStarted(true);
    } catch (err) {
      alert('Could not access webcam. Please allow permissions.');
    }
  };

  // Capture image
  const captureImage = () => {
    const context = canvasRef.current.getContext('2d');
    context.drawImage(videoRef.current, 0, 0, 640, 480);
    const dataURL = canvasRef.current.toDataURL('image/jpeg');
    setCapturedImage(dataURL);
    stopCamera();
  };

  // Stop camera
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setCameraStarted(false);
    }
  };

  // Retake photo
  const retakePhoto = () => {
    setCapturedImage(null);
    startCamera();
  };

  // Convert base64 to blob
  function dataURLtoBlob(dataURL) {
    const arr = dataURL.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) u8arr[n] = bstr.charCodeAt(n);
    return new Blob([u8arr], { type: mime });
  }

  // Save image to server if verified
  const saveImageToServer = async () => {
    if (!verificationResult?.isMatch) {
      alert('You must verify your identity before saving.');
      return;
    }
    try {
      const formData = new FormData();
      const blob = dataURLtoBlob(capturedImage);
      formData.append('photo', blob, 'profile.jpg');
      const response = await axios.post('http://localhost:5265/api/Person/upload-photo', formData);
      const { filePath } = response.data;

      const savedData = JSON.parse(localStorage.getItem('applicationFormData')) || {};
      savedData.ProfilePicture = filePath;
      localStorage.setItem('applicationFormData', JSON.stringify(savedData));

      const userEmail = localStorage.getItem('currentUserEmail');
      localStorage.setItem('profilePictureBase64', capturedImage);
      localStorage.setItem(`verifiedProfilePic_${userEmail}`, capturedImage);
      localStorage.removeItem(`generatedID_${userEmail}`);

      console.log('✅ Verified photo saved successfully for ID generation');
      navigate('/apply');
    } catch (error) {
      console.error('Error uploading photo:', error);
      alert('Failed to upload photo.');
    }
  };

  // Download file as image
  function loadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }

  // Manual Cosine Distance Calculator
  function computeCosineDistance(descriptor1, descriptor2) {
    let dotProduct = 0;
    let d1SquareSum = 0;
    let d2SquareSum = 0;
    for (let i = 0; i < descriptor1.length; i++) {
      dotProduct += descriptor1[i] * descriptor2[i];
      d1SquareSum += descriptor1[i] * descriptor1[i];
      d2SquareSum += descriptor2[i] * descriptor2[i];
    }
    const magnitude = Math.sqrt(d1SquareSum) * Math.sqrt(d2SquareSum);
    return magnitude === 0 ? 0 : 1 - dotProduct / magnitude;
  }

  // Verify face match
  const verifyFaceMatch = async () => {
    if (!modelsLoaded) {
      alert("Face recognition models are still loading. Please wait a moment.");
      return;
    }
    if (!capturedImage || !personId) {
      alert('Please capture an image and ensure Person ID is available');
      return;
    }
    setIsVerifying(true);
    setVerificationResult(null);
    try {
      const existingPhotoResponse = await fetchExistingPhoto(personId);
      if (!existingPhotoResponse) {
        throw new Error("No existing photo found for this person ID.");
      }

      const referenceImg = await loadImage(existingPhotoResponse);
      const currentImg = await loadImage(capturedImage);

      const referenceDescriptor = await getFaceDescriptor(referenceImg);
      const currentDescriptor = await getFaceDescriptor(currentImg);

      if (!referenceDescriptor) {
        alert("Could not detect face in reference image. Please ensure it contains a clear front-facing face.");
        setVerificationResult({ isMatch: false, confidence: 0, distance: 1 });
        setIsVerifying(false);
        return;
      }
      if (!currentDescriptor) {
        alert("Could not detect face in captured image. Please retake the photo with better lighting and alignment.");
        setVerificationResult({ isMatch: false, confidence: 0, distance: 1 });
        setIsVerifying(false);
        return;
      }

      const distance = computeCosineDistance(referenceDescriptor, currentDescriptor);
      const confidence = Math.max(0, 1 - distance);
      const isMatch = confidence >= 0.95;

      setVerificationResult({
        isMatch,
        confidence,
        distance
      });

      if (isMatch) {
        alert(`✅ Identity verified with high confidence: ${(confidence * 100).toFixed(1)}%`);
      } else {
        alert(`❌ Identity verification failed. Confidence: ${(confidence * 100).toFixed(1)}% (needs at least 95%). Please retake with better lighting and alignment.`);
      }
    } catch (error) {
      console.error("❌ Face verification failed:", error.message);
      setVerificationResult({
        isMatch: false,
        confidence: 0,
        error: error.message
      });
      alert(`Face verification failed: ${error.message}`);
    } finally {
      setIsVerifying(false);
    }
  };

  // Fetch existing child photo from backend using childIdentityNumber
  const fetchExistingPhoto = async (personId) => {
    if (!personId) {
      console.warn("No person ID provided for fetching photo.");
      return null;
    }
    try {
      const response = await axios.get(`http://localhost:5265/api/Application/child/${personId}/photo`, {
        responseType: 'arraybuffer'
      });

      const base64Photo = btoa(
        new Uint8Array(response.data).reduce((data, byte) => data + String.fromCharCode(byte), '')
      );
      return `data:image/jpeg;base64,${base64Photo}`;
    } catch (err) {
      console.error("Error fetching existing photo:", err.message);
      return null;
    }
  };

  // Helper: extract face descriptor
  const getFaceDescriptor = async (img) => {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      const maxWidth = 640;
      const scale = Math.min(maxWidth / img.width, maxWidth / img.height);
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      const detectionOptions = [
        new faceapi.TinyFaceDetectorOptions({ inputSize: 512, scoreThreshold: 0.3 }),
        new faceapi.TinyFaceDetectorOptions({ inputSize: 416, scoreThreshold: 0.4 }),
        new faceapi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.5 }),
        new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.6 })
      ];

      let detections = null;
      for (const option of detectionOptions) {
        detections = await faceapi
          .detectSingleFace(canvas, option)
          .withFaceLandmarks()
          .withFaceDescriptor();
        if (detections) break;
      }

      if (!detections) {
        const allDetections = await faceapi
          .detectAllFaces(canvas, new faceapi.TinyFaceDetectorOptions({ inputSize: 512, scoreThreshold: 0.2 }))
          .withFaceLandmarks()
          .withFaceDescriptors();

        if (allDetections && allDetections.length > 0) {
          detections = allDetections.reduce((largest, current) =>
            current.detection.box.area > largest.detection.box.area ? current : largest
          );
        }
      }

      if (!detections) {
        console.warn("⚠️ No face detected in image after trying multiple options");
        return null;
      }

      console.log("✅ Face descriptor extracted successfully");
      return detections.descriptor;
    } catch (error) {
      console.error("Error in getFaceDescriptor:", error);
      return null;
    }
  };

  return (
    <div className={styles.cameraContainer}>
      <h2>Capture & Verify Your Profile Picture</h2>
      {!capturedImage && (
        <div className={styles.cameraPreview}>
          <video ref={videoRef} autoPlay playsInline width="640" height="480" />
          <canvas ref={canvasRef} width="640" height="480" style={{ display: 'none' }} />
        </div>
      )}
      {!modelsLoaded && (
        <div className={styles.loader}>
          ⏳ Loading facial recognition models... (this may take a few seconds)
        </div>
      )}
      {modelsLoaded && capturedImage && (
        <div className={styles.capturedImage}>
          <img src={capturedImage} alt="Captured" />
          {verificationResult && (
            <div className={`${styles.verificationResult} ${verificationResult.isMatch ? styles.success : styles.failure}`}>
              <p>{verificationResult.isMatch ? '✅ Verified' : '❌ Not Verified'}</p>
              <p>Confidence: {(verificationResult.confidence * 100).toFixed(1)}%</p>
            </div>
          )}
        </div>
      )}
      <div className={styles.cameraControls}>
        {!capturedImage ? (
          <>
            {!cameraStarted && (
              <button onClick={startCamera} disabled={isVerifying}>
                🎥 Start Camera
              </button>
            )}
            {cameraStarted && (
              <>
                <button onClick={captureImage} disabled={isVerifying}>
                  📸 Capture Photo
                </button>
                <button onClick={stopCamera} disabled={isVerifying}>
                  ❌ Stop Camera
                </button>
              </>
            )}
          </>
        ) : (
          <>
            <button onClick={retakePhoto} disabled={isVerifying}>
              🔄 Retake
            </button>
            <button onClick={verifyFaceMatch} disabled={isVerifying}>
              {isVerifying ? '🔍 Verifying...' : '🔍 Verify Identity'}
            </button>
            {verificationResult?.isMatch && (
              <button onClick={saveImageToServer} className={styles.saveButton}>
                💾 Save Verified Photo
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CameraPage;