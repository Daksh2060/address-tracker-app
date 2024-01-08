import { Component } from '@angular/core';
import { AlertService, Alert } from '../alert.service';
import { Router } from '@angular/router';
import { Md5 } from 'ts-md5';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-alert-list',
  templateUrl: './alert-list.component.html',
  styleUrls: ['./alert-list.component.css']
})

export class AlertListComponent{

  alert: Alert[];
  sortField: string;
  sortOrder: string;
  hash: string = "fcab0453879a2b2281bc5073e3f5fe54";
  private subscription: Subscription = new Subscription();
  
  constructor(private as: AlertService, private router: Router){
    this.alert = [];
    this.sortField = 'name'; 
    this.sortOrder = 'desc'; 
  }

  onDelete(evt: any, alertID: string){
    evt["alert_name"] = alertID;  
    this.as.delete(alertID);
  }

  //Ensures array of alerts is loaded before generating list display
  ngOnInit(): void {
    this.alert = this.as.get();

    this.subscription = this.as.alertsSubject.subscribe(() =>{
      this.alert = this.as.get();
    });
  }

  ngOnDestroy(): void{
    this.subscription.unsubscribe();
  }

  onView(alertID: string){
    this.router.navigate(["/alert", alertID]);
  }
  
  //Used to sort by acending or descending order for each column
  onSort(field: string){
    if(field === this.sortField){
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } 
    else{
      this.sortField = field;
      this.sortOrder = 'asc';
    }
  
    this.alert = this.sortAlerts();
  }

  sortAlerts(){
    return this.alert.sort((a, b) =>{
      const order = this.sortOrder === 'asc' ? 1 : -1;

      if(a[this.sortField] > b[this.sortField]){
        return order;
      } 
      else if(a[this.sortField] < b[this.sortField]){
        return -order;
      }

      return 0;
    });
  }

  //Uses MD5 hash to check for password before deleting
  promptForPasswordAndDelete(alertID: string){
    const enteredPassword = prompt('Enter password to delete:\nHint: The password is "BaggyJeans"');
    
    if(enteredPassword !== null){
      const enteredHash = Md5.hashStr(enteredPassword).toString();

      if(enteredHash === this.hash){
        this.as.delete(alertID);
        console.log(`Alert on ${alertID} just got deleted`);
      } 
      else{
        alert('Incorrect password, unable to delete');
      }
    }
  }
}

