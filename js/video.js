; (function (doc) {
  var t = null,
    dt = null,
    pt = null;
  
  var MswVideo = function (dom, opt) {
    this.videoBox = doc.getElementById(dom);
    this.setDom();

    this.src = opt.src;
    this.autoplay = opt.autoplay || false;
    this.preload = this.autoplay ? false : (opt.preload || false);
    this.volume = opt.volume / 100 || 1;

    this.muted = false; // 是否静音
    this.volumeBarShow = false; // 音量条是否显示
    this.isFullScreen = false; // 是否全屏
    this.loop = opt.loop || false; // 是否重新播放

    this.init();
  }

  MswVideo.prototype = {
    init: function () {
      this.setOptions();
      this.bindEvent();
      this.autoplay && addVideoTip(this.videoBox, 'loading');

      var _self = this;

      dt = setTimeout(function () {
        _self.setControlBar(true);
      }, 5000);
    },

    setDom: function () {
      this.vid = this.videoBox.getElementsByClassName('video-tag')[0];
      this.oPlayBtn = this.videoBox.getElementsByClassName('play-img')[0];
      this.oCurrentTime = this.videoBox.getElementsByClassName('current-time')[0];
      this.oDurationTime = this.videoBox.getElementsByClassName('duration')[0];

      this.oRateArea = this.videoBox.getElementsByClassName('playrate-area')[0];
      this.oRateBtn = this.oRateArea.getElementsByClassName('playrate')[0];
      this.oRateList = this.oRateArea.getElementsByClassName('playrate-list')[0];
      this.oRateBtns = this.oRateList.getElementsByClassName('item');

      this.oVolumeArea = this.videoBox.getElementsByClassName('volume-area')[0];
      this.oVolumeBtn = this.oVolumeArea.getElementsByClassName('volume-img')[0];
      this.oVolumeBar = this.oVolumeArea.getElementsByClassName('volume-bar')[0];
      this.oVolumeSlideBar = this.oVolumeBar.getElementsByClassName('slide-bar')[0];
      this.oVolumeSlider = this.oVolumeBar.getElementsByClassName('volume-slide')[0];
      this.oVolumeRound = this.oVolumeSlider.getElementsByClassName('round')[0];

      this.oFullscreenBtn = this.videoBox.getElementsByClassName('fullscreen-img')[0];

      this.oVidHeader = this.videoBox.getElementsByClassName('vid-hd')[0];
      this.oControlBar = this.videoBox.getElementsByClassName('control-bar')[0];

      this.oProgressBar = this.videoBox.getElementsByClassName('progress-bar')[0];
      this.oPlayProgress = this.oProgressBar.getElementsByClassName('play-progress')[0];
      this.oPreloadProgress = this.oProgressBar.getElementsByClassName('preload-progress')[0];
      this.oPlayRound = this.oPlayProgress.getElementsByClassName('round')[0]; 
    },

    bindEvent: function () {
      // 加载完毕可以播放事件
      this.videoBox.addEventListener('canplay', this._canplay.bind(this), false);
      // 正在播放事件
      this.videoBox.addEventListener('playing', this._playing.bind(this), false);
      this.vid.addEventListener('waiting', this._waiting.bind(this), false);
      this.vid.addEventListener('error', this._error.bind(this), false);
      this.vid.addEventListener('ended', this._ended.bind(this), false);
      this.vid.addEventListener('loadstart', this._loadstart.bind(this), false);

      this.oPlayBtn.addEventListener('click', this.playVideo.bind(this), false);
      this.oRateBtn.addEventListener('click', this.showRateList.bind(this, true), false);
      this.oRateArea.addEventListener('mouseleave', this.showRateList.bind(this, false), false);
      this.oRateList.addEventListener('click', this.setPlayRate.bind(this), false);
      this.oVolumeBtn.addEventListener('click', this.btnSetVolume.bind(this), false);
      this.oVolumeArea.addEventListener('mouseleave', this.showVolumeBar.bind(this, false), false);
      this.oVolumeRound.addEventListener('mousedown', this.slideVolumeBar.bind(this), false);
      this.oFullscreenBtn.addEventListener('click', this.setFullScreen.bind(this), false);

      this.videoBox.addEventListener('mousemove', this.showControlBar.bind(this), false);

      this.oProgressBar.addEventListener('click', this.progressClick.bind(this), false);
      this.oPlayRound.addEventListener('mousedown', this.progressChange.bind(this), false);
    },

    setOptions: function () {
      this.vid.src = this.src;
      this.vid.autoplay = this.autoplay;
      this.vid.preload = this.preload;
      this.vid.loop = this.loop;
      this.setVolume(this.volume, true);
    },

    setVolume: function (volume) {
      this.vid.volume = volume;
    },

    playVideo() {
      if (!this.vid.paused) {
        this.oPlayBtn.src = 'img/pause.png';
        this.vid.play();
      } else {
        this.oPlayBtn.src = 'img/play.png';
        this.vid.pause();
      }
    },

    setVideoState: function (isPlaying) {
      this.oPlayBtn.src = isPlaying ? 'img/pause.png' : 'img/play.png';
    },

    showControlBar: function() {
      // 类似于节流, 最开始的时候两侧是不隐藏的, 默认五秒不重新触发事件则隐藏
      clearTimeout(dt);
      dt = null;
      this.setControlBar(false);

      var _self = this;
      dt = setTimeout(function() {
        _self.setControlBar(true);
      }, 5000);
    },

    setControlBar: function(hide) {
      if (hide) {
        this.oVidHeader.className += 'hide';
        this.oControlBar.className += 'hide';
      } else {
        this.oVidHeader.className = 'vid-hd';
        this.oControlBar.className = 'control-bar';
      }
    },

    setSrc: function (src) {
      // 配置src
      this.vid.src = src;
      this.vid.load();
    },

    _canplay: function () {
      setTime(this.oDurationTime, this.vid.duration);

      var self = this,
        duration = this.videoBox.duration,
        preloadProgress = 0,
        progressBarWidth = this.oProgressBar.offsetWidth;

      pt = setInterval(function() {
        preloadProgress = _self.vid.buffered.end(0);
        self.oPreloadProgress.style.width = (preloadProgress / duration) * 100 + '%';

        // 缓存完成的时候, 清除掉定时器
        if (self.oPreloadProgress.offsetWidth >= progressBarWidth) {
          clearInterval(pt);
          pt = null;
        }
      }, 1000);
    },

    _waiting: function () { 
      addVideoTip(this.videoBox, 'loading');
    },

    _error: function () { 
      removeVideoTip(this.videoBox);
      addVideoTip(this.videoBox, 'error');
    },

    _ended: function () { 
      removeVideoTip(this.videoBox);
      addVideoTip(this.videoBox, 'ended');
    },

    _loadstart: function () {
      removeVideoTip(this.videoBox);
      addVideoTip(this.videoBox, 'loading');
     },

    _playing: function () {
      this.setVideoState(true);
      removeVideoTip(this.videoBox);

      var _self = this,
        duration = this.vid.duration,
        currentTime = 0,
        progressBarWidth = this.oProgressBar.offsetWidth;

      t = setInterval(function () {
        currentTime = _self.vid.currentTime;
        setTime(_self.currentTime, currentTime);
        _self.oPlayProgress.style.width = (currentTime / duration) * 100 + '%';

        if(_self.oPlayProgress.offsetWidth >= progressBarWidth) {
          clearInterval(t);
          t = null;
        }
      }, 1000);
    },

    showRateList: function (show) {
      if (show) {
        this.oRateList.className += ' show';
      } else {
        this.oRateList.className = 'playrate-list';
      }
    },

    setPlayRate: function (e) {
      var e = e || window.event,
        tar = e.target || e.srcElement,
        className = tar.className,
        rateBtn;
      if (className === 'rate-btn') {
        for (var i = 0; i < this.oRateBtns.length; i++) {
          rateBtn = this.oRateBtns[i].getElementsByClassName('rate-btn')[0];
          rateBtn.className = 'rate-btn';
        }

        this.vid.playbackRate = tar.getAttribute('data-rate');
        tar.className += ' current';
        this.showRateList(false);
      }
    },

    btnSetVolume: function () {
      if (!this.muted && !this.volumeBarShow) {
        this.showVolumeBar(true);
      } else if (!this.muted && this.volumeBarShow) {
        this.setMuted(true); // => 设置是否静音
        this.setVolume(0, true); // 设置音量, 如果静音那么音量直接归0且slider归0
      } else {
        this.setMuted(false);
        this.setVolume(this.volume, true);
      }
    },

    showVolumeBar: function (show) {
      if (show) {
        this.oVolumeBar.className += ' show';
        this.volumeBarShow = true; // flag
      } else {
        this.oVolumeBar.className = 'volume-bar';
        this.volumeBarShow = false;
      }
    },

    setMuted: function (muted) {
      if (muted) {
        this.vid.muted = true;
        this.muted = true;
        this.oVolumeBtn.src = 'img/volume-off.png';
      } else {
        this.vid.muted = false;
        this.muted = false;
        this.oVolumeBtn.src = 'img/volume.png';
      }
    },

    setVolume: function (volume, isChangeBar) {
      this.vid.volume = volume;
      isChangeBar && (this.oVolumeSlider.style.height = (volume * 100) + '%');
    },

    slideVolumeBar: function (e) {
      // bind会返回新的函数, 如果你要解绑监听器, 建议是保存一下fn.bind()
      var e = e || window.event,
        dy = e.pageY,
        my = 0,
        disY = 0, // 距离
        sHeight = 0,
        slideHeight = this.oVolumeSlideBar.offsetHeight,
        volumeBarHeight = this.oVolumeSlideBar.offsetHeight,
        _mousemove = _mouseMove.bind(this),
        _mouseup = _mouseUp.bind(this);

      doc.addEventListener('mousemove', _mousemove, false);
      doc.addEventListener('mouseup', _mouseup, false);

      function _mouseMove(e) {
        var e = e || window.event;
        my = e.pageY;
        disY = dy - my;
        sHeight = slideHeight + disY;

        if (sHeight < volumeBarHeight && sHeight > 0) {
          this.oVolumeSlider.style.height = sHeight + 'px';
          this.setMuted(false);
        } else if (sHeight >= volumeBarHeight) {
          // 两个顶点的场景sHeight也需要被限制住
          sHeight = volumeBarHeight;
          this.oVolumeSlider.style.height = volumeBarHeight + 'px';
        } else if(sHeight <= 0) {
          this.setMuted(true);
           // 两个顶点的场景sHeight也需要被限制住
          sHeight = 0;
          this.oVolumeSlider.style.height = 0 + 'px';
        }

        // 最后根据sHeight修改实际音频的音量
        this.volume = (sHeight / volumeBarHeight).toFixed(1);
        // 非静音状态的情况默认值为50%
        this.setVolume(this.volume, false);
        this.volume = Number(this.volume) == 0 ? 0.5 : this.volume;
      }

      function _mouseUp(e) {
        doc.removeEventListener('mousemove', _mousemove, false);
        doc.removeEventListener('mouseup', _mouseup, false);
      }
    },

    setFullScreen: function (e) {
      // 打开全屏的兼容性写法
      // Element.requestFullscreen(): 用于发出异步请求使元素进入全屏模式。
      if (!this.isFullScreen) {
        if (this.videoBox.requestFullscreen) {
          this.videoBox.requestFullscreen();
        } else if (this.videoBox.mozRequestFullscreen) {
          this.videoBox.mozRequestFullscreen();
        } else if (this.videoBox.msRequestFullscreen) {
          this.videoBox.msRequestFullscreen();
        } else if (this.videoBox.oRequestFullscreen) {
          this.videoBox.oRequestFullscreen();
        } else if (this.videoBox.webkitRequestFullscreen) {
          this.videoBox.webkitRequestFullscreen();
        }

        this.isFullScreen = true;
        this.oFullscreenBtn.src = 'img/fullscreen-exit.png';
      } else {
        if (doc.exitFullscreen) {
          doc.exitFullscreen();
        } else if (doc.mozExitFullscreen) {
          doc.mozExitFullscreen();
        } else if (doc.msExitFullscreen) {
          doc.msExitFullscreen();
        } else if (doc.oExitFullscreen) {
          doc.oExitFullscreen();
        } else if (doc.webkitExitFullscreen) {
          doc.webkitExitFullscreen();
        }

        this.isFullScreen = false;
        this.oFullscreenBtn.src = 'img/fullscreen.png';
      }
    },

    progressClick: function(e) {
      var e = e || window.event;
      this.setPlayProgress(e.pageX);
    },

    progressChange: function(e) {
      var _mousemove = _mouseMove.bind(this),
          _mouseup = _mouseUp.bind(this);

      doc.addEventListener('mousemove', _mousemove, false);
      doc.addEventListener('mouseup', _mouseup, false);

      function _mouseMove (e) {
        var  e = e || window.event; 
        this.setPlayProgress(e.pageX);
      }

      function _mouseUp () {
        doc.removeEventListener('mousemove', _mousemove, false);
        doc.removeEventListener('mouseup', _mouseup, false);
      }
    },

    setPlayProgress: function(pageX) {
      var duration = this.vid.duration,
        curProgressBarWidth = pageX - this.videoBox.offsetLeft,
        ratio = 0;
      if (curProgressBarWidth <= 0) {
        ratio = 0;
      } else if(curProgressBarWidth >= this.oProgressBar.offsetWidth) {
        ratio = 1;
      } else {
        ratio = curProgressBarWidth / this.oProgressBar.offsetWidth;
      }

      this.vid.currentTime = duration * ratio;
      setTime(this.oCurrentTime, this.vid.currentTime);
      this.setVideoState(true);
      this.vid.play();
      // 防止一直在loading的时候不进入_playing的话进度条不会立刻改变
      this.oPlayProgress.style.width = ratio * 100 + '%';
    }
  };

  function setTime(dom, time) {
    dom.innerText = timeFormat(time); // time: s
  }

  function addVideoTip(dom, type) {
    // 处理异常的tip
    var icon = '',
      text = '';
    switch (type) {
      case 'loading':
        icon = 'img/loading.gif';
        text = '加载中';
        break;
      case 'error':
        icon = 'img/error.png';
        text = '播放错误';
        break;
      case 'ended':
        icon = 'img/ended.png';
        text = '播放完成';
        break;
      default:
        break;
    }
    var oTip = doc.createElement('div');
    oTip.className = 'video-tip';
    oTip.innerHTML = '<img src="' + icon + '"/><p>' + text + '</p>';
    dom.appendChild(oTip);
  }

  function removeVideoTip(dom) {
    var oTip = doc.getElementsByClassName('video-tip')[0];
    oTip && dom.removeChild(oTip);
  }

  function timeFormat(second) {
    var h = parseInt(second / 3600),
      m = parseInt(parseInt(second % 3600) / 60),
      s = parseInt(parseInt(second % 3600) % 60),
      time = '';

    if (h == 0) {
      if (m >= 10) {
        if (s >= 10) {
          time = '00:' + m + ':' + s;
        } else {
          time = '00:' + m + ':0' + s;
        }
      } else {
        if (s >= 10) {
          time = '00:0' + m + ':' + s;
        } else {
          time = '00:0' + m + ':0' + s;
        }
      }
    } else {
      if (h < 10) {
        if (m >= 10) {
          if (s >= 10) {
            time = '0' + h + ':' + m + ':' + s;
          } else {
            time = '0' + h + ':' + m + ':0' + s;
          }
        } else {
          if (s >= 10) {
            time = '0' + h + ':0' + m + ':' + s;
          } else {
            time = '0' + h + ':0' + m + ':0' + s;
          }
        }
      } else {
        if (m >= 10) {
          if (s >= 10) {
            time = h + ':' + m + ':' + s;
          } else {
            time = h + ':' + m + ':0' + s;
          }
        } else {
          if (s >= 10) {
            time = h + ':0' + m + ':' + s;
          } else {
            time = h + ':0' + m + ':0' + s;
          }
        }
      }
    }

    return time;
  }

  window.MswVideo = MswVideo;
})(document);