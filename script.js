// CCTV Violence Detection System - JavaScript with AUTO-ANALYZE after upload

// Initialize Socket.IO connection
const socket = io();

// DOM Elements
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const modeSelect = document.getElementById('modeSelect');
const sourceInput = document.getElementById('sourceInput');
const messageDiv = document.getElementById('message');
const statusDot = document.getElementById('statusDot');
const statusText = document.getElementById('statusText');
const refreshVideosBtn = document.getElementById('refreshVideos');
const liveBadge = document.getElementById('liveBadge');

// Upload elements
const videoUpload = document.getElementById('videoUpload');
const fileName = document.getElementById('fileName');
const uploadBtn = document.getElementById('uploadBtn');
const uploadProgress = document.getElementById('uploadProgress');
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');
const uploadedVideosList = document.getElementById('uploadedVideosList');

// Tab elements
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

// Stats elements
const totalAlertsEl = document.getElementById('totalAlerts');
const peopleCountEl = document.getElementById('peopleCount');
const violenceScoreEl = document.getElementById('violenceScore');
const scoreFillEl = document.getElementById('scoreFill');
const fpsEl = document.getElementById('fps');
const motionStatusEl = document.getElementById('motionStatus');
const lastAlertEl = document.getElementById('lastAlert');

// Alert and video lists
const alertList = document.getElementById('alertList');
const videoList = document.getElementById('videoList');

// State
let alertHistory = [];
let selectedVideoFile = null;
let selectedUploadedVideo = null;
let currentSourceType = 'camera'; // 'camera', 'upload', or 'library'
let isProcessing = false; // Prevent multiple simultaneous actions

// Event Listeners
startBtn.addEventListener('click', startMonitoring);
stopBtn.addEventListener('click', stopMonitoring);
refreshVideosBtn.addEventListener('click', loadSavedVideos);

// Tab switching
tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const tabName = btn.dataset.tab;
        switchTab(tabName);
    });
});

// File upload
videoUpload.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        if (fileName) {
            fileName.textContent = file.name;
        }
        selectedVideoFile = file;
        if (uploadBtn) {
            uploadBtn.style.display = 'block';
        }
    }
});

// Drag and drop for upload zone
const uploadZone = document.getElementById('uploadZone');
if (uploadZone) {
    uploadZone.addEventListener('click', () => videoUpload.click());

    uploadZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadZone.style.borderColor = '#667eea';
        uploadZone.style.background = 'rgba(102, 126, 234, 0.1)';
    });

    uploadZone.addEventListener('dragleave', (e) => {
        e.preventDefault();
        uploadZone.style.borderColor = '';
        uploadZone.style.background = '';
    });

    uploadZone.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadZone.style.borderColor = '';
        uploadZone.style.background = '';

        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('video/')) {
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(file);
            videoUpload.files = dataTransfer.files;
            videoUpload.dispatchEvent(new Event('change'));
        }
    });
}

// Upload button (only if it exists in template)
if (uploadBtn) {
    uploadBtn.addEventListener('click', uploadVideo);
}

// Socket.IO Events
socket.on('connect', () => {
    console.log('Connected to server');
    updateConnectionStatus(true);
});

socket.on('disconnect', () => {
    console.log('Disconnected from server');
    updateConnectionStatus(false);
});

socket.on('stats_update', (stats) => {
    updateStats(stats);
});

socket.on('alert', (alertData) => {
    handleAlert(alertData);
});

socket.on('error', (data) => {
    showMessage(data.message, 'error');
});

socket.on('video_ended', (data) => {
    showMessage(data.message + ' - Analysis complete!', 'success');
    setTimeout(() => {
        stopBtn.click(); // Auto-stop when video ends
    }, 1000);
});

// Functions
function switchTab(tabName) {
    // Update buttons
    tabBtns.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.tab === tabName) {
            btn.classList.add('active');
        }
    });

    // Update content
    tabContents.forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(tabName + '-tab').classList.add('active');

    // Update current source type
    currentSourceType = tabName;

    // Load uploaded videos if library tab
    if (tabName === 'library') {
        loadUploadedVideos();
    }
}

