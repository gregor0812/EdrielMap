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
import {Fill, Stroke, Style, Text} from 'ol/style';
import { fromLonLat } from 'ol/proj';
import Select from 'ol/interaction/Select';
import {click, pointerMove, altKeyOnly} from 'ol/events/condition';
import {AngularFireDatabase} from '@angular/fire/database';
import {map} from 'rxjs/operators';
import {getWidth} from 'ol/extent';

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
  imagelayer: OlImageLayer;
  static: OlStatic;
  projection: OlProjection;
  db: AngularFireDatabase;
  private provincenames: any[];
  highlight: any;
  highlightOverlay: OlVectorLayer;
  select: any;

  constructor(db: AngularFireDatabase) {
    this.db = db;
}

  ngOnInit() {
    const highlightStyle = new Style({
      stroke: new Stroke({
        color: '#f00',
        width: 1
      }),
      fill: new Fill({
        color: 'rgba(255,0,0,0.1)'
      }),
      text: new Text({
        font: '12px Calibri,sans-serif',
        fill: new Fill({
          color: '#000'
        }),
        stroke: new Stroke({
          color: '#f00',
          width: 3
        })
      })
    });
    const labelStyle = new Style({
      geometry: function(feature) {
        let geometry = feature.getGeometry();
        if (geometry.getType() === 'MultiPolygon') {
          // Only render label for the widest polygon of a multipolygon
          const polygons = geometry.getPolygons();
          let widest = 0;
          for (let i = 0, ii = polygons.length; i < ii; ++i) {
            const polygon = polygons[i];
            const width = getWidth(polygon.getExtent());
            if (width > widest) {
              widest = width;
              geometry = polygon;
            }
          }
        }
        return geometry;
      },
      text: new Text({
        font: '12px Calibri,sans-serif',
        overflow: true,
        fill: new Fill({
          color: '#000'
        }),
        stroke: new Stroke({
          color: '#fff',
          width: 3
        })
      })
    });
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

    const countryStyle = new Style({
      fill: new Fill({
        color: 'rgba(255, 255, 255, 0.6)'
      }),
      stroke: new Stroke({
        color: '#319FD3',
        width: 1
      })
    });

    const style = [countryStyle, labelStyle];

    this.vectorlayer = new OlVectorLayer({
      source: this.vectorsource,
      style: function (feature) {
        labelStyle.getText().setText(feature.get('name'));
        return style;

      },
      declutter: true
    });

    this.highlightOverlay = new OlVectorLayer({
      source: new OlVectorSource(),
      map: this.map,
      style: function(feature) {
        this.highlightStyle.getText().setText(feature.get('name'));
        return highlightStyle;
      }
    });


    this.db.list('provinces').valueChanges().pipe(map(res => res.map(eachLabel => eachLabel))).subscribe(res => {
      console.log(typeof res);

      this.provincenames = res;
    //  console.log(this.provincenames);
      this.addMapFeatures(this.provincenames);
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

    this.select = new Select({
      condition: click
    });
    this.map.addInteraction(this.select, (e) => {
      e.target.getFeatures().getLength();

    });
  }
  addMapFeatures(provincenames: any[]) {
    const layer = this.vectorlayer.getSource();
    if (layer.getState() === 'ready') {
      console.log(provincenames);
      layer.forEachFeature(function(event) {

        event.set('name', provincenames[event.get('id')].name, true);
      });
      layer.refresh();
    }
}



}
