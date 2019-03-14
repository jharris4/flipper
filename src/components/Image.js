import React, { Component } from 'react';

export default class Image extends Component {
  render() {
    const { image, className } = this.props;
    return (
      <div className={'image ' + className}>
        {image ? (
          <img src={image}/>
        ) : (
          <div className="image-empty"/>
        )}
      </div>
    );
  }
}