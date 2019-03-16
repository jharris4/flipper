import React, { Component } from 'react';

import App from './App';
import ImageLoader from '../imageLoader/imageLoader';
import { getTweenManager } from '../tween/tween';

const DEBUG = false;

export default class Root extends Component {
  constructor(props) {
    super(props);
    const { RAF, GET_NOW, USE_FIRST_RAF, DURATION_MULTIPLE } = props;
    const { baseUrl, manifestLocation, loadImage, flipDelay, flipDuration, flipInterval, runTimer } = props;
    const imageLoader = new ImageLoader(baseUrl, loadImage);
    imageLoader.onManifestLoad(images => {
      const { indexState } = this.state;
      const { flipRotations, flipOpacities } = indexState;
      for (let image of images) {
        flipRotations.set(image, 0);
        flipOpacities.set(image, 1);
      }
      this.setState(state => ({...state, indexState: {
        ...state.indexState,
        flipRotations: new Map(flipRotations),
        flipOpacities: new Map(flipOpacities)
      }}));
    });
    imageLoader.onImageLoad((image, index) => {
      this.tweenFlip({ image, index });
      if (imageLoader.allImagesLoaded && runTimer) {
        this.timerIntervalID = setInterval(this.startTimer, flipInterval);
      }
    });
    imageLoader.loadManifest(manifestLocation);
    this.state = {
      imageLoader: imageLoader,
      indexState: {
        tweenFlags: new Map(),
        frontImages: new Map(),
        backImages: new Map(),
        flipRotations: new Map(),
        flipOpacities: new Map()
      }
    };
    this.tweenManager = getTweenManager(RAF, GET_NOW, USE_FIRST_RAF, DURATION_MULTIPLE, ['Flip']);
  }

  startTimer() {
    const { indexState } = this.state;
    const { backImages } = indexState;
    const firstIndex = this.getRandomNonTweeningImageIndex();
    if (firstIndex !== void 0) {
      const swapIndex = this.getRandomNonTweeningImageIndex(firstIndex);
      if (swapIndex !== void 0) {
        this.tweenFlip({ index: firstIndex, image: backImages.get(swapIndex) });
        this.tweenFlip({ index: swapIndex, image: backImages.get(firstIndex) });
      }
    }
  };

  getRandomNonTweeningImageIndex(excludeIndex) {
    const { imageLoader, indexState } = this.state;
    const imagesLength = imageLoader.images.length;
    const { tweenFlags } = indexState;
    if (tweenFlags.size < imagesLength - 1) {
      const otherUntweenedIndices = [];
      for (let i = 0; i < imagesLength; i++) {
        if (i !== excludeIndex && tweenFlags.get(i) !== true) {
          otherUntweenedIndices.push(i);
        }
      }

      return otherUntweenedIndices[Math.floor(Math.random() * otherUntweenedIndices.length)];
    }
  }

  tweenFlip = ({ index, image }) => {
    const { flipDelay, flipDuration } = this.props;
    const { indexState } = this.state;
    const { tweenFlags, frontImages, backImages, flipRotations, flipOpacities} = indexState;
    tweenFlags.set(index, true);
    frontImages.set(index, image);
    flipRotations.set(index, 180);
    flipOpacities.set(index, 0);
    this.setState(state => ({...state, indexState: {
      ...state.indexState,
      tweenFlags: new Map(tweenFlags),
      frontImages: new Map(frontImages),
      flipRotations: new Map(flipRotations),
      flipOpacities: new Map(flipOpacities)
    }}));
    if (DEBUG) {
      console.log('start tween: ' + index)
    }
    this.tweenManager.startFlipTween({
      key: index,
      delay: flipDelay,
      duration: flipDuration,
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
        const { indexState } = this.state;
        const { flipRotations, flipOpacities } = indexState;
        if (DEBUG) {
          console.log('update ' + index + ' ' + image + ' ' + rotation + ' ' + opacity);
        }
        flipRotations.set(index, rotation);
        flipOpacities.set(index, opacity);
        this.setState(state => ({...state, indexState: {
          ...state.indexState,
          flipRotations: new Map(flipRotations),
          flipOpacities: new Map(flipOpacities)
        }}));
      },
      startCallback: () => {
        if (DEBUG) {
          console.log('start ' + index + ' ' + image);
        }
      },
      completeCallback: () => {
        if (DEBUG) {
          console.log('complete ' + index + ' ' + image);
        }
        const { indexState } = this.state;
        const { tweenFlags, frontImages, backImages, flipRotations, flipOpacities } = indexState;
        tweenFlags.delete(index);
        frontImages.delete(index);
        backImages.set(index, image);
        flipRotations.set(index, 0);
        flipOpacities.set(index, 1);
        this.setState(state => ({...state, indexState: {
          ...state.indexState,
          tweenFlags: new Map(tweenFlags),
          frontImages: new Map(frontImages),
          flipRotations: new Map(flipRotations),
          flipOpacities: new Map(flipOpacities)
        }}));
      }
    });
  }

  onImageClick = (index) => {
    const { indexState } = this.state;
    const { tweenFlags, backImages } = indexState;
    if (!tweenFlags.get(index)) {
      const swapIndex = this.getRandomNonTweeningImageIndex(index);

      if (swapIndex !== void 0) {
        // DEBUG = true;

        this.tweenFlip({ index: index, image: backImages.get(swapIndex) });
        this.tweenFlip({ index: swapIndex, image: backImages.get(index) });
      }
    }
  }

  componentWillUnmount() {
    this.tweenManager.cancelFlipTween();
    if (this.timerIntervalID !== null) {
      clearInterval(this.timerIntervalID);
      this.timerIntervalID = null;
    }
  }

  render() {
    const { SCROLL_VIEW, INTERACTIVE_VIEW, INTERACTIVE_PROP, VIEW, VIEW_TRANSFORM, IMAGE, IMAGE_PROP, IMAGE_SRC } = this.props;
    const { width, height, baseUrl } = this.props;
    const { imageLoader, indexState } = this.state;
    const { tweenFlags, frontImages, backImages, flipRotations, flipOpacities } = indexState;
    const appProps = {
      SCROLL_VIEW,
      INTERACTIVE_VIEW,
      INTERACTIVE_PROP,
      VIEW,
      VIEW_TRANSFORM,
      IMAGE,
      IMAGE_PROP,
      IMAGE_SRC,
      width,
      height,
      baseUrl,
      images: imageLoader.images,
      tweenFlags,
      frontImages,
      backImages,
      flipRotations,
      flipOpacities,
      loadedImages: imageLoader.loadedImages,
      onImageClick: this.onImageClick
    };
    return (
      <App {...appProps} />
    );
  }
}
