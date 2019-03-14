import React from 'react';
import { render } from 'react-dom';
import { Image } from 'react-native';
import raf from 'raf'; // Hopefully this is working with native

import NativeApp from './components/NativeApp';
import ImageLoader from './imageLoader/imageLoader';
import { getTweenManager } from './tween/tween';

const container = document.getElementById('root');

const baseUrl = PUBLIC_PATH + 'data/';
const manifestLocation = 'images.json'

const FLIP_DURATION = 1000;
const FLIP_INTERVAL = 5000;
const FLIP_DELAY = 5;

const tweenManager = getTweenManager(raf, ['Flip']);

let RUN_TIMER = true;

const imageLoader = new ImageLoader(
  baseUrl,
  (url) => Image.prefetch(url)
);
const flipRotations = new Map();
const flipOpacities = new Map();
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
  if (imageLoader.allImagesLoaded && RUN_TIMER) {
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
  flipOpacities.set(index, 0);
  if (DEBUG) {
    console.log('start tween: ' + index)
  }
  tweenManager.startFlipTween({
    key: index,
    delay: FLIP_DELAY,
    duration: FLIP_DURATION,
    animationData: {
      start: {
        rotation: 180,
        opacity: 0,
      },
      final: {
        rotation: 0,
        opacity: 1,
      }
    },
    getDataForPercent: (animationData, percentage) => {
      const { start, final } = animationData;
      return {
        rotation: start.rotation + (final.rotation - start.rotation) * percentage,
        // Fix for backface-visibility problems on Android and Firefox - https://github.com/facebook/react-native/issues/1973#issuecomment-262059217
        opacity: percentage < 0.5 ? start.opacity : final.opacity
      }
    },
    updateCallback: ({ rotation, opacity }) => {
      if (DEBUG) {
        console.log('update ' + index +  ' ' + image + ' ' + rotation + ' ' + opacity);
      }
      flipRotations.set(index, rotation);
      flipOpacities.set(index, opacity);
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
      flipOpacities.set(index, 1);
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
    <NativeApp baseUrl={baseUrl} images={imageLoader.images} tweenFlags={tweenFlags} frontImages={frontImages} backImages={backImages} flipRotations={flipRotations} flipOpacities={flipOpacities} loadedImages={imageLoader.loadedImages} onImageClick={onImageClick}/>
  ), container);
}


