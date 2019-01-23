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

  map: OlMap;
  vectorsource: OlVectorSource;
  vectorlayer: OlVectorLayer;
  view: OlView;
  imagelayer: OlImageLayer;
  static: OlStatic;
  projection: OlProjection;
  db: AngularFireDatabase;
  private provincenames: any[];
  highlightOverlay: OlVectorLayer;
  select: any;
  private sovereignties: any[];
  private styleArray: any[] = [];
  labelstyle: any;


  constructor(db: AngularFireDatabase) {
    this.db = db;
}

  ngOnInit() {
    this.loadProvinceData();


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
      source: this.vectorsource,
      declutter: true
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


  addMapData(mapData: any[]) {
    const layer = this.vectorlayer.getSource();
    if (layer.getState() === 'ready') {

      layer.forEachFeature(function(event) {
        event.set('name', mapData[event.get('id')].name, true);
        event.set('owner', mapData[event.get('id')].owner, true);
      });
      layer.refresh();
    }
}
  addMapSovereignties(factiondata: any[]) {
    this.sovereignties.forEach( (e) => {
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
      const style = [sovereignColour];

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
  this.db.list('provinces').valueChanges().pipe(map(res => res.map(eachLabel => eachLabel))).subscribe(res => {
    this.provincenames = res;
    this.addMapData(this.provincenames);
    this.loadFactionData();
  });
}
  loadFactionData() {
    this.db.list('sovereignties').valueChanges().pipe(map(res => res.map(eachLabel => eachLabel))).subscribe(res => {
      this.sovereignties = res;
      this.addMapSovereignties(this.sovereignties);

    });
  }



}
