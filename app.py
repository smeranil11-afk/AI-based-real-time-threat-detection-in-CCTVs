"""
Web-Based CCTV Violence Detection System
Flask server with real-time video streaming, alerts, and VIDEO UPLOAD
"""
from flask import Flask, render_template, Response, jsonify, request
from flask_socketio import SocketIO, emit
import cv2
import numpy as np
import threading
import time
from datetime import datetime
import json
import os
from werkzeug.utils import secure_filename

from video_input import VideoInput
from motion_detector import MotionDetector
from person_detector import PersonDetector
from alert_manager import AlertManager
from smart_detector import RealAdvancedDetector
import config

app = Flask(__name__)
app.config['SECRET_KEY'] = 'violence-detection-secret-key'
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['MAX_CONTENT_LENGTH'] = 500 * 1024 * 1024  # 500MB max file size
socketio = SocketIO(app, cors_allowed_origins="*", max_http_buffer_size=500*1024*1024)

# Create upload folder
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Allowed video extensions
ALLOWED_EXTENSIONS = {'mp4', 'avi', 'mov', 'mkv', 'flv', 'wmv', 'webm'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Global state
class DetectionState:
    def __init__(self):
        self.running = False
        self.mode = 'advanced'
        self.video_source = 0
        
        # Detection system components
        self.video_input = None
        self.detector = None
        self.person_detector = None
        self.alert_manager = None
        self.advanced_detector = None  # NEW: Advanced violence analysis
        
        # Current frame and stats
        self.current_frame = None
        self.frame_lock = threading.Lock()
        
        # Statistics
        self.stats = {
            'total_alerts': 0,
            'people_count': 0,
            'violence_score': 0.0,
            'is_monitoring': False,
            'current_mode': 'advanced',
            'fps': 0,
            'frame_count': 0,
            'motion_detected': False,
            'last_alert_time': None,
            'video_source_type': 'camera'  # 'camera' or 'uploaded'
        }
        
        # Detection thread
        self.detection_thread = None

state = DetectionState()


@app.route('/')
def index():
    """Main dashboard page"""
    return render_template('index.html')


@app.route('/api/upload', methods=['POST'])
def upload_video():
    """Upload video file for analysis"""
    if 'video' not in request.files:
        return jsonify({'status': 'error', 'message': 'No video file provided'})
    
    file = request.files['video']
    
    if file.filename == '':
        return jsonify({'status': 'error', 'message': 'No file selected'})
    
    if not allowed_file(file.filename):
        return jsonify({'status': 'error', 'message': 'Invalid file type. Allowed: mp4, avi, mov, mkv, flv, wmv, webm'})
    
    try:
        # Save uploaded file
        filename = secure_filename(file.filename)
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"{timestamp}_{filename}"
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        return jsonify({
            'status': 'success',
            'message': 'Video uploaded successfully',
            'filepath': filepath,
            'filename': filename
        })
    
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)})


@app.route('/api/uploaded_videos')
def get_uploaded_videos():
    """Get list of uploaded videos"""
    videos = []
    upload_dir = app.config['UPLOAD_FOLDER']
    
    if os.path.exists(upload_dir):
        for filename in sorted(os.listdir(upload_dir), reverse=True):
            if allowed_file(filename):
                filepath = os.path.join(upload_dir, filename).replace('\\', '/')  # Fix path separators
                videos.append({
                    'filename': filename,
                    'filepath': filepath,
                    'size': os.path.getsize(filepath),
                    'time': datetime.fromtimestamp(os.path.getmtime(filepath)).strftime('%Y-%m-%d %H:%M:%S')
                })
    
    return jsonify(videos)


