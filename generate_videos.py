import cv2
import numpy as np
import os

os.makedirs('videos', exist_ok=True)

videos = [
    ('showreel.mp4', 'CUT. GRADE. COMPOSE.', (234, 179, 8)),
    ('midnight.mp4', 'ECHOES OF MIDNIGHT', (56, 189, 248)),
    ('overdrive.mp4', 'OVERDRIVE SYMPHONY', (244, 63, 94)),
    ('quantum.mp4', 'QUANTUM HORIZON', (168, 85, 247)),
    ('terra.mp4', 'TERRA INCOGNITA', (16, 185, 129)),
    ('aura.mp4', 'AURA HAUTE COUTURE', (249, 115, 22)),
]

width, height = 640, 360
fps = 24
num_frames = 48  # 2 seconds each

fourcc = cv2.VideoWriter_fourcc(*'mp4v')

for filename, title, color_bgr in videos:
    path = os.path.join('videos', filename)
    out = cv2.VideoWriter(path, fourcc, fps, (width, height))

    for f in range(num_frames):
        # Create cinematic frame
        frame = np.zeros((height, width, 3), dtype=np.uint8)
        # Subtle pulsing background
        t = f / fps
        pulse = int(25 + 15 * np.sin(t * 3))
        frame[:] = (pulse // 2, pulse // 3, pulse)

        # 2.39:1 Letterbox bars
        frame[0:40, :] = 0
        frame[height - 40:height, :] = 0

        # Animate moving scanline or bar
        cx = int((f * 14) % width)
        cv2.line(frame, (cx, 40), (cx, height - 40), color_bgr, 1)

        # Audio visualizer bars
        for b in range(24):
            bar_h = int(15 + 20 * np.abs(np.sin(t * 5 + b * 0.4)))
            cv2.rectangle(frame, (180 + b * 12, 260 - bar_h), (180 + b * 12 + 6, 260), color_bgr, -1)

        # Running timecode
        tc = f"01:00:{f // 24:02d}:{f % 24:02d}"
        cv2.putText(frame, tc, (width // 2 - 50, 300), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (200, 210, 220), 1, cv2.LINE_AA)
        cv2.putText(frame, title, (width // 2 - 120, 150), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2, cv2.LINE_AA)
        cv2.putText(frame, "REC [4K PRORES]", (50, 70), cv2.FONT_HERSHEY_SIMPLEX, 0.4, color_bgr, 1, cv2.LINE_AA)

        out.write(frame)

    out.release()
    print(f"Generated {path}")
