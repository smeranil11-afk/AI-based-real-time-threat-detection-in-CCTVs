"""
Configuration file for Violence Detection System
Adjust these parameters to fine-tune detection sensitivity
"""

# ===== CAMERA SETTINGS (OPTIMIZED FOR SPEED) =====
CAMERA_ID = 0  # 0 for default webcam, or use video file path
FRAME_WIDTH = 480  # Smaller = MUCH faster (was 640)
FRAME_HEIGHT = 360
FPS = 30

# ===== YOLO SETTINGS =====
YOLO_MODEL_SIZE = 'yolov8n.pt'  # Nano model for speed (n=nano, s=small, m=medium)
YOLO_CONFIDENCE = 0.6  # Higher = faster (skip low confidence detections)

# ===== MOTION DETECTION SETTINGS (OPTIMIZED FOR SPEED) =====
# Basic motion detection
GAUSSIAN_BLUR_SIZE = (11, 11)  # Smaller = faster (was 15x15)
MOTION_THRESHOLD = 30  # Higher = faster (less sensitive = less processing)
MIN_CONTOUR_AREA = 2000  # Smaller for faster (was 3000)
DILATION_ITERATIONS = 1  # Minimal processing

# ===== VIOLENCE DETECTION THRESHOLDS =====
# Level 1: Basic motion counting
MOTION_ALERT_THRESHOLD = 15  # Consecutive frames with motion
STILL_RESET_THRESHOLD = 20   # Frames of stillness to reset

# Level 2: Motion intensity analysis
HIGH_INTENSITY_THRESHOLD = 30000  # High intensity motion area
INTENSITY_ALERT_FRAMES = 10       # Consecutive high-intensity frames

# Level 3: Advanced pattern detection
RAPID_MOVEMENT_THRESHOLD = 50    # Pixel displacement threshold
ERRATIC_MOVEMENT_COUNT = 8       # Number of direction changes
VIOLENCE_SCORE_THRESHOLD = 0.7   # 0-1 score for violence probability

# ===== ALERT SETTINGS =====
ALERT_COOLDOWN = 30  # Frames between repeated alerts
SAVE_ALERT_CLIPS = True
ALERT_CLIP_DURATION = 5  # Seconds before and after alert

# ===== DISPLAY SETTINGS =====
SHOW_MOTION_MASK = True
SHOW_DEBUG_INFO = True
ENABLE_RECORDING = False

# ===== FILE PATHS =====
OUTPUT_DIR = "output"
ALERTS_DIR = "output/alerts"
LOGS_DIR = "output/logs"

# ===== DETECTION MODES =====
# Choose detection level: 'basic', 'intermediate', 'advanced'
DETECTION_MODE = 'basic'