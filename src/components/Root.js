import React, { Component } from 'react';

import App from './App';

export default class Root extends Component {
  constructor(props) {
    super(props);
    const { imageLoader } = props;
    imageLoader.onManifestLoad(this.onManifestLoad);
    imageLoader.onImageLoad(this.onImageLoad);
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
  tweenFlip = ({ index, image }, stateUpdater = state => state) => {
    if (this.props.tweener) {
      const { platformProps } = this.props;
      const { setValue } = platformProps;
      const { flipDelay, flipDuration } = this.props;
      const { indexState } = this.state;
      const { tweenFlags, frontImages, flipPercentages } = indexState;
      tweenFlags.set(index, true);
      frontImages.set(index, image);
      const flipPercentage = setValue(0);
      flipPercentages.set(index, flipPercentage);
      this.setState(state => stateUpdater({
        ...state, indexState: {
          ...state.indexState,
          tweenFlags: new Map(tweenFlags),
          frontImages: new Map(frontImages),
          flipPercentages: new Map(flipPercentages)
        }
      }));

      this.props.tweener.start({
        startValue: flipPercentage,
        delay: flipDelay,
        duration: flipDuration,
        update: percentage => {
          const { indexState } = this.state;
          const { flipPercentages } = indexState;
          flipPercentages.set(index, setValue(percentage));
          this.setState(state => ({
            ...state, indexState: {
              ...state.indexState,
              flipPercentages: new Map(flipPercentages)
            }
          }));
        },
        complete: () => {
          const { indexState } = this.state;
          const { tweenFlags, frontImages, backImages, flipPercentages } = indexState;
          tweenFlags.delete(index);
          frontImages.delete(index);
          backImages.set(index, image);
          flipPercentages.set(index, setValue(0));
          this.setState(state => ({
            ...state, indexState: {
              ...state.indexState,
              tweenFlags: new Map(tweenFlags),
              frontImages: new Map(frontImages),
              flipPercentages: new Map(flipPercentages)
            }
          }));
        }
      });
    }
  }

  onImageClick = (index) => {
    const { indexState } = this.state;
    const { tweenFlags, backImages } = indexState;
    if (!tweenFlags.get(index)) {
      const swapIndex = this.getRandomNonTweeningImageIndex(index);

      if (swapIndex !== void 0) {
        this.tweenFlip({ index: index, image: backImages.get(swapIndex) });
        this.tweenFlip({ index: swapIndex, image: backImages.get(index) });
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
      this.props.imageLoader.onManifestLoad(null);
      this.props.imageLoader.onImageLoad(null);
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