async function uploadVideo() {
    if (!selectedVideoFile) {
        showMessage('Please select a video file', 'error');
        return;
    }

    const formData = new FormData();
    formData.append('video', selectedVideoFile);

    uploadProgress.style.display = 'block';
    uploadBtn.disabled = true;

    try {
        const xhr = new XMLHttpRequest();

        // Track upload progress
        xhr.upload.addEventListener('progress', (e) => {
            if (e.lengthComputable) {
                const percent = (e.loaded / e.total) * 100;
                progressFill.style.width = percent + '%';
                progressText.textContent = `Uploading... ${Math.round(percent)}%`;
            }
        });

        xhr.addEventListener('load', () => {
            if (xhr.status === 200) {
                const response = JSON.parse(xhr.responseText);
                if (response.status === 'success') {
                    showMessage('Video uploaded! Starting analysis...', 'success');
                    progressText.textContent = 'Upload complete! Starting analysis...';

                    // AUTO-START ANALYSIS with uploaded video
                    setTimeout(() => {
                        selectedUploadedVideo = response.filepath;
                        currentSourceType = 'library';

                        // Reset upload form
                        videoUpload.value = '';
                        fileName.textContent = 'Choose video file...';
                        uploadBtn.style.display = 'none';
                        uploadProgress.style.display = 'none';
                        progressFill.style.width = '0%';
                        selectedVideoFile = null;

                        // Start analysis automatically
                        startMonitoring();
                    }, 1000);
                } else {
                    showMessage(response.message, 'error');
                    uploadBtn.disabled = false;
                }
            } else {
                showMessage('Upload failed', 'error');
                uploadBtn.disabled = false;
            }
        });

        xhr.addEventListener('error', () => {
            showMessage('Upload error', 'error');
            uploadBtn.disabled = false;
            uploadProgress.style.display = 'none';
        });

        xhr.open('POST', '/api/upload');
        xhr.send(formData);

    } catch (error) {
        showMessage('Error uploading video: ' + error.message, 'error');
        uploadBtn.disabled = false;
        uploadProgress.style.display = 'none';
    }
}

