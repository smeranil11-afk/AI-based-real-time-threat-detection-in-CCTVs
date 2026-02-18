"""
Enhanced Video Input Module
Supports webcam, video files, and RTSP streams
"""
import cv2
import config

class VideoInput:
    def __init__(self, source=None):
        """
        Initialize video input
        source: camera ID (int), video file path (str), or RTSP URL (str)
        """
        self.source = source if source is not None else config.CAMERA_ID
        self.cap = None
        self.frame_count = 0
        self.is_camera = isinstance(self.source, int)
        
    def open(self):
        """Open video source"""
        self.cap = cv2.VideoCapture(self.source)
        
        if not self.cap.isOpened():
            raise RuntimeError(f"Failed to open video source: {self.source}")
        
        # Set camera properties if using webcam
        if self.is_camera:
            self.cap.set(cv2.CAP_PROP_FRAME_WIDTH, config.FRAME_WIDTH)
            self.cap.set(cv2.CAP_PROP_FRAME_HEIGHT, config.FRAME_HEIGHT)
            self.cap.set(cv2.CAP_PROP_FPS, config.FPS)
        
        print(f"✓ Video source opened: {self.source}")
        return self.cap
    
    def read_frame(self):
        """Read and preprocess a frame"""
        ret, frame = self.cap.read()
        if ret:
            self.frame_count += 1
            # Resize frame for consistent processing
            frame = cv2.resize(frame, (config.FRAME_WIDTH, config.FRAME_HEIGHT))
        return ret, frame
    
    def get_fps(self):
        """Get actual FPS of the video source"""
        if self.cap:
            return self.cap.get(cv2.CAP_PROP_FPS)
        return config.FPS
    
    def get_total_frames(self):
        """Get total number of frames (for video files)"""
        if self.cap and not self.is_camera:
            return int(self.cap.get(cv2.CAP_PROP_FRAME_COUNT))
        return None
    
    def release(self):
        """Release video capture"""
        if self.cap:
            self.cap.release()
            print("✓ Video source released")
    
    def __enter__(self):
        """Context manager entry"""
        self.open()
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        """Context manager exit"""
        self.release()


def get_camera(source=None):
    """
    Legacy function for backward compatibility
    Returns VideoCapture object
    """
    video_input = VideoInput(source)
    return video_input.open()
