import React, { Component } from 'react';

import App from './App';
import ImageLoader from '../imageLoader/imageLoader';
import { getTweenManager } from '../tween/tween';

const DEBUG = false;

export default class Root extends Component {
  constructor(props) {
    super(props);
    const { RAF, GET_NOW, USE_FIRST_RAF } = props;
    const { baseUrl, manifestLocation, loadImage } = props;
    const imageLoader = new ImageLoader(baseUrl, loadImage);
    imageLoader.onManifestLoad(this.onManifestLoad);
    imageLoader.onImageLoad(this.onImageLoad);
    // load the list of images
    imageLoader.loadManifest(manifestLocation);
    this.state = {
      images: [],                 // Array of images
      indexState: {
        loadedCount: 0,           // Number of loaded images
        loadedImages: new Map(),  // Map of index to imageLoadedFlag
        tweenFlags: new Map(),    // Map of index to tweenFlag
        frontImages: new Map(),   // Map of index to frontImage (only used when tweenFlag === true)
        backImages: new Map(),    // Map of index to backImage
        flipRotations: new Map(), // Map of index to flipRotation
        flipOpacities: new Map()  // Map of index to flipOpacity
      }
    };
    this.tweenManager = getTweenManager(RAF, GET_NOW, USE_FIRST_RAF, ['Flip']);
  }

  onManifestLoad = images => {
    // when images load, set the initial flipRotation and flipOpacity for each index
    this.setState(state => {
      const { SET_VALUE } = this.props;
      const { indexState } = state;
      const { flipRotations, flipOpacities, loadedImages } = indexState;
      const imagesLength = images.length;
      for (let i = 0; i < imagesLength; i++) {
        flipRotations.set(i, SET_VALUE(0));
        flipOpacities.set(i, SET_VALUE(1));
        loadedImages.set(i, false);
      }
      return {
        ...state,
        images,
        indexState: {
          ...state.indexState,
          flipRotations: new Map(flipRotations),
          flipOpacities: new Map(flipOpacities),
          loadedImages: new Map(loadedImages),
          loadedCount: 0
        }
      };
    });
  }

  onImageLoad = (image, index) => {
    // as each image loads, start a flip animation on it
    this.tweenFlip({ image, index }, state => {
      const { loadedImages, loadedCount } = state;
      loadedImages.set(index, true);
      return {
        ...state,
        loadedImages: new Map(loadedImages),
        loadedCount: loadedCount + 1
      };
    });

    const { loadedCount, images } = this.state;
    if (loadedCount + 1 === images.length && runTimer) {
      const  { flipInterval } = this.props;
      this.timerIntervalID = setInterval(this.startTimer, flipInterval);
    }
  }

  startTimer = () => {
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
    const { images, indexState } = this.state;
    const imagesLength = images.length;
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

  /**
   * Starts a tween to flip the given index to show the given image
   * @param {Object} flipInfo - The flipInfo.
   * @param {number} flipInfo.index The index to flip.
   * @param {string} flipInfo.image The image to flip in.
  */
  tweenFlip = ({ index, image }) => {
    const { SET_VALUE } = this.props;
    const { flipDelay, flipDuration } = this.props;
    const { indexState } = this.state;
    const { tweenFlags, frontImages, backImages, flipRotations, flipOpacities} = indexState;
    tweenFlags.set(index, true);
    frontImages.set(index, image);
    flipRotations.set(index, SET_VALUE(180));
    flipOpacities.set(index, SET_VALUE(0));
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
    const { SCROLL_VIEW, INTERACTIVE_VIEW, INTERACTIVE_PROP, VIEW, VIEW_TRANSFORM, IMAGE, IMAGE_VIEW, IMAGE_PROP, IMAGE_SRC } = this.props;
    const { width, height, baseUrl } = this.props;
    const { images, indexState } = this.state;
    const { tweenFlags, loadedImages, frontImages, backImages, flipRotations, flipOpacities } = indexState;
    const appProps = {
      SCROLL_VIEW,
      INTERACTIVE_VIEW,
      INTERACTIVE_PROP,
      VIEW,
      VIEW_TRANSFORM,
      IMAGE,
      IMAGE_VIEW,
      IMAGE_PROP,
      IMAGE_SRC,
      width,
      height,
      baseUrl,
      images,
      tweenFlags,
      loadedImages,
      frontImages,
      backImages,
      flipRotations,
      flipOpacities,
      onImageClick: this.onImageClick
    };
    return (
      <App {...appProps} />
    );
  }
}
