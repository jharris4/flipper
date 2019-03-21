export function buildTweener(raf, getNow, useFirstRaf) {
  const Tweener = Tweener || createTweener(raf, getNow, useFirstRaf);

  return Tweener;
}

const MIN_SAFE_ID = Number.MIN_SAFE_INTEGER;
const MAX_SAFE_ID = Number.MAX_SAFE_INTEGER;

function createTweener(raf, getNow, useFirstRaf) {
  const now = getNow();

  let _tweens = {};
  let _pendingTweens = {};
  let _nextTweenId = MIN_SAFE_ID;
  let _animationId = null;

  let add = function (tween) {
    _tweens[tween.id] = tween;
    _pendingTweens[tween.id] = tween;
  };

  let remove = function (tween) {
    delete _tweens[tween.id];
    delete _pendingTweens[tween.id];
  }

  let cancel = function () {
    _tweens = {};
    _pendingTweens = {};
    _nextTweenId = MIN_SAFE_ID;
  }

  let update = function (time) {
    let tweenIds = Object.keys(_tweens);

    if (tweenIds.length === 0) {
      return false; // raf callback loop will stop
    }

    time = time !== void 0 ? time : now();

    while (tweenIds.length > 0) {
      _pendingTweens = {};

      for (let tweenId of tweenIds) {
        if (_tweens[tweenId] !== void 0 && _tweens[tweenId].update(time) === false) {
          delete _tweens[tweenId];
        }
      }

      tweenIds = Object.keys(_pendingTweens);
    }
    return true; // raf callback loop will continue
  }

  let _rafCallback = function (ts) {
    if (!ts) {
      // console.error('no ts on raf: ' + JSON.stringify(ts));
      ts = +(new Date());
    }
    if (update(ts)) {
      _animationId = raf(_rafCallback);
    }
    else {
      _animationId = null;
    }
  };

  let _requestRaf = function () {
    if (_animationId === null) {
      _animationId = raf(_rafCallback);
    }
  };

  let nextTweenId = function () {
    const tweenId = _nextTweenId;
    if (_nextTweenId < MAX_SAFE_ID) {
      _nextTweenId++;
    }
    else {
      _nextTweenId = MIN_SAFE_ID;
    }
    return tweenId;
  }

  let create = function (duration, delay = 0) {
    let id = nextTweenId();
    let startTime = null;
    let isPlaying = false;
    let onStartCallbackFired = false;
    let onStartCallback = null;
    let onUpdateCallback = null;
    let onStopCallback = null;
    let onCompleteCallback = null;
    let chainedTweens = [];

    let startWithTime = function (time) {
      add(tween);

      isPlaying = true;
      onStartCallbackFired = false;

      startTime = delay + time;
      _requestRaf();
    }

    let start = function() {
      if (useFirstRaf) {
        // Used to fix older versions of Safari
        // TODO - the raf call id should be cancelable or tracked
        raf((time) => { startWithTime(time); });
      }
      else {
        startWithTime(now());
      }
    }

    let update = function (time) {
      if (time < startTime) {
        return true;
      }
      if (onStartCallbackFired === false) {
        if (onStartCallback !== null) {
          onStartCallback();
        }
        onStartCallbackFired = true;
      }

      let percentage = duration === 0 ? 1 : (time - startTime) / duration;
      percentage = percentage > 1 ? 1 : percentage;

      if (onUpdateCallback !== null) {
        onUpdateCallback(percentage);
      }

      if (percentage === 1) {
        if (onCompleteCallback !== null) {
          onCompleteCallback();
        }

        for (let chainedTween of chainedTweens) {
          chainedTween.start(startTime + duration);
        }

        return false;
      }

      return true;
    };

    let stopChainedTweens = function () {
      for (let chainedTween of chainedTweens) {
        chainedTween.stop();
      }
    }

    let chain = function (...tweens) {
      chainedTweens = tweens;
      return tween;
    }

    let stop = function () {
      if (!isPlaying) {
        return tween;
      }

      remove(tween);
      isPlaying = false;

      if (onStopCallback !== null) {
        onStopCallback();
      }

      stopChainedTweens();
      return tween;
    };

    let onStart = function (callback) {
      onStartCallback = callback;
      return tween;
    }

    let onUpdate = function (callback) {
      onUpdateCallback = callback;
      return tween;
    }

    let onComplete = function (callback) {
      onCompleteCallback = callback;
      return tween;
    }

    let onStop = function (callback) {
      onStopCallback = callback;
      return tween;
    }

    let tween = {
      id,
      start,
      update,
      stop,
      chain,
      onStart,
      onUpdate,
      onComplete,
      onStop
    };

    return tween;
  };

  return {
    now,
    add,
    remove,
    update,
    create,
    cancel
  };
}
