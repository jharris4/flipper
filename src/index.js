import React from 'react';
import { render } from 'react-dom';
import raf from 'raf';

import sizer from 'react-sizer';

import { buildTweener } from './tween';
import { ImageLoader } from './imageLoader';

import Root from './components/Root';
const SizerRoot = sizer()(Root);

import "./flipper.css";

const container = document.getElementById('root');

const baseUrl = PUBLIC_PATH + 'data/';
const manifestLocation = 'images.json';

function loadWebImage(url) {
  return new Promise((resolve, reject) => {
    try {
      let loadingImage = new Image();
      loadingImage.onload = () => {
        resolve(loadingImage);
      }
      loadingImage.src = url;
    }
    catch (e) {
      reject(e);
    }
  });
}

function getNow() {
  let now;
  if (typeof (window) !== 'undefined' && window.performance !== void 0 && window.performance.now !== void 0) {
    now = window.performance.now.bind(window.performance);
  }
  else if (Date.now !== void 0) {
    now = Date.now;
  }
  else {
    now = function () {
      return new Date().getTime();
    };
  }
  return now;
}

const tweener = buildTweener(raf, getNow, getNow() === Date.now);

const flipTweener = {
  start: ({
    delay,
    duration,
    update,
    complete
  }) => {
    const tween = tweener.create(duration, delay);
    tween.onUpdate(update);
    tween.onComplete(complete);
    tween.start();
  },
  cancel: () => {
    tweener.cancel();
  }
}

const imageLoader = new ImageLoader(baseUrl, manifestLocation, loadWebImage);

const rootProps = {
  tweener: flipTweener,
  imageLoader: imageLoader,
  baseUrl: baseUrl,
  flipMode: 'shift', // 'random' or 'shift'
  flipDelay: 0,
  flipDuration: 1000,
  flipInterval: 2000,
  runTimer: true,
  platformProps: {
    setValue: v => v,
    FlipperScrollView: props => <div {...props} />,
    FlipperInteractiveView: props => <div {...props} />,
    interactiveProp: 'onClick',
    FlipperView: props => <div {...props} />,
    FlipperImage: props => <img {...props} />,
    FlipperImageView: props => <div {...props} />,
    imageProp: 'src',
    getImageSrc: image => image,
    frontOpacityForPercentage: percentage => percentage < 0.5 ? 0 : 1,
    backOpacityForPercentage: percentage => percentage < 0.5 ? 1 : 0,
    frontRotationForPercentage: percentage => 'rotateY(' + (180 - percentage * 180) + 'deg)',
    backRotationForPercentage: percentage => 'rotateY(' + (percentage * 180) + 'deg)'
  }
};

render((
  <SizerRoot {...rootProps}/>
), container);
