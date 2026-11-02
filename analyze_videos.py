import cv2
import numpy as np
import os
import json

video_files = [
    'lyrics1st.mov',
    'parralexeffect2nd.mov',
    'lyrics3rd.mov',
    '4thtextures.mov',
    '5thcreativetextures.mov',
    'explainertype6th.mov',
    'headexplainer7th.mov',
    '3dediting.mov'
]

os.makedirs('thumbnails', exist_ok=True)
results = []

for vf in video_files:
    vpath = os.path.join('videos', vf)
    if not os.path.exists(vpath):
        continue
    cap = cv2.VideoCapture(vpath)
    if not cap.isOpened():
        print(f"Could not open {vf}")
        continue

    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    fps = cap.get(cv2.CAP_PROP_FPS) or 24.0
    frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    duration_sec = frame_count / fps if fps > 0 else 0

    mins = int(duration_sec // 60)
    secs = int(duration_sec % 60)
    duration_str = f"{mins:02d}:{secs:02d}"

    # Determine aspect ratio string
    ratio = width / height if height > 0 else 16/9
    if abs(ratio - 2.39) < 0.2:
        aspect_str = "2.39:1 CINEMASCOPE"
    elif abs(ratio - 16/9) < 0.15:
        aspect_str = "16:9 4K"
    elif abs(ratio - 9/16) < 0.15:
        aspect_str = "9:16 VERTICAL"
    elif abs(ratio - 4/5) < 0.15:
        aspect_str = "4:5 SOCIAL"
    elif abs(ratio - 1.0) < 0.15:
        aspect_str = "1:1 SQUARE"
    else:
        aspect_str = f"{width}:{height}"

    # Sample several frames to get representative colors and best thumbnail
    sample_indices = [int(frame_count * p) for p in [0.15, 0.3, 0.5, 0.7, 0.85] if int(frame_count * p) < frame_count]
    if not sample_indices:
        sample_indices = [0]

    frames = []
    for idx in sample_indices:
        cap.set(cv2.CAP_PROP_POS_FRAMES, idx)
        ret, frame = cap.read()
        if ret:
            frames.append(frame)

    cap.release()

    if not frames:
        print(f"No frames read from {vf}")
        continue

    # Pick the frame with highest variance/richness as thumbnail
    variances = [np.var(f) for f in frames]
    best_frame_idx = int(np.argmax(variances))
    thumb_frame = frames[best_frame_idx]

    # Save thumbnail
    thumb_name = os.path.splitext(vf)[0] + '.jpg'
    thumb_path = os.path.join('thumbnails', thumb_name)
    cv2.imwrite(thumb_path, thumb_frame, [cv2.IMWRITE_JPEG_QUALITY, 92])

    # Color analysis across sampled frames
    all_pixels = np.vstack([cv2.resize(f, (64, 36)).reshape(-1, 3) for f in frames]) # BGR
    # Convert to RGB
    all_pixels_rgb = all_pixels[:, [2, 1, 0]].astype(np.float32)

    # Calculate mean and vibrant percentiles
    mean_rgb = np.mean(all_pixels_rgb, axis=0)
    std_rgb = np.std(all_pixels_rgb, axis=0)

    # Use k-means to find 4 dominant colors
    criteria = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 10, 1.0)
    flags = cv2.KMEANS_RANDOM_CENTERS
    _, labels, centers = cv2.kmeans(all_pixels_rgb, 4, None, criteria, 10, flags)

    # Sort centers by saturation/brightness to find vibrant accent vs dark bg
    centers_rgb = centers.astype(int)
    # Convert centers to HSV to evaluate saturation
    hsv_centers = [cv2.cvtColor(np.uint8([[c]]), cv2.COLOR_RGB2HSV)[0][0] for c in centers_rgb]

    # Accent color: highest saturation, or highest brightness if low saturation
    scores = [int(h[1]) * 2 + int(h[2]) for h in hsv_centers]
    accent_idx = int(np.argmax(scores))
    accent_rgb = centers_rgb[accent_idx]

    # Dark background: tint towards the dominant hue, but keep dark (< 25 luminance)
    dominant_hue = hsv_centers[accent_idx][0]
    # Create dark bg: H=dominant_hue, S=moderate (40-90), V=dark (10-20)
    sat = min(80, max(25, int(hsv_centers[accent_idx][1] * 0.4)))
    dark_hsv = np.uint8([[[dominant_hue, sat, 14]]])
    dark_bg_rgb = cv2.cvtColor(dark_hsv, cv2.COLOR_HSV2RGB)[0][0]

    arc_hsv = np.uint8([[[dominant_hue, sat, 22]]])
    arc_rgb = cv2.cvtColor(arc_hsv, cv2.COLOR_HSV2RGB)[0][0]

    def rgb_to_hex(rgb):
        return f"#{int(rgb[0]):02x}{int(rgb[1]):02x}{int(rgb[2]):02x}"

    bg_hex = rgb_to_hex(dark_bg_rgb)
    arc_hex = rgb_to_hex(arc_rgb)
    accent_hex = rgb_to_hex(accent_rgb)

    # If accent is too dark or washed out, brighten it
    acc_hsv = cv2.cvtColor(np.uint8([[accent_rgb]]), cv2.COLOR_RGB2HSV)[0][0]
    if acc_hsv[2] < 140:
        boosted_hsv = np.uint8([[[acc_hsv[0], max(100, acc_hsv[1]), 220]]])
        accent_hex = rgb_to_hex(cv2.cvtColor(boosted_hsv, cv2.COLOR_HSV2RGB)[0][0])

    results.append({
        'filename': vf,
        'thumb': thumb_name,
        'width': width,
        'height': height,
        'aspect': aspect_str,
        'duration': duration_str,
        'bg': bg_hex,
        'arc': arc_hex,
        'accent': accent_hex,
        'sample_hsv': [int(x) for x in hsv_centers[accent_idx]]
    })

print(json.dumps(results, indent=2))
