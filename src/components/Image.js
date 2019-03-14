import React, { Component } from 'react';

export default class Image extends Component {
  render() {
    const { image, className, flipRotation, flipOpacity } = this.props;
    const imageStyle = {
      transform: 'rotateY(' + flipRotation + 'deg)',
      perspective: 1000, // Fix for Android - https://facebook.github.io/react-native/docs/animations#bear-in-mind
      opacity: flipOpacity,
      zIndex: flipOpacity < 0.5 ? 2 : 1
    };
    return (
      <div className={'image ' + className} style={imageStyle}>
        {image ? (
          <img src={image}/>
        ) : (
          <div className="image-empty"/>
        )}
      </div>
    );
  }
}