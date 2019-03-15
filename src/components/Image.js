import React, { Component } from 'react';

export default class Image extends Component {
  render() {
    const { VIEW, IMAGE } = this.props;
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
      <VIEW className={'image ' + className} style={imageContainerStyle}>
        {image ? (
          <IMAGE src={image} style={imageStyle}/>
        ) : (
            <VIEW className="image-empty" style={imageEmptyStyle}/>
        )}
      </VIEW>
    );
  }
}