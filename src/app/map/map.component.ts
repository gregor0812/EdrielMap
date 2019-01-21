import { Component, OnInit } from '@angular/core';


import OlMap from 'ol/Map';
import OlXYZ from 'ol/source/XYZ';
import OlTileLayer from 'ol/layer/Tile';
import OlView from 'ol/View';
import OlVectorLayer from 'ol/layer/Vector';
import OlVectorSource from 'ol/source/Vector';
import OlGeoJSON from 'ol/format/GeoJSON';
import OlImageLayer from 'ol/layer/Image';
import OlStatic from 'ol/source/ImageStatic';
import OlProjection from 'ol/proj/Projection';

import { fromLonLat } from 'ol/proj';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})

export class MapComponent implements OnInit {

  map: OlMap;
  vectorsource: OlVectorSource;
  vectorlayer: OlVectorLayer;
  view: OlView;
  xyzsource: OlXYZ;
  tilelayer: OlTileLayer;
  imagelayer: OlImageLayer;
  static: OlStatic;
  projection: OlProjection;

  ngOnInit() {
    const extent = [-20, 12, 116, 80];
    this.static = new OlStatic({
      url: 'assets/images/edrielcanvasmap.png',
      projection: this.projection,
      imageExtent: extent
    });

    this.imagelayer = new OlImageLayer({
      source: this.static
    });
    this.xyzsource = new OlXYZ({
      url: 'assets/images/edrielcanvasmap.png'
    });

    this.tilelayer = new OlTileLayer({
      source: this.xyzsource
    });

    this.vectorsource = new OlVectorSource({
      url: 'assets/geojson/edriel.geojson',
      format: new OlGeoJSON()
    });

    this.vectorlayer = new OlVectorLayer({
      source: this.vectorsource
    });

    this.view = new OlView({
      projection: 'EPSG:4326',
      center: [68, 46],
      zoom: 4
    });

    this.map = new OlMap({
      target: 'map',
      layers: [this.imagelayer, this.vectorlayer],
      view: this.view
    });
  }
}
