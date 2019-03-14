import React from 'react';
import { render } from 'react-dom';
import raf from 'raf';

import App from './components/App';
import ImageLoader from './imageLoader/imageLoader';
import { getTweenManager } from './tween/tween';

import "./flipper.css";

const container = document.getElementById('root');

const baseUrl = PUBLIC_PATH + 'data/';
const manifestLocation = 'images.json'

const FLIP_DURATION = 1000;
const FLIP_INTERVAL = 3000;
const FLIP_DELAY = 5;

const tweenManager = getTweenManager(raf, ['Flip']);

const imageLoader = new ImageLoader(baseUrl);
const flipRotations = new Map();
const frontImages = new Map();
const backImages = new Map();
const tweenFlags = new Map();
imageLoader.onManifestLoad(images => {
  for (let image of images) {
    flipRotations.set(image, 0);
  }
  renderApp();
});
imageLoader.onImageLoad((image, index) => {
  tweenFlip({ image, index });
  if (imageLoader.allImagesLoaded) {
    setInterval(() => {
      const firstIndex = getRandomNonTweeningImageIndex();
      if (firstIndex !== void 0) {
        const swapIndex = getRandomNonTweeningImageIndex(firstIndex);
        if (swapIndex !== void 0) {
          tweenFlip({ index: firstIndex, image: backImages.get(swapIndex) });
          tweenFlip({ index: swapIndex, image: backImages.get(firstIndex) });
        }
      }
    }, FLIP_INTERVAL);
  }
});
imageLoader.loadManifest(manifestLocation);

let DEBUG = false;

function tweenFlip({ index, image }) {
  tweenFlags.set(index, true);
  frontImages.set(index, image);
  flipRotations.set(index, 180);
  if (DEBUG) {
    console.log('start tween: ' + index)
  }
  tweenManager.startFlipTween({
    key: index,
    delay: FLIP_DELAY,
    duration: FLIP_DURATION,
    animationData: {
      start: 180,
      final: 0
    },
    getDataForPercent: (animationData, percentage) => {
      const { start, final } = animationData;
      return start + (final - start) * percentage;
    },
    updateCallback: rotation => {
      if (DEBUG) {
        console.log('update ' + index +  ' ' + image + ' ' + rotation);
      }
      flipRotations.set(index, rotation);
      renderApp();
    },
    startCallback: () => {
      if (DEBUG) {
        console.log('start ' + index + ' ' + image);
      }
      renderApp();
    },
    completeCallback: () => {
      if (DEBUG) {
        console.log('complete ' + index + ' ' + image);
      }
      tweenFlags.delete(index);
      frontImages.delete(index);
      backImages.set(index, image);
      flipRotations.set(index, 0);
      renderApp();
    }
  });
  renderApp();
}

function getRandomNonTweeningImageIndex(excludeIndex) {
  if (tweenFlags.size < imageLoader.images.length - 1) {
    const otherUntweenedIndices = [];
    for (let i = 0; i < imageLoader.images.length; i++) {
      if (i !== excludeIndex && tweenFlags.get(i) !== true) {
        otherUntweenedIndices.push(i);
      }
    }

    return otherUntweenedIndices[Math.floor(Math.random() * otherUntweenedIndices.length)];
  }
}

function onImageClick(index) {
  if (!tweenFlags.get(index)) {
    const swapIndex = getRandomNonTweeningImageIndex(index);

    if (swapIndex !== void 0) {
      // DEBUG = true;

      tweenFlip({ index: index, image: backImages.get(swapIndex) });
      tweenFlip({ index: swapIndex, image: backImages.get(index) });
    }
  }
}

function renderApp() {
  render((
    <App baseUrl={baseUrl} images={imageLoader.images} frontImages={frontImages} backImages={backImages} flipRotations={flipRotations} loadedImages={imageLoader.loadedImages} onImageClick={onImageClick}/>
  ), container);
}


