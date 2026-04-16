// ======================================
// article-screen-recording.js — Screen recording via getDisplayMedia
// ======================================
// Lazy-loaded by article-presentation.js when user clicks "Record"
// Exposes: window.StudyRoomScreenRecording

(function () {
  'use strict';

  /**
   * Create a screen recording controller.
   * @param {Object} deps
   * @param {HTMLElement} deps.root - document.documentElement
   * @param {Function} deps.getLang - returns 'zh' or 'en'
   * @param {Function} deps.getLabel - returns i18n label
   * @param {Function} deps.sanitizeFileName - sanitize filename
   * @param {Function} deps.enterPresentation - enter presentation mode
   * @param {Function} deps.setPresentationStep - set step index
   * @param {Function} deps.ensureNarrationController - returns Promise<controller>
   * @param {Function} deps.showCountdown - show countdown overlay then call callback
   * @param {Function} deps.handleAutoPlayClick - trigger narration start
   * @param {Function} deps.getPresentSteps - returns presentSteps array
   * @param {Function} deps.getState - returns presentation state object
   * @param {HTMLElement|null} deps.presentationTip - tip element
   * @returns {Object} recording controller
   */
  window.StudyRoomScreenRecording = function (deps) {
    var mediaRecorder = null;
    var recordedChunks = [];
    var recordingStream = null;

    var isRecording = function () {
      return mediaRecorder && mediaRecorder.state === 'recording';
    };

    var stopRecording = function () {
      if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
      }
      if (recordingStream) {
        recordingStream.getTracks().forEach(function (t) { t.stop(); });
        recordingStream = null;
      }
      deps.root.classList.remove('is-recording');
    };

    var toggle = function () {
      // If already recording, stop
      if (isRecording()) {
        stopRecording();
        return;
      }

      // Check API support
      if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
        window.alert(deps.getLang() === 'zh' ? '当前浏览器不支持屏幕录制' : 'Screen recording is not supported in this browser');
        return;
      }

      // Step 1: Request screen capture first (browser dialog)
      navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
        systemAudio: 'include'
      }).then(function (stream) {
        // Step 2: Show "preparing" overlay
        var prepOverlay = document.createElement('div');
        prepOverlay.className = 'present-countdown-overlay';
        prepOverlay.innerHTML = '<span class="present-countdown-num is-animating">' +
          (deps.getLang() === 'zh' ? '准备中…' : 'Preparing…') + '</span>';
        document.body.appendChild(prepOverlay);

        // Step 3: Enter presentation mode if not already
        var state = deps.getState();
        if (!state.enabled) {
          deps.enterPresentation();
        }
        deps.setPresentationStep(0);

        var presentSteps = deps.getPresentSteps();

        // Step 4: Pre-generate first slide narrative
        deps.ensureNarrationController().then(function (ctrl) {
          return ctrl.pregenerate(presentSteps, 0, deps.getLang);
        }).then(function () {
          // Step 5: Remove prep overlay, show countdown
          if (prepOverlay.parentNode) prepOverlay.parentNode.removeChild(prepOverlay);

          deps.showCountdown(function () {
            // Step 6: 1s pause, then start recording + narration
            setTimeout(function () {
              startMediaRecorder(stream, presentSteps);
            }, 1000);
          });
        }).catch(function () {
          // Pregen failed — still proceed
          if (prepOverlay.parentNode) prepOverlay.parentNode.removeChild(prepOverlay);
          deps.showCountdown(function () {
            setTimeout(function () {
              startMediaRecorder(stream, presentSteps);
              deps.handleAutoPlayClick();
            }, 1000);
          });
        });
      }).catch(function () {
        // User cancelled screen capture dialog — do nothing
      });
    };

    var startMediaRecorder = function (stream, presentSteps) {
      recordingStream = stream;
      recordedChunks = [];

      var mimeType = 'video/webm;codecs=vp9,opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) mimeType = 'video/webm;codecs=vp8,opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) mimeType = 'video/webm';

      mediaRecorder = new MediaRecorder(stream, { mimeType: mimeType });
      mediaRecorder.ondataavailable = function (e) {
        if (e.data && e.data.size > 0) recordedChunks.push(e.data);
      };
      mediaRecorder.onstop = function () {
        var blob = new Blob(recordedChunks, { type: mimeType });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = deps.sanitizeFileName(document.title || 'presentation') + '.webm';
        document.body.appendChild(a); a.click(); document.body.removeChild(a);
        setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
        recordedChunks = [];
        if (deps.presentationTip) {
          var origTip = deps.presentationTip.textContent;
          deps.presentationTip.textContent = deps.getLabel('recordSaved');
          setTimeout(function () { deps.presentationTip.textContent = origTip; }, 3000);
        }
      };

      var videoTracks = stream.getVideoTracks();
      if (videoTracks.length) {
        videoTracks[0].addEventListener('ended', function () {
          if (isRecording()) stopRecording();
        });
      }

      mediaRecorder.start(1000);
      deps.root.classList.add('is-recording');

      // Start narration
      deps.ensureNarrationController().then(function (ctrl) {
        ctrl.start(presentSteps, 0, deps.getLang);
      }).catch(function () {});
    };

    return {
      toggle: toggle,
      isRecording: isRecording,
      stop: stopRecording
    };
  };
})();
