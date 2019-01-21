import { Component, OnInit } from '@angular/core';

import { Observable } from 'rxjs';

import OlMap from 'ol/Map';
import OlView from 'ol/View';
import OlVectorLayer from 'ol/layer/Vector';
import OlVectorSource from 'ol/source/Vector';
import OlGeoJSON from 'ol/format/GeoJSON';
import OlImageLayer from 'ol/layer/Image';
import OlStatic from 'ol/source/ImageStatic';
import OlProjection from 'ol/proj/Projection';

import { fromLonLat } from 'ol/proj';
import {AngularFireDatabase} from '@angular/fire/database';
import {map} from 'rxjs/operators';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})

export class MapComponent implements OnInit {

  items: Observable<any[]>;
  map: OlMap;
  vectorsource: OlVectorSource;
  vectorlayer: OlVectorLayer;
  view: OlView;
  imagelayer: OlImageLayer;
  static: OlStatic;
  projection: OlProjection;
constructor(db: AngularFireDatabase) {
this.items = db.list('provinces').valueChanges();

db.list('provinces').valueChanges().pipe(map(res => res.map(eachLabel => eachLabel))).subscribe(res => {
  console.log(res);
});

}
  ngOnInit() {

    const extent = [-20, 12, 116, 80];
    this.static = new OlStatic({
      url: 'assets/images/edrielcanvasmap.jpg',
      projection: this.projection,
      imageExtent: extent
    });

    this.imagelayer = new OlImageLayer({
      source: this.static
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
