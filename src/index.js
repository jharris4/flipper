import React from 'react';
import { render } from 'react-dom';
import raf from 'raf';

import sizer from 'react-sizer';

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

const rootProps = {
  baseUrl,
  manifestLocation,
  loadImage: loadWebImage,
  flipDelay: 5,
  flipDuration: 1000,
  flipInterval: 5000,
  runTimer: false,
  RAF: raf,
  GET_NOW: getNow,
  USE_FIRST_RAF: false,
  DURATION_MULTIPLE: 1,
  SCROLL_VIEW: props => <div {...props} />,
  INTERACTIVE_VIEW: props => <div {...props}/>,
  INTERACTIVE_PROP: 'onClick',
  VIEW: props => <div {...props} />,
  VIEW_TRANSFORM: (flipRotation) => 'rotateY(' + flipRotation + 'deg)',
  IMAGE: props => <img {...props} />,
  IMAGE_PROP: 'src',
  IMAGE_SRC: image => image
};

render((
  <SizerRoot {...rootProps}/>
), container);
