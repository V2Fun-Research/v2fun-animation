# -*- coding: utf-8 -*-
"""Read MP4 movie duration without decoding; use ffprobe for other formats."""
import json, shutil, struct, subprocess
from pathlib import Path

def duration(path):
    path=Path(path)
    if path.suffix.lower() in {'.mp4','.mov','.m4v'}:
        with path.open('rb') as f:
            def scan(end):
                while f.tell()+8<=end:
                    start=f.tell();head=f.read(8);size,kind=struct.unpack('>I4s',head)
                    if size==1:size=struct.unpack('>Q',f.read(8))[0]
                    if size==0:size=end-start
                    if size<8 or start+size>end:raise ValueError('Invalid MP4 atom')
                    if kind==b'moov':
                        result=scan(start+size)
                        if result is not None:return result
                    elif kind==b'mvhd':
                        b=f.read(min(size-8,40));version=b[0]
                        if version==0:scale,ticks=struct.unpack('>II',b[12:20])
                        elif version==1:scale,ticks=struct.unpack('>IQ',b[20:32])
                        else:raise ValueError('Unsupported MP4 version')
                        if scale and ticks:return ticks/scale
                    f.seek(start+size)
            value=scan(path.stat().st_size)
            if value is not None:return value
    probe=shutil.which('ffprobe')
    if not probe:raise ValueError('Cannot read duration; provide an MP4 with mvhd or install ffprobe')
    info=json.loads(subprocess.check_output([probe,'-v','error','-show_format','-of','json',str(path)]))
    return float(info['format']['duration'])
