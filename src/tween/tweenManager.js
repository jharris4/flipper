import { buildTweener } from './tweener';

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
        // Tweener._requestRaf();
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
        // Tweener._requestRaf();
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