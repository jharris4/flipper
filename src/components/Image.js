import React, { Component } from 'react';

export default class Image extends Component {
  render() {
    const { image, className, front, flipRotation, flipOpacity } = this.props;
    const frontStyle = {
      transform: 'rotateY(' + flipRotation + 'deg)',
      perspective: 1000, // Fix for Android - https://facebook.github.io/react-native/docs/animations#bear-in-mind
      opacity: flipOpacity,
      zIndex: front ? 1 : 2
    };
    return (
      <div className={'image ' + className} style={frontStyle}>
        {image ? (
          <img src={image}/>
        ) : (
          <div className="image-empty"/>
        )}
      </div>
    );
  }
}