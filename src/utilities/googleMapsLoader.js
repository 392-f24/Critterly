// src/utilities/googleMapsLoader.js

import { Loader } from '@googlemaps/js-api-loader';

class GoogleMapsLoader {
  static loader = null;
  static loadingPromise = null;

  static getLoader() {
    if (!this.loader) {
      this.loader = new Loader({
        apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
        version: "beta",
        libraries: ["maps", "marker", "geocoding", "places"]
      });
    }
    return this.loader;
  }

  static load() {
    if (!this.loadingPromise) {
      this.loadingPromise = this.getLoader().load();
    }
    return this.loadingPromise;
  }
}

export default GoogleMapsLoader;