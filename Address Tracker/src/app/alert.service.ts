import { Injectable } from '@angular/core';
import { Subject, forkJoin } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})

export class AlertService {

  alerts:Alert[] =[];
  alertsSubject = new Subject<void>(); 
  private readonly apiUrl = 'https://272.selfip.net/apps/IAzabmC9H7/collections/data2/documents/';

  constructor(private http: HttpClient) {
    this.fetchData();
  }

  //Gets array of alert objects from server
  fetchData(){
    this.http.get<any[]>(this.apiUrl).subscribe((data) =>{
      this.alerts = data.map((item) => item.data);
      this.alertsSubject.next();
    });
  }

  get(){
    return this.alerts;
  }

  //Adds new alert object to array and to the server
  add(newAlert: Alert){
    this.alerts.push(newAlert);

    const documentPayload ={
      key: newAlert.id,
      data: newAlert
    };

    this.http.post(this.apiUrl, documentPayload).subscribe(() =>{
      this.alertsSubject.next();
    },
    (error) =>{
      console.error('Error adding item on the server:', error);
    });
  }

  //Removes alert from array and from the server
  delete(del_alert: string) {
    const alertToDelete = this.alerts.find((alert) => alert.id === del_alert);
  
    if (alertToDelete){
      this.alerts = this.alerts.filter((p) => p.id !== del_alert);
      const deleteUrl = `${this.apiUrl}${del_alert}`;
      this.http.delete(deleteUrl).subscribe(() =>{
        this.alertsSubject.next();
      },
      (error) =>{
        console.error('Error deleting item on the server:', error);
      });
    }
  }

  //Updates status of an alert on both array and server
  updateStatus(UpdateID: string){

    const alertToUpdate = this.alerts.find((alert) => alert.id === UpdateID);

    const documentPayload ={
      key: alertToUpdate!.id,
      data: alertToUpdate
    };

    const updateURL = `${this.apiUrl}${alertToUpdate!.id}`;
    this.http.put(updateURL, documentPayload).subscribe(() =>{
      this.alertsSubject.next();
    },
    (error) =>{
      console.error('Error updating server:', error);
    });
  }
}

//Class of alerts used to hold information about each report
export interface Alert {
  id: string;
  name: string;
  phone: string;
  location: string;
  x: number;
  y: number
  time: any;
  reporter: string;
  status: string;
  extra:string;
  [key: string]: any;
  imageUrl?: string;
}


