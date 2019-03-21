export function ImageLoader(baseUrl, manifestLocation, loadImagePromise) {
  this._baseUrl = baseUrl;
  this._manifestLocation = manifestLocation;
  this._loadImagePromise = loadImagePromise;
  this._images = [];
  this._imagesLoadedByLocation = new Map();
  this._error = null;
  this._imageLoadedListeners = new Map();
  this._manifestLoadedListeners = new Map();
}

ImageLoader.prototype = {
  get baseUrl() {
    return this._baseUrl;
  },

  get manifestLocation() {
    return this._manifestLocation;
  },

  get manifestUrl() {
    return this._baseUrl + this._manifestLocation;
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

  addImageLoadCallback(callback) {
    this._imageLoadedListeners.set(callback, callback);
  },

  addManifestLoadCallback(callback) {
    this._manifestLoadedListeners.set(callback, callback);
  },

  removeImageLoadCallback(callback) {
    this._imageLoadedListeners.delete(callback);
  },

  removeManifestLoadCallback(callback) {
    this._manifestLoadedListeners.delete(callback);
  },

  loadImage(imageLocation, index) {
    this._loadImagePromise(this._baseUrl + imageLocation).then(() => {
      this._imagesLoadedByLocation.set(imageLocation, true);
      if (this._imageLoadedListeners.size > 0) {
        this._imageLoadedListeners.forEach(listener => listener(imageLocation, index));
      }
    });
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
    console.log('imageLoader loadError: ' + error.message + ' ' + this.manifestUrl);
  },

  loadManifest() {
    this._images = [];
    this._imagesLoadedByLocation = new Map();
    this._error = null;
    fetch(this.manifestUrl)
      .then(response => response.json())
      .then(data => {
        if (this._manifestLoadedListeners.size > 0) {
          this._manifestLoadedListeners.forEach(listener => listener(data.images));
        }
        this.loadImages(data.images);
      })
      .catch(error => {
        this.loadError(error);
      });
  }
};
