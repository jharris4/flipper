import React, { Component } from 'react';

import App from './App';

export default class Root extends Component {
  constructor(props) {
    super(props);
    const { imageLoader } = props;
    imageLoader.addManifestLoadCallback(this.onManifestLoad);
    imageLoader.addImageLoadCallback(this.onImageLoad);
    // load the list of images
    imageLoader.loadManifest();
    this.state = {
      images: [],                   // Array of images
      loadedImageCount: 0,          // Number of loaded images
      indexState: {
        loadedImages: new Map(),    // Map of index to imageLoadedFlag
        frontImages: new Map(),     // Map of index to frontImage (only used when tweenFlag === true)
        backImages: new Map(),      // Map of index to backImage
        tweenFlags: new Map(),      // Map of index to tweenFlag
        flipPercentages: new Map()  // Map of index to flipPercentage
      }
    };
  }

  onManifestLoad = images => {
    // when images load, set the initial flipRotation and flipOpacity for each index
    this.setState(state => {
      const { platformProps } = this.props;
      const { setValue } = platformProps;
      const { indexState } = state;
      const { loadedImages, flipPercentages } = indexState;
      const imagesLength = images.length;
      for (let i = 0; i < imagesLength; i++) {
        flipPercentages.set(i, setValue(0));
        loadedImages.set(i, false);
      }
      return {
        ...state,
        images,
        loadedImageCount: 0,
        indexState: {
          ...state.indexState,
          flipPercentages: new Map(flipPercentages),
          loadedImages: new Map(loadedImages)
        }
      };
    });
  }

  onImageLoad = (image, index) => {
    const { runTimer } = this.props;
    const { loadedImageCount, images } = this.state;

    // as each image loads, start a flip animation on it
    this.tweenFlip({ image, index }, state => {
      const { loadedImageCount, indexState } = state;
      const { loadedImages } = indexState;
      loadedImages.set(index, true);
      return {
        ...state,
        loadedImageCount: loadedImageCount + 1,
        indexState: {
          ...state.indexState,
          loadedImages: new Map(loadedImages)
        }
      };
    });

    if (loadedImageCount + 1 === images.length && runTimer) {
      const  { flipInterval } = this.props;
      this.timerIntervalID = setInterval(this.runTimer, flipInterval);
    }
  }

  runTimer = () => {
    const { flipMode } = this.props;
    const { indexState } = this.state;
    const { backImages } = indexState;
    if (flipMode === 'random') {
      const firstIndex = this.getRandomNonTweeningImageIndex();
      if (firstIndex !== void 0) {
        const swapIndex = this.getRandomNonTweeningImageIndex(firstIndex);
        if (swapIndex !== void 0) {
          this.tweenFlip({ index: firstIndex, image: backImages.get(swapIndex) });
          this.tweenFlip({ index: swapIndex, image: backImages.get(firstIndex) });
        }
      }
    }
    else if (flipMode === 'shift') {
      const imageSize = backImages.size; // This should be the same as images.length
      backImages.forEach((backImage, index) => {
        this.tweenFlip({ index: (index+1) % imageSize, image: backImage });
      });
    }
  }

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
  tweenFlip = ({ index, image }, stateUpdater = state => state) => {
    if (this.props.tweener) {
      const { platformProps } = this.props;
      const { setValue } = platformProps;
      const { flipDelay, flipDuration } = this.props;
      const flipPercentage = setValue(0);
      this.setState(state => {
        const { indexState } = state;
        const { tweenFlags, frontImages, flipPercentages } = indexState;
        tweenFlags.set(index, true);
        frontImages.set(index, image);
        flipPercentages.set(index, flipPercentage);
        return stateUpdater({
          ...state,
          indexState: {
            ...state.indexState,
            tweenFlags: new Map(tweenFlags),
            frontImages: new Map(frontImages),
            flipPercentages: new Map(flipPercentages)
          }
        });
      });

      this.props.tweener.start({
        startValue: flipPercentage,
        index: index,
        delay: flipDelay,
        duration: flipDuration,
        update: percentage => {
          // this is only called when useRaf == true, Animated does its own interpolation
          this.setState(state => {
            const { indexState } = state;
            const { flipPercentages } = indexState;
            flipPercentages.set(index, setValue(percentage));
            return {
              ...state,
              indexState: {
                ...state.indexState,
                flipPercentages: new Map(flipPercentages)
              }
            };
          });
        },
        complete: () => {
          this.setState(state => {
            const { indexState } = state;
            const { tweenFlags, frontImages, backImages, flipPercentages } = indexState;
            tweenFlags.delete(index);
            backImages.set(index, frontImages.get(index));
            frontImages.delete(index);
            flipPercentages.set(index, setValue(0));
            return {
              ...state,
              indexState: {
                ...state.indexState,
                tweenFlags: new Map(tweenFlags),
                backImages: new Map(backImages),
                frontImages: new Map(frontImages),
                flipPercentages: new Map(flipPercentages)
              }
            };
          });
        }
      });
    }
  }

  onImageClick = (index) => {
    const { flipMode } = this.props;
    if (flipMode === 'random') {
      const { images, indexState } = this.state;
      const { tweenFlags, backImages } = indexState;
      if (!tweenFlags.get(index)) {
        const swapIndex = this.getRandomNonTweeningImageIndex(index);

        if (swapIndex !== void 0) {
          this.tweenFlip({ index: index, image: backImages.get(swapIndex) });
          this.tweenFlip({ index: swapIndex, image: backImages.get(index) });
        }
      }
    }
  }

  componentWillUnmount() {
    if (this.props.tweener) {
      this.props.tweener.cancel();
    }
    if (this.timerIntervalID !== null) {
      clearInterval(this.timerIntervalID);
      this.timerIntervalID = null;
    }
    if (this.props.imageLoader) {
      this.props.imageLoader.removeManifestLoadCallback(this.onManifestLoad);
      this.props.imageLoader.removeImageLoadCallback(this.onImageLoad);
    }
  }

  render() {
    const { platformProps } = this.props;
    const { width, height, baseUrl } = this.props;
    const { images, indexState } = this.state;
    const { tweenFlags, loadedImages, frontImages, backImages, flipPercentages } = indexState;
    const appProps = {
      platformProps,
      width,
      height,
      baseUrl,
      images,
      tweenFlags,
      loadedImages,
      frontImages,
      backImages,
      flipPercentages,
      onImageClick: this.onImageClick
    };
    return (
      <App {...appProps} />
    );
  }
}
