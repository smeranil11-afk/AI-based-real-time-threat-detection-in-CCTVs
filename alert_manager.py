"""
Alert Management System
Handles logging, notifications, and video clip saving
"""
import cv2
import os
from datetime import datetime
from collections import deque
import config


class AlertManager:
    def __init__(self):
        """Initialize alert manager"""
        self.alert_count = 0
        self.last_alert_frame = -config.ALERT_COOLDOWN
        self.frame_buffer = deque(maxlen=150)  # Store last 5 seconds at 30fps
        self.is_recording_alert = False
        self.alert_writer = None
        self.alert_frames_remaining = 0
        
        # Create output directories
        self._create_directories()
        
        # Open log file
        self.log_file = self._open_log_file()
    
    def _create_directories(self):
        """Create necessary output directories"""
        os.makedirs(config.OUTPUT_DIR, exist_ok=True)
        os.makedirs(config.ALERTS_DIR, exist_ok=True)
        os.makedirs(config.LOGS_DIR, exist_ok=True)
    
    def _open_log_file(self):
        """Open log file for this session"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        log_path = os.path.join(config.LOGS_DIR, f"log_{timestamp}.txt")
        log_file = open(log_path, 'w')
        log_file.write(f"=== Violence Detection Log - {datetime.now()} ===\n\n")
        return log_file
    
    def update_buffer(self, frame):
        """Add frame to circular buffer"""
        self.frame_buffer.append(frame.copy())
    
    def can_trigger_alert(self, current_frame):
        """Check if enough time has passed since last alert"""
        return (current_frame - self.last_alert_frame) >= config.ALERT_COOLDOWN
    
    def trigger_alert(self, current_frame, alert_type="MOTION", details=None):
        """
        Trigger an alert
        alert_type: type of alert ('MOTION', 'INTENSITY', 'VIOLENCE')
        details: additional information dictionary
        """
        if not self.can_trigger_alert(current_frame):
            return False
        
        self.alert_count += 1
        self.last_alert_frame = current_frame
        
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        
        # Log to console
        print(f"\n{'='*60}")
        print(f"🚨 ALERT #{self.alert_count} - {alert_type}")
        print(f"Time: {timestamp}")
        print(f"Frame: {current_frame}")
        if details:
            for key, value in details.items():
                print(f"{key}: {value}")
        print(f"{'='*60}\n")
        
        # Log to file
        self.log_file.write(f"\n{'='*60}\n")
        self.log_file.write(f"ALERT #{self.alert_count} - {alert_type}\n")
        self.log_file.write(f"Time: {timestamp}\n")
        self.log_file.write(f"Frame: {current_frame}\n")
        if details:
            for key, value in details.items():
                self.log_file.write(f"{key}: {value}\n")
        self.log_file.write(f"{'='*60}\n")
        self.log_file.flush()
        
        # Save video clip if enabled
        if config.SAVE_ALERT_CLIPS:
            self._start_alert_recording(timestamp)
        
        return True
    
    def _start_alert_recording(self, timestamp):
        """Start recording alert video clip"""
        if len(self.frame_buffer) == 0:
            return
        
        # Generate filename
        safe_timestamp = timestamp.replace(':', '-').replace(' ', '_')
        filename = f"alert_{self.alert_count}_{safe_timestamp}.avi"
        filepath = os.path.join(config.ALERTS_DIR, filename)
        
        # Get frame dimensions
        height, width = self.frame_buffer[0].shape[:2]
        
        # Create video writer
        fourcc = cv2.VideoWriter_fourcc(*'XVID')
        self.alert_writer = cv2.VideoWriter(
            filepath,
            fourcc,
            30.0,
            (width, height)
        )
        
        # Write buffered frames (before alert)
        for frame in self.frame_buffer:
            self.alert_writer.write(frame)
        
        # Set flag to continue recording
        self.is_recording_alert = True
        self.alert_frames_remaining = int(config.ALERT_CLIP_DURATION * 30)  # frames after alert
        
        print(f"📹 Recording alert clip: {filename}")
    
    def update_recording(self, frame):
        """Continue recording alert clip if active"""
        if self.is_recording_alert and self.alert_writer:
            self.alert_writer.write(frame)
            self.alert_frames_remaining -= 1
            
            if self.alert_frames_remaining <= 0:
                self._stop_alert_recording()
    
    def _stop_alert_recording(self):
        """Stop recording alert clip"""
        if self.alert_writer:
            self.alert_writer.release()
            self.alert_writer = None
            self.is_recording_alert = False
            print("✓ Alert clip saved")
    
    def get_stats(self):
        """Get current statistics"""
        return {
            'total_alerts': self.alert_count,
            'buffer_size': len(self.frame_buffer)
        }
    
    def close(self):
        """Clean up resources"""
        if self.log_file:
            self.log_file.write(f"\n=== Session ended - {datetime.now()} ===\n")
            self.log_file.write(f"Total alerts: {self.alert_count}\n")
            self.log_file.close()
        
        if self.alert_writer:
            self._stop_alert_recording()
        
        print(f"\n✓ Session complete. Total alerts: {self.alert_count}")
