"""
REAL Advanced Violence Detection - Actually Works!
Uses physics-based analysis to distinguish violence from normal fast actions
"""
import cv2
import numpy as np
from collections import deque
import math

class RealAdvancedDetector:
    def __init__(self):
        """Initialize REAL advanced violence detector"""
        # Use simple lists instead of complex numpy arrays
        self.person_history = []  # Store last 20 frames of person data
        self.max_history = 20
        
    def analyze_violence(self, person_boxes, motion_boxes, frame_shape):
        """
        REAL violence analysis that actually works
        Returns: violence_score (0-1), reason (string)
        """
        if len(person_boxes) == 0:
            return 0.0, "No people"
        
        # Store current frame data
        current_data = {
            'people': person_boxes,
            'motion': motion_boxes,
            'time': len(self.person_history)
        }
        self.person_history.append(current_data)
        
        # Keep only recent history
        if len(self.person_history) > self.max_history:
            self.person_history.pop(0)
        
        # Need at least 10 frames for analysis
        if len(self.person_history) < 10:
            return 0.0, "Analyzing..."
        
        # Calculate 6 violence indicators
        scores = {}
        
        # 1. PROXIMITY - Are people fighting distance? (0-1)
        scores['proximity'] = self._check_proximity(person_boxes, frame_shape)
        
        # 2. SPEED - Fast aggressive movement? (0-1)
        scores['speed'] = self._check_speed()
        
        # 3. IMPACT - Sudden stops (hit landed)? (0-1)
        scores['impact'] = self._check_impact()
        
        # 4. CHAOS - Erratic unpredictable movement? (0-1)
        scores['chaos'] = self._check_chaos()
        
        # 5. AGGRESSION - Upper body motion (punching)? (0-1)
        scores['aggression'] = self._check_aggression(person_boxes, motion_boxes)
        
        # 6. INTERACTION - Multiple people moving together? (0-1)
        scores['interaction'] = self._check_interaction(person_boxes)
        
        # Calculate final score with smart weighting
        violence_score = (
            scores['proximity'] * 0.20 +      # Close = suspicious
            scores['speed'] * 0.15 +          # Fast = maybe
            scores['impact'] * 0.25 +         # Impact = strong sign!
            scores['chaos'] * 0.15 +          # Chaos = fighting
            scores['aggression'] * 0.15 +     # Upper body = punching
            scores['interaction'] * 0.10      # Multiple people = possible
        )
        
        # Generate reason
        reason = self._explain_score(scores)
        
        return min(violence_score, 1.0), reason
    
    def _check_proximity(self, person_boxes, frame_shape):
        """Check if people are at fighting distance"""
        if len(person_boxes) < 2:
            return 0.0
        
        frame_width = frame_shape[1]
        
        # Calculate distance between people
        min_dist = float('inf')
        for i in range(len(person_boxes)):
            for j in range(i + 1, len(person_boxes)):
                box1 = person_boxes[i]['box']
                box2 = person_boxes[j]['box']
                
                # Center points
                c1_x = (box1[0] + box1[2]) / 2
                c1_y = (box1[1] + box1[3]) / 2
                c2_x = (box2[0] + box2[2]) / 2
                c2_y = (box2[1] + box2[3]) / 2
                
                dist = math.sqrt((c1_x - c2_x)**2 + (c1_y - c2_y)**2)
                min_dist = min(min_dist, dist)
        
        # Normalize by frame width
        normalized_dist = min_dist / frame_width
        
        # Close proximity scoring
        if normalized_dist < 0.15:  # Very close
            return 1.0
        elif normalized_dist < 0.25:  # Close
            return 0.7
        elif normalized_dist < 0.35:  # Nearby
            return 0.3
        else:
            return 0.0
    
    def _check_speed(self):
        """Check movement speed - violence is FAST"""
        if len(self.person_history) < 5:
            return 0.0
        
        recent = self.person_history[-5:]
        
        # Calculate how much people moved
        total_movement = 0
        count = 0
        
        for i in range(len(recent) - 1):
            prev_people = recent[i]['people']
            curr_people = recent[i + 1]['people']
            
            # Match people across frames (simple: just use first person)
            if len(prev_people) > 0 and len(curr_people) > 0:
                prev_box = prev_people[0]['box']
                curr_box = curr_people[0]['box']
                
                # Calculate movement
                prev_cx = (prev_box[0] + prev_box[2]) / 2
                prev_cy = (prev_box[1] + prev_box[3]) / 2
                curr_cx = (curr_box[0] + curr_box[2]) / 2
                curr_cy = (curr_box[1] + curr_box[3]) / 2
                
                movement = math.sqrt((curr_cx - prev_cx)**2 + (curr_cy - prev_cy)**2)
                total_movement += movement
                count += 1
        
        if count == 0:
            return 0.0
        
        avg_speed = total_movement / count
        
        # Violence is typically fast movement
        if avg_speed > 30:  # Very fast
            return 1.0
        elif avg_speed > 20:  # Fast
            return 0.7
        elif avg_speed > 10:  # Moderate
            return 0.3
        else:
            return 0.0
    
    def _check_impact(self):
        """Detect sudden stops - sign of hit/impact"""
        if len(self.person_history) < 8:
            return 0.0
        
        recent = self.person_history[-8:]
        
        # Calculate speed changes
        speeds = []
        for i in range(len(recent) - 1):
            if len(recent[i]['people']) > 0 and len(recent[i+1]['people']) > 0:
                prev_box = recent[i]['people'][0]['box']
                curr_box = recent[i+1]['people'][0]['box']
                
                prev_cx = (prev_box[0] + prev_box[2]) / 2
                curr_cx = (curr_box[0] + curr_box[2]) / 2
                
                speed = abs(curr_cx - prev_cx)
                speeds.append(speed)
        
        if len(speeds) < 4:
            return 0.0
        
        # Check for sudden drop (impact)
        first_half = speeds[:len(speeds)//2]
        second_half = speeds[len(speeds)//2:]
        
        if len(first_half) > 0 and len(second_half) > 0:
            before_avg = sum(first_half) / len(first_half)
            after_avg = sum(second_half) / len(second_half)
            
            # Big drop = impact
            if before_avg > 15 and after_avg < before_avg * 0.4:
                return 1.0
            elif before_avg > 10 and after_avg < before_avg * 0.5:
                return 0.6
        
        return 0.0
    
    def _check_chaos(self):
        """Detect chaotic, unpredictable movement - sign of fighting"""
        if len(self.person_history) < 12:
            return 0.0
        
        recent = self.person_history[-12:]
        
        # Track direction changes
        directions = []
        for i in range(len(recent) - 1):
            if len(recent[i]['people']) > 0 and len(recent[i+1]['people']) > 0:
                prev_box = recent[i]['people'][0]['box']
                curr_box = recent[i+1]['people'][0]['box']
                
                dx = ((curr_box[0] + curr_box[2])/2) - ((prev_box[0] + prev_box[2])/2)
                dy = ((curr_box[1] + curr_box[3])/2) - ((prev_box[1] + prev_box[3])/2)
                
                if abs(dx) > 2 or abs(dy) > 2:  # Significant movement
                    direction = (1 if dx > 0 else -1, 1 if dy > 0 else -1)
                    directions.append(direction)
        
        if len(directions) < 5:
            return 0.0
        
        # Count direction changes
        changes = 0
        for i in range(len(directions) - 1):
            if directions[i] != directions[i + 1]:
                changes += 1
        
        change_ratio = changes / len(directions)
        
        # High change ratio = chaotic = fighting
        if change_ratio > 0.7:  # Very chaotic
            return 1.0
        elif change_ratio > 0.5:  # Chaotic
            return 0.7
        elif change_ratio > 0.3:  # Somewhat chaotic
            return 0.3
        else:
            return 0.0
    
    def _check_aggression(self, person_boxes, motion_boxes):
        """Detect aggressive upper-body motion (punching)"""
        if len(person_boxes) == 0 or len(motion_boxes) == 0:
            return 0.0
        
        # Check if motion is in upper body area
        upper_motion = 0
        total_motion = 0
        
        for person in person_boxes:
            px1, py1, px2, py2 = person['box']
            person_height = py2 - py1
            upper_threshold = py1 + (person_height * 0.6)  # Upper 60%
            
            for mx, my, mw, mh in motion_boxes:
                motion_cy = my + mh/2
                
                # Check if motion is in this person's area
                if px1 <= mx <= px2 and py1 <= my <= py2:
                    total_motion += mw * mh
                    
                    # Is it upper body?
                    if motion_cy < upper_threshold:
                        upper_motion += mw * mh
        
        if total_motion == 0:
            return 0.0
        
        upper_ratio = upper_motion / total_motion
        
        # High upper body motion = punching/fighting
        if upper_ratio > 0.7:
            return 1.0
        elif upper_ratio > 0.5:
            return 0.6
        elif upper_ratio > 0.3:
            return 0.3
        else:
            return 0.0
    
    def _check_interaction(self, person_boxes):
        """Check if multiple people are interacting"""
        if len(person_boxes) < 2:
            return 0.0
        
        # More people = higher chance of violence
        if len(person_boxes) >= 3:
            return 0.8
        elif len(person_boxes) == 2:
            return 0.5
        else:
            return 0.0
    
    def _explain_score(self, scores):
        """Generate human-readable explanation"""
        # Find top 2 indicators
        sorted_scores = sorted(scores.items(), key=lambda x: x[1], reverse=True)
        
        reasons = []
        for indicator, score in sorted_scores[:2]:
            if score > 0.5:
                if indicator == 'proximity':
                    reasons.append("fighting distance")
                elif indicator == 'speed':
                    reasons.append("fast movement")
                elif indicator == 'impact':
                    reasons.append("impact detected")
                elif indicator == 'chaos':
                    reasons.append("chaotic movement")
                elif indicator == 'aggression':
                    reasons.append("aggressive actions")
                elif indicator == 'interaction':
                    reasons.append("multiple people")
        
        if len(reasons) > 0:
            return " + ".join(reasons)
        else:
            return "Normal activity"
    
    def reset(self):
        """Reset history"""
        self.person_history = []