@app.route('/api/start', methods=['POST'])
def start_monitoring():
    """Start the violence detection system"""
    if state.running:
        return jsonify({'status': 'error', 'message': 'Already running'})
    
    try:
        data = request.get_json()
        state.mode = data.get('mode', 'advanced')
        source = data.get('source', 0)
        
        # Check if source is uploaded video path or camera
        if isinstance(source, str) and source.startswith('uploads/'):
            state.stats['video_source_type'] = 'uploaded'
        else:
            state.stats['video_source_type'] = 'camera'
        
        # Try to convert to int for camera ID
        try:
            state.video_source = int(source)
        except ValueError:
            state.video_source = source
        
        # Initialize components
        state.video_input = VideoInput(state.video_source)
        state.detector = MotionDetector(state.mode)
        state.person_detector = PersonDetector() if state.mode == 'advanced' else None
        # REAL advanced detector that actually works!
        state.advanced_detector = RealAdvancedDetector() if state.mode == 'advanced' else None
        state.alert_manager = AlertManager()
        
        # Start detection in background thread
        state.running = True
        state.detection_thread = threading.Thread(target=run_detection, daemon=True)
        state.detection_thread.start()
        
        state.stats['is_monitoring'] = True
        state.stats['current_mode'] = state.mode
        
        return jsonify({'status': 'success', 'message': 'Monitoring started'})
    
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)})


@app.route('/api/stop', methods=['POST'])
def stop_monitoring():
    """Stop the violence detection system"""
    if not state.running:
        return jsonify({'status': 'error', 'message': 'Not running'})
    
    # Set flag to stop (background thread will clean up)
    state.running = False
    state.stats['is_monitoring'] = False
    
    # Quick cleanup in background
    def cleanup():
        time.sleep(0.5)  # Give thread time to finish
        if state.video_input:
            try:
                state.video_input.release()
            except:
                pass
        if state.alert_manager:
            try:
                state.alert_manager.close()
            except:
                pass
    
    threading.Thread(target=cleanup, daemon=True).start()
    
    return jsonify({'status': 'success', 'message': 'Stopping...'})


@app.route('/api/stats')
def get_stats():
    """Get current statistics"""
    return jsonify(state.stats)


@app.route('/api/alerts')
def get_alerts():
    """Get list of saved alert videos"""
    alerts_dir = config.ALERTS_DIR
    alerts = []
    
    if os.path.exists(alerts_dir):
        for filename in sorted(os.listdir(alerts_dir), reverse=True):
            if filename.endswith('.avi'):
                filepath = os.path.join(alerts_dir, filename)
                alerts.append({
                    'filename': filename,
                    'size': os.path.getsize(filepath),
                    'time': datetime.fromtimestamp(os.path.getmtime(filepath)).strftime('%Y-%m-%d %H:%M:%S')
                })
    
    return jsonify(alerts[:10])  # Return last 10 alerts


