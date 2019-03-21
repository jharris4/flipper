import React, { Component } from 'react';

export default class Image extends Component {
  render() {
    const { platformProps } = this.props;
    const { FlipperImage, FlipperImageView, FlipperView, imageProp, getImageSrc } = platformProps;
    const { width, height, image, className, flipPercentage, flipRotation, flipOpacity } = this.props;
    const imageContainerStyle = {
      transform: flipRotation(flipPercentage),
      perspective: 1000, // Fix for Android - https://facebook.github.io/react-native/docs/animations#bear-in-mind
      opacity: flipOpacity(flipPercentage),
      position: 'absolute',
      left: 0,
      top: 0
    };
    const imageEmptyStyle = {
      backgroundColor: 'grey',
      width: width,
      height: height
    }
    const imageStyle = {
      width: width,
      height: height
    };
    return (
      <FlipperImageView className={'image ' + className} style={imageContainerStyle}>
        {image ? (
          <FlipperImage {...{[imageProp]: getImageSrc(image)}} style={imageStyle}/>
        ) : (
          <FlipperView className="image-empty" style={imageEmptyStyle}/>
        )}
      </FlipperImageView>
    );
  }
}