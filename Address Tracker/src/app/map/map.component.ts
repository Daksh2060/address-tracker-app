import { Component, Input, OnInit } from '@angular/core';
import * as L from 'leaflet';
import { AlertService, Alert } from '../alert.service';
import { Subscription } from 'rxjs';
import { icon, Marker } from 'leaflet';
import { LocationsService } from '../locations.service';

const iconUrl = "assets/marker-icon.png";
const shadowUrl = "assets/marker-shadow.png";

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})

export class MapComponent implements OnInit{

  private map!: L.Map;
  //Dictionary used to store alert counts by coordinates
  private alertCounts: { [key: string]: number } = {};

  @Input() alertList: Alert[] = [];
  private subscription: Subscription;

  constructor(private as: AlertService, private ls: LocationsService){
    this.subscription = this.as.alertsSubject.subscribe(() => {
      this.updateMap();
    });
  }

  //Promise used to solve issue where map would load before markers were added
  async ngOnInit(): Promise<void> {
    await Promise.all([this.ls.fetchLocations(), this.as.fetchData()]);

    this.showMap();
    this.putLabels();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  showMap() {
    this.map = L.map('mapid').setView([49.23, -122.9], 11);

    const tiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> ',
    }).addTo(this.map);
  }

  //Fills dicstionary with location:count pairs, then generates markers for each pair with count >= 1
  putLabels(){
    const alertCounts: { [key: string]: number } = {};

    for(const location of this.ls.get()){
      alertCounts[location.location_name] = 0;
    }

    for(const alert of this.as.get()){
      const locationName = alert.location;

      if (locationName){
        alertCounts[locationName]++;
      }
    }
    
    for(const location of this.ls.get()){
      const count = alertCounts[location.location_name];

      if (count > 0 && location.location_x && location.location_y){
        const marker = L.marker([location.location_x, location.location_y]).addTo(this.map);
        marker.bindPopup(`<b>${location.location_name}</b><br /> Nuisance Reports: ${count}`);
      }
    }
  }

  //Updates map each time alert list is updated
  updateMap() {

    this.map.eachLayer((layer) =>{

      if (layer instanceof L.Marker){
        this.map.removeLayer(layer);
      }
    });

    this.putLabels();
  }
}