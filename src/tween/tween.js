function buildTweener(raf, getNow, useFirstRaf) {
  const Tweener = Tweener || createTweener(raf, getNow, useFirstRaf);

  if (Tweener._requestRaf === void 0) {
    Tweener._animationId = null;
    Tweener._rafCallback = function (ts) {
      if (!ts) {
        // console.error('no ts on raf: ' + JSON.stringify(ts));
        ts = +(new Date());
      }
      if (Tweener.update(ts)) {
        Tweener._animationId = raf(Tweener._rafCallback);
      }
      else {
        Tweener._animationId = null;
      }
    };
    Tweener._requestRaf = function () {
      if (Tweener._animationId === null) {
        Tweener._animationId = raf(Tweener._rafCallback);
      }
    };
  }

  return Tweener;
}

function createTweener(raf, getNow, useFirstRaf) {
  const now = getNow();

  let _tweens = {};
  let _pendingTweens = {};
  let _nextTweenId = 0;

  let add = function (tween) {
    _tweens[tween.id] = tween;
    _pendingTweens[tween.id] = tween;
  };

  let remove = function (tween) {
    delete _tweens[tween.id];
    delete _pendingTweens[tween.id];
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

  let create = function (duration, delay = 0) {
    let id = _nextTweenId++;
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
      return tween;
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
    create
  };
}

export function getTweenManager(raf, getNow, useFirstRaf, tweenTypes) {
  const Tweener = buildTweener(raf, getNow, useFirstRaf);

  let tweensByType = {};
  let tweensKeyedByType = {};

  let tweenManager = {};
  for (let type of tweenTypes) {
    let tweenType = type;
    let startFunctionName = 'start' + tweenType + 'Tween';
    let cancelFunctionName = 'cancel' + tweenType + 'Tween';
    tweenManager[startFunctionName] = ({
      key,
      delay,
      duration,
      animationData,
      getDataForPercent,
      updateCallback,
      completeCallback = () => { },
      startCallback = () => { }
    }) => {
      if (key !== void 0) {
        let tweenKeyMap = tweensKeyedByType[tweenType];
        if (!tweenKeyMap) {
          tweenKeyMap = tweensKeyedByType[tweenType] = {};
        }
        let tween = tweenKeyMap[key] = buildAnimationTween(
          Tweener,
          {
            duration,
            animationData,
            updateCallback,
            getDataForPercent,
            completeCallback: () => {
              delete tweenKeyMap[key];
              if (Object.keys(tweenKeyMap).length === 0) {
                delete tweensKeyedByType[tweenType];
              }
              completeCallback();
            },
            startCallback
          }
        );
        // TODO, defer start until after next raf callback?!
        tween.start();
        Tweener._requestRaf();
      }
      else {
        tweenManager[cancelFunctionName]();
        let tween = tweensByType[tweenType] = buildAnimationTween(
          Tweener,
          {
            delay,
            duration,
            animationData,
            updateCallback,
            getDataForPercent,
            completeCallback: () => { tweensByType[tweenType] = null; completeCallback(); },
            startCallback
          }
        );
        // TODO, defer start until after next raf callback?!
        tween.start();
        Tweener._requestRaf();
      }
    };
    tweenManager[cancelFunctionName] = (key) => {
      let tween = tweensByType[tweenType];
      if (tween) {
        tween.stop();
        delete tweensByType[tweenType];
      }
      let tweenKeyMap = tweensKeyedByType[tweenType];
      if (tweenKeyMap) {
        if (key !== void 0) {
          let tween = tweenKeyMap[key];
          if (tween) {
            tween.stop();
            delete tweenKeyMap[key];
          }
          if (Object.keys(tweenKeyMap).length === 0) {
            delete tweensKeyedByType[tweenType];
          }
        }
        else {
          for (let tweenKey of Object.keys(tweenKeyMap)) {
            tweenKeyMap[tweenKey].stop();
          }
          delete tweensKeyedByType[tweenType];
        }
      }
    };
  };

  return tweenManager;
}

function buildAnimationTween(
  Tweener,
  {
    duration,
    delay = 0,
    animationData,
    updateCallback,
    getDataForPercent,
    completeCallback = () => { },
    startCallback = () => { }
  }) {
  let animatedTween = Tweener.create(duration, delay);
  animatedTween.onStart(() => {
    startCallback();
    updateCallback(animationData.start);
  });
  animatedTween.onUpdate(percentage => {
    updateCallback(getDataForPercent(animationData, percentage));
  });
  animatedTween.onComplete(() => {
    updateCallback(animationData.final);
    completeCallback();
  });
  return animatedTween;
}
