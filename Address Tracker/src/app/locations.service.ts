import { Injectable } from '@angular/core';
import { Subject, forkJoin } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})

export class LocationsService{

  locations:MapLocation[] = []; 
  
  locationSubject = new Subject<void>(); 
  private readonly apiUrl = 'https://272.selfip.net/apps/IAzabmC9H7/collections/locations6/documents/';

  constructor(private http: HttpClient) {
    this.fetchLocations();
  }

  //Gets list of pre-determined locations held in server
  fetchLocations(){
    this.http.get<any[]>(this.apiUrl).subscribe((data) => {
      this.locations = data.map((item) => item.data);
      this.locationSubject.next();
    });
  }
  
  get(){
    return this.locations;
  }

  //Adds a new location after user submits new report with custom location
  add(newLocation: MapLocation){
    this.locations.push(newLocation);
    const generatedKey = this.generateRandomKey();
    const documentPayload ={
      key: newLocation.location_id,
      data: newLocation
    };

    this.http.post(this.apiUrl, documentPayload).subscribe(() => {
      this.locationSubject.next();
    },
    (error) =>{
      console.error('Error adding item on the server:', error);
    });
  }

  //Random key used for each location for ID purposes
  generateRandomKey(): string {
    const timestamp = Date.now().toString(36);
    const randomString = Math.random().toString(36).substring(2); 
    const randomKey = timestamp + randomString;
  
    return randomKey;
  }
}

//Location class used to hold information about predetermined locations
export interface MapLocation {
  location_id: string,
  location_name: string;
  location_x: number;
  location_y: number
}

