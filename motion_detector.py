"""
Advanced Motion Detection Module
Supports multiple levels of motion analysis for violence detection
"""
import cv2
import numpy as np
import config
from collections import deque


class MotionDetector:
    def __init__(self, mode='basic'):
        """
        Initialize motion detector
        mode: 'basic', 'intermediate', or 'advanced'
        """
        self.mode = mode
        self.motion_history = deque(maxlen=30)  # Store last 30 frames of motion data
        self.centroids_history = deque(maxlen=10)  # Track object centroids

    def detect_motion(self, prev_frame, curr_frame, mask=None):
        """
        Basic motion detection using frame differencing
        Optional mask to focus detection on specific regions
        Returns: motion_detected (bool), boxes (list), motion_mask (numpy array)
        """
        # Convert to grayscale
        prev_gray = cv2.cvtColor(prev_frame, cv2.COLOR_BGR2GRAY)
        curr_gray = cv2.cvtColor(curr_frame, cv2.COLOR_BGR2GRAY)

        # Blur to reduce noise
        prev_gray = cv2.GaussianBlur(prev_gray, config.GAUSSIAN_BLUR_SIZE, 0)
        curr_gray = cv2.GaussianBlur(curr_gray, config.GAUSSIAN_BLUR_SIZE, 0)

        # Frame difference
        diff = cv2.absdiff(prev_gray, curr_gray)

        # Apply mask if provided
        if mask is not None:
            diff = cv2.bitwise_and(diff, mask)

        # Threshold
        _, thresh = cv2.threshold(diff, config.MOTION_THRESHOLD, 255, cv2.THRESH_BINARY)

        # Dilate to fill gaps
        thresh = cv2.dilate(thresh, None, iterations=config.DILATION_ITERATIONS)

        # Find contours
        contours, _ = cv2.findContours(
            thresh,
            cv2.RETR_EXTERNAL,
            cv2.CHAIN_APPROX_SIMPLE
        )

        boxes = []
        motion_detected = False
        total_motion_area = 0

        for contour in contours:
            area = cv2.contourArea(contour)
            if area < config.MIN_CONTOUR_AREA:
                continue

            motion_detected = True
            total_motion_area += area
            x, y, w, h = cv2.boundingRect(contour)
            boxes.append((x, y, w, h))

        # Store motion data for advanced analysis
        self.motion_history.append({
            'detected': motion_detected,
            'area': total_motion_area,
            'num_regions': len(boxes),
            'boxes': boxes
        })

        return motion_detected, boxes, thresh
    
    def analyze_motion_intensity(self):
        """
        Intermediate: Analyze motion intensity over time
        Returns: intensity_score, is_high_intensity
        """
        if len(self.motion_history) < 5:
            return 0, False
        
        recent_motion = list(self.motion_history)[-10:]
        total_area = sum(m['area'] for m in recent_motion)
        avg_area = total_area / len(recent_motion)
        
        is_high_intensity = avg_area > config.HIGH_INTENSITY_THRESHOLD
        
        return avg_area, is_high_intensity
    
    def detect_rapid_movement(self, boxes):
        """
        Advanced: Detect rapid/erratic movements
        Returns: is_rapid, displacement
        """
        if len(boxes) == 0:
            return False, 0
        
        # Calculate centroids of current boxes
        current_centroids = []
        for (x, y, w, h) in boxes:
            cx = x + w // 2
            cy = y + h // 2
            current_centroids.append((cx, cy))
        
        self.centroids_history.append(current_centroids)
        
        if len(self.centroids_history) < 2:
            return False, 0
        
        # Calculate displacement between frames
        prev_centroids = self.centroids_history[-2]
        
        if len(prev_centroids) == 0 or len(current_centroids) == 0:
            return False, 0
        
        # Find maximum displacement
        max_displacement = 0
        for curr_c in current_centroids:
            for prev_c in prev_centroids:
                dist = np.sqrt((curr_c[0] - prev_c[0])**2 + (curr_c[1] - prev_c[1])**2)
                max_displacement = max(max_displacement, dist)
        
        is_rapid = max_displacement > config.RAPID_MOVEMENT_THRESHOLD
        
        return is_rapid, max_displacement
    
    def detect_erratic_pattern(self):
        """
        Advanced: Detect erratic movement patterns (direction changes)
        Returns: is_erratic, direction_changes
        """
        if len(self.centroids_history) < 5:
            return False, 0
        
        # Track direction changes
        direction_changes = 0
        prev_direction = None
        
        history_list = list(self.centroids_history)
        for i in range(1, len(history_list)):
            if len(history_list[i]) > 0 and len(history_list[i-1]) > 0:
                # Compare first centroid of each frame
                curr = history_list[i][0]
                prev = history_list[i-1][0]
                
                dx = curr[0] - prev[0]
                dy = curr[1] - prev[1]
                
                if abs(dx) > 5 or abs(dy) > 5:  # Significant movement
                    current_direction = (1 if dx > 0 else -1, 1 if dy > 0 else -1)
                    
                    if prev_direction and current_direction != prev_direction:
                        direction_changes += 1
                    
                    prev_direction = current_direction
        
        is_erratic = direction_changes >= config.ERRATIC_MOVEMENT_COUNT
        
        return is_erratic, direction_changes
    
    def calculate_violence_score(self):
        """
        Advanced: Calculate overall violence probability score
        Returns: score (0-1), components dict
        """
        if len(self.motion_history) < 10:
            return 0.0, {}
        
        # Component scores
        scores = {}
        
        # 1. Sustained motion score (0-1)
        recent_motion = list(self.motion_history)[-15:]
        motion_ratio = sum(1 for m in recent_motion if m['detected']) / len(recent_motion)
        scores['sustained_motion'] = motion_ratio
        
        # 2. Intensity score (0-1)
        intensity, _ = self.analyze_motion_intensity()
        scores['intensity'] = min(intensity / config.HIGH_INTENSITY_THRESHOLD, 1.0)
        
        # 3. Multiple regions score (0-1)
        avg_regions = np.mean([m['num_regions'] for m in recent_motion])
        scores['multiple_regions'] = min(avg_regions / 3.0, 1.0)  # 3+ regions is max
        
        # 4. Erratic movement score (0-1)
        is_erratic, changes = self.detect_erratic_pattern()
        scores['erratic_movement'] = min(changes / config.ERRATIC_MOVEMENT_COUNT, 1.0)
        
        # Weighted average
        weights = {
            'sustained_motion': 0.1,    # Very low priority
            'intensity': 0.3,
            'multiple_regions': 0.1,
            'erratic_movement': 0.5     # Very high priority - fighting is erratic
        }
        
        violence_score = sum(scores[k] * weights[k] for k in scores)
        
        # PENALTY: Violence usually involves multiple people
        # If only one person is detected, reduce the score significantly
        # unless it's extremely high intensity
        recent_people = [m.get('people_count', 0) for m in recent_motion]
        avg_people = np.mean(recent_people) if recent_people else 0
        
        if avg_people < 1.5: # Mostly 1 person
            violence_score *= 0.5
            
        return violence_score, scores


# Legacy function for backward compatibility
def detect_motion(prev_frame, curr_frame):
    """Basic motion detection - legacy interface"""
    detector = MotionDetector('basic')
    return detector.detect_motion(prev_frame, curr_frame)
