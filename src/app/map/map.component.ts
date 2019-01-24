import { Component, OnInit } from '@angular/core';
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

  test: string;
  map: OlMap;
  vectorlayer: OlVectorLayer;
  imagelayer: OlImageLayer;
  static: OlStatic;
  projection: OlProjection;
  db: AngularFireDatabase;
  private provincenames: any[];
  select: any;
  sovereignties: any[];
  private styleArray: any[] = [];


  constructor(db: AngularFireDatabase) {
    this.db = db;
  }

  ngOnInit() {
  this.initalizeMap();
    this.loadProvinceData().then((e) => {
      console.log('And this?' + e)
      return this.addMapData(e);
    });
    this.loadFactionData().then( (e) => this.addMapSovereignties(e));

  }


  addMapData(mapData) {
console.log('Adding map data?' + this.provincenames);
    const layer = this.vectorlayer.getSource();
    if (layer.getState() === 'ready') {

      layer.forEachFeature(function(event) {
        event.set('name', mapData[event.get('id')].name, true);
        event.set('owner', mapData[event.get('id')].owner, true);
      });
      layer.refresh();
    }
  }
  addMapSovereignties(factiondata) {
    factiondata.forEach( (e) => {
      const sovereignColour = new Style({
        fill: new Fill({
          color: e.colour
        }),
        stroke: new Stroke({
          color: '#000000',
          width: 1
        }),
        fillOpacity: '0.6',


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

      this.styleArray.push(sovereignColour);
    });

    const layer = this.vectorlayer.getSource();
    if (layer.getState() === 'ready') {
      const styles = this.styleArray;
      layer.forEachFeature((event) => {
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


        const ownerid = event.get('owner');
        event.set('sovereignty', factiondata[ownerid].name, true);
        labelStyle.getText().setText(event.get('name') + ':' + event.get('id'));
        const provinceStyle = [styles[event.get('owner')], labelStyle];
        event.setStyle(provinceStyle);

      });

      layer.refresh();
    }
  }
  loadProvinceData() {
    return new Promise((resolve, reject) => {
        this.db.list('provinces').valueChanges().pipe(map(res => res.map(eachLabel => eachLabel))).subscribe(res => {
          this.provincenames = res;
          return resolve(res);
        });

    });

  }
  loadFactionData() {
    return new Promise((resolve, reject) => {
    this.db.list('sovereignties').valueChanges().pipe(map(res => res.map(eachLabel => eachLabel))).subscribe(res => {
      this.sovereignties = res;
      console.log(res);
      return resolve(res);
    });

    });
  }
  initalizeMap() {
    this.test = 'test';
    console.log(this.test);
    this.imagelayer = new OlImageLayer({
      source: new OlStatic({
        url: 'assets/images/edrielcanvasmap.jpg',
        projection: this.projection,
        imageExtent: [-20, 12, 116, 80]
      })
    });
    this.vectorlayer = new OlVectorLayer({
      source: new OlVectorSource({
        url: 'assets/geojson/edriel.geojson',
        format: new OlGeoJSON()
      }),
      declutter: true
    });

    this.map = new OlMap({
      target: 'map',
      layers: [this.imagelayer, this.vectorlayer],
      view: new OlView({
        projection: 'EPSG:4326',
        center: [50, 42],
        zoom: 14,
        minZoom: 5,
        maxZoom: 23,
        resolution: 0.06,
        maxResolution: 0.07,
        extent: [-20, 12, 116, 80]
      })
    });

    this.select = new Select({
      condition: click
    });
    this.map.addInteraction(this.select, (e) => {
      e.target.getFeatures().getLength();

    });
  }




}
