#!/usr/bin/env python3
import subprocess
import os

# Duration: 69:25 = 4165 seconds
total_duration = 4165
num_segments = 19
segment_duration = total_duration / num_segments

print(f"Total duration: {total_duration} seconds ({total_duration/60:.1f} minutes)")
print(f"Creating {num_segments} segments of {segment_duration:.1f} seconds each\n")

for i in range(num_segments):
    start_time = int(i * segment_duration)
    duration = int(segment_duration)
    output_file = f"songs/segment_{i:02d}.mp3"
    
    cmd = [
        'ffmpeg', '-i', 'songs/90s Bollywood All Time Hit Songs 90s Evergreen Songs 90s Hits Hindi Songs 90s Old Is Gold Songs.mp3',
        '-ss', str(start_time),
        '-t', str(duration),
        '-q:a', '5',
        '-y',
        '-loglevel', 'error',
        output_file
    ]
    
    print(f"[{i+1:2d}/19] {output_file} ({start_time/60:.1f}m - {(start_time+duration)/60:.1f}m)...", end=' ', flush=True)
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode == 0:
        size = os.path.getsize(output_file) / 1024 / 1024
        print(f"✓ ({size:.1f}MB)")
    else:
        print(f"✗ Error: {result.stderr[:50]}")

print("\nDone! All segments created successfully!")
