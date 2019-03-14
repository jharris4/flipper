export default function ImageLoader(baseUrl) {
  this._baseUrl = baseUrl;
  this._images = [];
  this._imagesLoadedByLocation = new Map();
  this._error = null;
}

ImageLoader.prototype = {
  get baseUrl() {
    return this._baseUrl;
  },

  get images() {
    return this._images;
  },

  get loadedImages() {
    return this._imagesLoadedByLocation;
  },

  isImageLoaded(imageLocation) {
    return this._imagesLoadedByLocation.get(imageLocation) === true;
  },

  get allImagesLoaded() {
    return this._images.length > 0 && this._images.length === this._imagesLoadedByLocation.size;
  },

  get error() {
    return this._error;
  },

  onImageLoad(callback) {
    this._onImageLoad = callback;
  },

  onManifestLoad(callback) {
    this._onManifestLoad = callback;
  },

  loadImage(imageLocation, index) {
    let loadingImage = new Image();
    loadingImage.onload = () => {
      this._imagesLoadedByLocation.set(imageLocation, true);
      if (this._onImageLoad) {
        this._onImageLoad(imageLocation, index);
      }
    }
    loadingImage.src = this._baseUrl + imageLocation;
  },

  loadImages(images) {
    this._images = images;
    let i = 0;
    for (let imageLocation of images) {
      this.loadImage(imageLocation, i);
      i++;
    }
  },

  loadError(error) {
    this._error = error;
    console.error(error);
  },

  loadManifest(manifestLocation) {
    fetch(this._baseUrl + manifestLocation)
      .then(response => response.json())
      .then(data => {
        if (this._onManifestLoad) {
          this._onManifestLoad(data.images);
        }
        this.loadImages(data.images);
      })
      .catch(error => {
        this.loadError(error);
      });
  }
};
