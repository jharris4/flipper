import React, { Component } from 'react';

export default class Image extends Component {
  render() {
    const { image, className, flipRotation, flipOpacity } = this.props;
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
      background: 'grey',
      width: '100%',
      height: '100%'
    }
    const imageStyle = {
      width: '100%',
      height: '100%'
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