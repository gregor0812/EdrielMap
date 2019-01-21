import { Component, OnInit } from '@angular/core';


import OlMap from 'ol/Map';
import OlXYZ from 'ol/source/XYZ';
import OlTileLayer from 'ol/layer/Tile';
import OlView from 'ol/View';
import OlVectorLayer from 'ol/layer/Vector';
import OlVectorSource from 'ol/source/Vector';
import OlGeoJSON from 'ol/format/GeoJSON';

import { fromLonLat } from 'ol/proj';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})

export class MapComponent implements OnInit {

  map: OlMap;
  source: OlVectorSource;
  layer: OlVectorLayer;
  view: OlView;

  ngOnInit() {
    this.source = new OlVectorSource({
      url: 'assets/geojson/edriel.geojson',
      format: new OlGeoJSON()
    });

    this.layer = new OlVectorLayer({
      source: this.source
    });

    this.view = new OlView({
      projection: 'EPSG:4326',
      center: [68, 46],
      zoom: 4
    });

    this.map = new OlMap({
      target: 'map',
      layers: [this.layer],
      view: this.view
    });
  }
}