async function loadUploadedVideos() {
    try {
        const response = await fetch('/api/uploaded_videos');
        const videos = await response.json();

        if (videos.length === 0) {
            uploadedVideosList.innerHTML = '<p class="no-videos">No uploaded videos yet</p>';
            return;
        }

        uploadedVideosList.innerHTML = videos.map(video => `
            <div class="uploaded-video-item" data-filepath="${video.filepath}">
                <div class="uploaded-video-info">
                    <div class="uploaded-video-name">📹 ${video.filename}</div>
                    <div class="uploaded-video-meta">${video.time} | ${formatFileSize(video.size)}</div>
                </div>
                <button class="uploaded-video-select" onclick="selectUploadedVideo('${video.filepath}', this)">
                    Analyze
                </button>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading uploaded videos:', error);
    }
}

function selectUploadedVideo(filepath, button) {
    // Remove previous selection
    document.querySelectorAll('.uploaded-video-item').forEach(item => {
        item.classList.remove('selected');
    });

    // Add selection to clicked item
    button.closest('.uploaded-video-item').classList.add('selected');
    selectedUploadedVideo = filepath;
    currentSourceType = 'library';

    // AUTO-START analysis
    showMessage('Starting analysis...', 'success');
    setTimeout(() => {
        startMonitoring();
    }, 500);
}

async function startMonitoring() {
    if (isProcessing) return; // Prevent multiple clicks
    isProcessing = true;

    const mode = modeSelect.value;
    let source;

    // Determine source based on active tab or selected video
    if (currentSourceType === 'camera') {
        source = sourceInput.value;
        liveBadge.textContent = '🔴 LIVE';
        liveBadge.style.background = '#ef4444';
    } else if ((currentSourceType === 'library' || currentSourceType === 'upload') && selectedUploadedVideo) {
        source = selectedUploadedVideo;
        liveBadge.textContent = '📁 VIDEO';
        liveBadge.style.background = '#f59e0b'; // Orange for uploaded video
    } else {
        showMessage('Please select a video source', 'error');
        return;
    }

    showMessage('Starting analysis...', 'success');

    try {
        const response = await fetch('/api/start', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ mode, source })
        });

        const data = await response.json();

        if (data.status === 'success') {
            startBtn.disabled = true;
            stopBtn.disabled = false;
            modeSelect.disabled = true;
            sourceInput.disabled = true;
            if (uploadBtn) {
                uploadBtn.disabled = true;
            }

            // Disable tab switching during analysis
            tabBtns.forEach(btn => btn.disabled = true);

            // Hide video placeholder
            const placeholder = document.getElementById('videoPlaceholder');
            if (placeholder) {
                placeholder.style.display = 'none';
            }

            showMessage('Analysis running...', 'success');
            updateConnectionStatus(true);
            isProcessing = false;
        } else {
            showMessage(data.message, 'error');
            isProcessing = false;
        }
    } catch (error) {
        showMessage('Error starting analysis: ' + error.message, 'error');
        isProcessing = false;
    }
}

async function stopMonitoring() {
    console.log('Stop button clicked');

    // Don't check isProcessing - always allow stop
    isProcessing = true;

    // Instant UI update (don't wait for server)
    startBtn.disabled = false;
    stopBtn.disabled = true;
    modeSelect.disabled = false;
    sourceInput.disabled = false;
    if (uploadBtn) {
        uploadBtn.disabled = false;
    }

    // Re-enable tab switching immediately
    tabBtns.forEach(btn => btn.disabled = false);

    // Reset live badge
    liveBadge.textContent = '🔴 LIVE';
    liveBadge.style.background = '#ef4444';

    // Show video placeholder again
    const placeholder = document.getElementById('videoPlaceholder');
    if (placeholder) {
        placeholder.style.display = 'flex';
    }

    showMessage('Stopping...', 'success');
    updateConnectionStatus(false);

    // Send stop request with timeout protection
    const stopController = new AbortController();
    const timeoutId = setTimeout(() => stopController.abort(), 5000);

    fetch('/api/stop', {
        method: 'POST',
        signal: stopController.signal
    })
        .then(response => response.json())
        .then(data => {
            clearTimeout(timeoutId);
            if (data.status === 'success') {
                showMessage('Stopped successfully', 'success');
                // Reload saved videos list
                setTimeout(() => loadSavedVideos(), 1000);
            }
            isProcessing = false;
        })
        .catch(error => {
            clearTimeout(timeoutId);
            console.error('Stop error or timeout:', error);
            showMessage('Stop request sent', 'success'); // Even if error, we already updated UI
            isProcessing = false;
        });
}

function updateStats(stats) {
    console.log('Stats received:', stats);

    // Batch DOM updates for better performance
    requestAnimationFrame(() => {
        // Update stat displays
        totalAlertsEl.textContent = stats.total_alerts;
        peopleCountEl.textContent = stats.people_count;
        violenceScoreEl.textContent = stats.violence_score.toFixed(2);
        fpsEl.textContent = stats.fps + ' FPS';
        motionStatusEl.textContent = stats.motion_detected ? 'Motion Detected' : 'No Motion';
        lastAlertEl.textContent = stats.last_alert_time || 'None';

        // Update violence score bar
        const scorePercent = stats.violence_score * 100;
        scoreFillEl.style.width = scorePercent + '%';

        // Change color based on score
        scoreFillEl.classList.remove('medium', 'high');
        if (stats.violence_score >= 0.7) {
            scoreFillEl.classList.add('high');
        } else if (stats.violence_score >= 0.3) {
            scoreFillEl.classList.add('medium');
        }

        // Update motion status color
        motionStatusEl.style.color = stats.motion_detected ? '#f59e0b' : '#9ca3af';
    });
}

function handleAlert(alertData) {
    // Add to alert history
    alertHistory.unshift(alertData);
    if (alertHistory.length > 10) {
        alertHistory.pop();
    }

    // Update alert list
    updateAlertList();

    // Instant UI update for alert counter
    const totalAlertsEl = document.getElementById('totalAlerts');
    if (totalAlertsEl) {
        const currentCount = parseInt(totalAlertsEl.textContent) || 0;
        totalAlertsEl.textContent = currentCount + 1;
    }

    // Show notification
    playAlertSound();

    // Flash the page title
    flashTitle('🚨 VIOLENCE DETECTED!');
}

function updateAlertList() {
    if (alertHistory.length === 0) {
        alertList.innerHTML = '<p class="no-alerts">No alerts yet</p>';
        return;
    }

    alertList.innerHTML = alertHistory.map(alert => `
        <div class="alert-item">
            <div class="alert-time">🕐 ${alert.time}</div>
            <div class="alert-details">
                <strong>Violence Score:</strong> ${alert.violence_score.toFixed(2)} | 
                <strong>People:</strong> ${alert.people_count} | 
                <strong>Intensity:</strong> ${alert.intensity.toFixed(0)}
            </div>
        </div>
    `).join('');
}

async function loadSavedVideos() {
    try {
        const response = await fetch('/api/alerts');
        const videos = await response.json();

        if (videos.length === 0) {
            videoList.innerHTML = '<p class="no-videos">No saved videos</p>';
            return;
        }

        videoList.innerHTML = videos.map(video => `
            <div class="video-item">
                <div>
                    <div class="video-name">📹 ${video.filename}</div>
                    <div class="video-info">${video.time} | ${formatFileSize(video.size)}</div>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading videos:', error);
    }
}

function showMessage(text, type) {
    messageDiv.textContent = text;
    messageDiv.className = 'message ' + type;

    setTimeout(() => {
        messageDiv.className = 'message';
    }, 5000);
}

function updateConnectionStatus(isOnline) {
    if (isOnline) {
        statusDot.classList.add('online');
        statusText.textContent = 'Online';
    } else {
        statusDot.classList.remove('online');
        statusText.textContent = 'Offline';
    }
}

function playAlertSound() {
    // Create a simple beep sound
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = 800;
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
    } catch (e) {
        console.log('Audio not available');
    }
}

function flashTitle(alertText) {
    const originalTitle = document.title;
    let isAlert = true;
    let count = 0;

    const interval = setInterval(() => {
        document.title = isAlert ? alertText : originalTitle;
        isAlert = !isAlert;
        count++;

        if (count >= 10) {
            clearInterval(interval);
            document.title = originalTitle;
        }
    }, 1000);
}

function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Load initial data
    loadSavedVideos();

    // Fetch initial stats
    fetch('/api/stats')
        .then(response => response.json())
        .then(stats => updateStats(stats))
        .catch(error => console.error('Error loading stats:', error));
});

// Auto-refresh saved videos every 60 seconds (was 30, now slower to reduce load)
setInterval(loadSavedVideos, 60000);