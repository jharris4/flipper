import React, { Component } from 'react';

export default class Image extends Component {
  render() {
    const { width, height, image, className, flipRotation, flipOpacity } = this.props;
    const imageContainerStyle = {
      transform: 'rotateY(' + flipRotation + 'deg)',
      perspective: 1000, // Fix for Android - https://facebook.github.io/react-native/docs/animations#bear-in-mind
      opacity: flipOpacity,
      zIndex: flipOpacity < 0.5 ? 2 : 1,
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
      <div className={'image ' + className} style={imageContainerStyle}>
        {image ? (
          <img src={image} style={imageStyle}/>
        ) : (
          <div className="image-empty" style={imageEmptyStyle}/>
        )}
      </div>
    );
  }
}