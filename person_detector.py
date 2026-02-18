"""
Person Detection Module using YOLO
Detects people in frames before checking for violence
OPTIMIZED FOR SPEED
"""
from ultralytics import YOLO
import cv2
import numpy as np

class PersonDetector:
    def __init__(self):
        """Initialize YOLO model for person detection"""
        print("Loading person detection model...")
        # Load YOLOv8 nano model (fast and lightweight)
        self.model = YOLO('yolov8n.pt')  # Fixed: removed duplicate
        print("✓ Person detection ready!")
    
    def detect_people(self, frame):
        """
        Detect people in frame (OPTIMIZED FOR SPEED)
        Returns: people_detected (bool), person_boxes (list)
        """
        # Run YOLO detection (only detect people - class 0)
        # Use conf=0.6 for faster processing (skip low confidence)
        results = self.model(frame, classes=[0], verbose=False, conf=0.6)
        
        person_boxes = []
        people_detected = False
        
        # Extract person bounding boxes
        for result in results:
            boxes = result.boxes
            for box in boxes:
                # Get box coordinates
                x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()
                confidence = box.conf[0].cpu().numpy()
                
                # Only include high confidence detections
                if confidence > 0.5:
                    people_detected = True
                    person_boxes.append({
                        'box': (int(x1), int(y1), int(x2), int(y2)),
                        'confidence': float(confidence)
                    })
        
        return people_detected, person_boxes
    
    def draw_person_boxes(self, frame, person_boxes):
        """Draw boxes around detected people - THICK and VISIBLE"""
        for person in person_boxes:
            x1, y1, x2, y2 = person['box']
            
            # Draw THICK green box around person
            cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 3)  # Thickness 3!
            
            # Add label background
            label = f"Person {person['confidence']:.2f}"
            label_size = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.6, 2)[0]
            cv2.rectangle(frame, (x1, y1 - label_size[1] - 10), 
                         (x1 + label_size[0], y1), (0, 255, 0), -1)
            cv2.putText(frame, label, (x1, y1 - 5),
                       cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 0), 2)
        
        return frame
    
    def create_person_mask(self, frame, person_boxes):
        """
        Create a mask showing only person regions
        Used to filter motion detection to people only
        """
        mask = np.zeros(frame.shape[:2], dtype=np.uint8)
        
        for person in person_boxes:
            x1, y1, x2, y2 = person['box']
            # Fill person region with white
            cv2.rectangle(mask, (x1, y1), (x2, y2), 255, -1)
        
        return mask
    