def run_detection():
    """Main detection loop running in background"""
    try:
        state.video_input.open()
        
        ret, prev_frame = state.video_input.read_frame()
        if not ret:
            socketio.emit('error', {'message': 'Cannot read from video source'})
            state.running = False
            return
        
        frame_count = 0
        start_time = time.time()
        violence_alert_active = False
        
        while state.running:
            # Quick exit check at start of loop
            if not state.running:
                break
                
            ret, curr_frame = state.video_input.read_frame()
            if not ret:
                # Video ended (for uploaded videos)
                if state.stats['video_source_type'] == 'uploaded':
                    socketio.emit('video_ended', {'message': 'Video analysis complete'})
                break
            
            frame_count += 1
            
            # Quick exit check during processing
            if not state.running:
                break
            
            # Calculate FPS
            elapsed = time.time() - start_time
            fps = frame_count / elapsed if elapsed > 0 else 0
            
            # FORCE SMALL RESOLUTION for maximum speed
            curr_frame = cv2.resize(curr_frame, (480, 360))
            prev_frame = cv2.resize(prev_frame, (480, 360)) if frame_count > 1 else curr_frame
            
            # Update buffer less frequently (every 10 frames)
            if frame_count % 10 == 0:
                state.alert_manager.update_buffer(curr_frame)
            
            display_frame = curr_frame.copy()
            
            if state.mode == 'advanced' and state.person_detector:
                # Person detection
                people_detected, person_boxes = state.person_detector.detect_people(curr_frame)
                
                if people_detected:
                    # Draw person boxes
                    display_frame = state.person_detector.draw_person_boxes(display_frame, person_boxes)
                    
                    # Motion detection in person regions
                    person_mask = state.person_detector.create_person_mask(curr_frame, person_boxes)
                    motion_detected, boxes, motion_mask = state.detector.detect_motion(prev_frame, curr_frame)
                    
                    # USE REAL ADVANCED VIOLENCE ANALYSIS
                    if state.advanced_detector:
                        violence_score, explanation = state.advanced_detector.analyze_violence(
                            person_boxes, boxes, curr_frame.shape
                        )
                    else:
                        # Fallback
                        violence_score, _ = state.detector.calculate_violence_score()
                        explanation = "Basic analysis"
                    
                    # Draw motion boxes - THICK and VISIBLE
                    for (x, y, w, h) in boxes:
                        color = (0, 0, 255) if violence_score > 0.5 else (0, 255, 255)
                        cv2.rectangle(display_frame, (x, y), (x + w, y + h), color, 3)  # Thickness 3!
                    
                    # Display info on frame CLEARLY
                    y_pos = 30
                    
                    # Show people count - BIGGER TEXT
                    cv2.putText(display_frame, f"People: {len(person_boxes)}", (30, y_pos),
                               cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 0), 2)
                    
                    # Show violence score - ALWAYS VISIBLE
                    y_pos += 40
                    score_color = (0, 255, 0) if violence_score < 0.4 else (0, 165, 255) if violence_score < 0.65 else (0, 0, 255)
                    cv2.putText(display_frame, f"Score: {violence_score:.2f}", (30, y_pos),
                               cv2.FONT_HERSHEY_SIMPLEX, 0.8, score_color, 2)
                    
                    # Show explanation if violence detected
                    if violence_score > 0.4:
                        y_pos += 40
                        cv2.putText(display_frame, explanation[:35], (30, y_pos),
                                   cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 165, 255), 2)
                    
                    # Violence score bar (BIGGER and CLEARER)
                    bar_x, bar_y = 30, display_frame.shape[0] - 80
                    bar_width, bar_height = 250, 30
                    
                    # Background bar (dark)
                    cv2.rectangle(display_frame, (bar_x, bar_y), 
                                (bar_x + bar_width, bar_y + bar_height), (50, 50, 50), -1)
                    
                    # Score bar with color
                    score_width = int(bar_width * violence_score)
                    color = (0, 255, 0) if violence_score < 0.3 else (0, 165, 255) if violence_score < 0.65 else (0, 0, 255)
                    cv2.rectangle(display_frame, (bar_x, bar_y),
                                (bar_x + score_width, bar_y + bar_height), color, -1)
                    
                    # Score text ABOVE bar
                    cv2.putText(display_frame, f"Violence: {violence_score:.2f}",
                               (bar_x, bar_y - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)
                    
                    # Check for violence alert
                    alert_threshold = 0.65
                    if violence_score >= alert_threshold:
                        # FLASHING RED BACKGROUND
                        if frame_count % 10 < 5:  # Flash every 5 frames
                            # Draw red semi-transparent overlay
                            overlay = display_frame.copy()
                            cv2.rectangle(overlay, (0, 0), (display_frame.shape[1], 100), (0, 0, 255), -1)
                            cv2.addWeighted(overlay, 0.3, display_frame, 0.7, 0, display_frame)
                        
                        # BIG VIOLENCE TEXT
                        cv2.putText(display_frame, "!!! VIOLENCE DETECTED !!!", (30, 150),
                                   cv2.FONT_HERSHEY_SIMPLEX, 1.2, (0, 0, 255), 4)
                        
                        if not violence_alert_active:
                            alert_data = {
                                'time': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
                                'violence_score': violence_score,
                                'people_count': len(person_boxes),
                                'explanation': explanation
                            }
                            
                            # Send alert to web interface
                            socketio.emit('alert', alert_data)
                            
                            # Save alert with detailed info
                            alert_details = {
                                'Violence Score': f"{violence_score:.2f}",
                                'People': len(person_boxes),
                                'Reason': explanation
                            }
                            
                            state.alert_manager.trigger_alert(
                                frame_count,
                                "VIOLENCE DETECTED",
                                alert_details
                            )
                            
                            state.stats['total_alerts'] += 1
                            state.stats['last_alert_time'] = alert_data['time']
                            violence_alert_active = True
                    else:
                        violence_alert_active = False
                    
                    # Update stats EVERY FRAME for real-time display
                    state.stats['people_count'] = len(person_boxes)
                    state.stats['violence_score'] = violence_score
                    state.stats['motion_detected'] = motion_detected
                else:
                    # No people detected
                    cv2.putText(display_frame, "No People Detected", (30, 30),
                               cv2.FONT_HERSHEY_SIMPLEX, 0.7, (100, 100, 100), 2)
                    
                    state.stats['people_count'] = 0
                    state.stats['violence_score'] = 0.0
                    state.stats['motion_detected'] = False
            
            else:
                # Basic/Intermediate mode
                motion_detected, boxes, motion_mask = state.detector.detect_motion(prev_frame, curr_frame)
                
                for (x, y, w, h) in boxes:
                    cv2.rectangle(display_frame, (x, y), (x + w, y + h), (0, 0, 255), 2)
                
                if motion_detected:
                    cv2.putText(display_frame, "Motion Detected", (30, 30),
                               cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)
                
                state.stats['motion_detected'] = motion_detected
            
            # Add timestamp
            timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            cv2.putText(display_frame, timestamp, (display_frame.shape[1] - 250, 30),
                       cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)
            
            # Add source type indicator
            source_text = "📹 Live Camera" if state.stats['video_source_type'] == 'camera' else "📁 Uploaded Video"
            cv2.putText(display_frame, source_text, (30, display_frame.shape[0] - 20),
                       cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)
            
            # Update alert recording
            state.alert_manager.update_recording(display_frame)
            
            # Update stats
            state.stats['fps'] = round(fps, 1)
            state.stats['frame_count'] = frame_count
            
            # Store frame for streaming
            with state.frame_lock:
                state.current_frame = display_frame
            
            # Send stats update VERY FREQUENTLY (every 3 frames!)
            if frame_count % 3 == 0:
                socketio.emit('stats_update', state.stats)
            
            prev_frame = curr_frame
            
            # NO delay for maximum speed!
    
    except Exception as e:
        socketio.emit('error', {'message': str(e)})
        print(f"Detection error: {e}")
    
    finally:
        state.running = False
        # Cleanup is now handled in background by stop endpoint


def generate_frames():
    """Generator function for video streaming - ULTRA OPTIMIZED"""
    while True:
        with state.frame_lock:
            if state.current_frame is None:
                # Send placeholder frame
                frame = np.zeros((360, 480, 3), dtype=np.uint8)
                cv2.putText(frame, "No Video Feed", (150, 180),
                           cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2)
            else:
                frame = state.current_frame
        
        # ULTRA FAST encoding - lowest quality for maximum speed
        ret, buffer = cv2.imencode('.jpg', frame, [cv2.IMWRITE_JPEG_QUALITY, 40])  # 40% quality for max speed
        if not ret:
            continue
        
        frame_bytes = buffer.tobytes()
        
        # Yield frame in multipart format
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')
        
        # Faster streaming - 40 FPS
        time.sleep(0.015)


@app.route('/video_feed')
def video_feed():
    """Video streaming route"""
    return Response(generate_frames(),
                   mimetype='multipart/x-mixed-replace; boundary=frame')


@socketio.on('connect')
def handle_connect():
    """Handle client connection"""
    print('Client connected')
    emit('stats_update', state.stats)


@socketio.on('disconnect')
def handle_disconnect():
    """Handle client disconnection"""
    print('Client disconnected')


if __name__ == '__main__':
    print("\n" + "="*60)
    print("🌐 CCTV Violence Detection Web System")
    print("="*60)
    print("\n📺 Open your browser and go to:")
    print("   http://localhost:5000")
    print("\n Press Ctrl+C to stop the server")
    print("="*60 + "\n")
    
    socketio.run(app, host='0.0.0.0', port=5000, debug=False)