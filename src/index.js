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
  flipDelay: 5,
  flipDuration: 1000,
  flipInterval: 5000,
  runTimer: true,
  SET_VALUE: v => v,
  SCROLL_VIEW: props => <div {...props} />,
  INTERACTIVE_VIEW: props => <div {...props}/>,
  INTERACTIVE_PROP: 'onClick',
  VIEW: props => <div {...props} />,
  VIEW_TRANSFORM: (flipRotation) => 'rotateY(' + flipRotation + 'deg)',
  IMAGE: props => <img {...props} />,
  IMAGE_VIEW: props => <div {...props} />,
  IMAGE_PROP: 'src',
  IMAGE_SRC: image => image
};

render((
  <SizerRoot {...rootProps}/>
), container);
