// Records the rendered stage and the source video's soundtrack, entirely locally.
export function setupRecording({canvas,media,button,status,download,lockedControls}){
 let audioContext,source,destination,recorder,stream,chunks=[],url,timer,starting=false,savedMuted=false,savedVolume=1,failed=false;
 const supported=typeof MediaRecorder!=='undefined'&&typeof canvas.captureStream==='function'&&!!(window.AudioContext||window.webkitAudioContext);
 button.disabled=!supported;
 if(!supported){button.textContent='Recording unavailable';button.title='Use a browser with MediaRecorder support, such as Chrome, Edge or Safari';return;}
 button.title='Record from the start with original audio; click again to stop and download';
 function lock(value){for(const control of lockedControls)control.disabled=value;}
 function cleanup(){clearInterval(timer);stream?.getTracks().forEach(t=>t.stop());stream=null;media.muted=savedMuted;media.volume=savedVolume;document.querySelector('#mute').textContent=media.muted?'Sound off':'Sound on';starting=false;button.disabled=false;button.textContent='● Record video';button.classList.remove('recording');button.setAttribute('aria-pressed','false');lock(false);}
 function stop(){if(recorder?.state==='recording'){button.disabled=true;button.textContent='Saving…';recorder.stop();media.pause();}}
 async function rewind(){if(media.readyState<1)await new Promise((resolve,reject)=>{const timeout=setTimeout(()=>{clean();reject(Error('Video is not ready. Please try again shortly.'))},15000);function clean(){clearTimeout(timeout);media.removeEventListener('loadedmetadata',ready)}function ready(){clean();resolve()}media.addEventListener('loadedmetadata',ready)});if(media.currentTime<.001)return;await new Promise((resolve,reject)=>{const timeout=setTimeout(()=>{clean();reject(Error('Video seek timed out. Please retry.'))},10000);function clean(){clearTimeout(timeout);media.removeEventListener('seeked',ready)}function ready(){clean();resolve()}media.addEventListener('seeked',ready);media.currentTime=0;});}
 button.addEventListener('click',async()=>{
  if(recorder?.state==='recording'){stop();return;}if(starting)return;starting=true;button.disabled=true;button.textContent='Preparing…';savedMuted=media.muted;savedVolume=media.volume;lock(true);failed=false;
  try{
   if(!audioContext){audioContext=new (window.AudioContext||window.webkitAudioContext)();source=audioContext.createMediaElementSource(media);destination=audioContext.createMediaStreamDestination();source.connect(audioContext.destination);source.connect(destination);}
   await audioContext.resume();media.pause();await rewind();media.muted=false;media.volume=1;
   const mime=['video/mp4;codecs=avc1.42E01E,mp4a.40.2','video/webm;codecs=vp8,opus','video/webm','video/mp4'].find(t=>MediaRecorder.isTypeSupported(t));
   if(!mime)throw Error('No supported video encoder in this browser');
   stream=canvas.captureStream(30);const audio=destination.stream.getAudioTracks()[0];if(!audio)throw Error('Could not connect the source audio');stream.addTrack(audio.clone());
   chunks=[];recorder=new MediaRecorder(stream,{mimeType:mime,videoBitsPerSecond:8000000,audioBitsPerSecond:192000});
   recorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data)};
   recorder.onerror=()=>{failed=true;status.textContent='Recording failed. Please retry.';if(recorder.state!=='inactive')recorder.stop();else cleanup()};
   recorder.onstop=()=>{const type=recorder.mimeType;cleanup();if(failed||!chunks.length){if(!failed)status.textContent='No video was recorded. Please retry.';return;}const blob=new Blob(chunks,{type});if(url)URL.revokeObjectURL(url);url=URL.createObjectURL(blob);download.href=url;download.download=`Motion-Stage-${new Date().toISOString().replace(/[:.]/g,'-')}.${type.includes('mp4')?'mp4':'webm'}`;download.hidden=false;download.textContent='Download again';status.textContent='Recording complete. Downloading video with original audio.';download.click();};
   recorder.start(1000);await media.play();starting=false;button.disabled=false;button.classList.add('recording');button.setAttribute('aria-pressed','true');const start=performance.now();const tick=()=>{button.textContent=`■ Stop recording ${Math.floor((performance.now()-start)/1000)}s`};tick();timer=setInterval(tick,500);status.textContent='Recording stage and audio. Keep this tab in the foreground.';
  }catch(e){failed=true;if(recorder&&recorder.state!=='inactive')recorder.stop();else cleanup();status.textContent='Recording failed: '+e.message;}
 });
 media.addEventListener('ended',stop);
 window.addEventListener('pagehide',()=>{if(recorder?.state==='recording'){failed=true;recorder.stop()}stream?.getTracks().forEach(t=>t.stop());if(url)URL.revokeObjectURL(url)});
}
