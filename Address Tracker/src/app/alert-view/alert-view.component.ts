import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Alert, AlertService } from '../alert.service';
import { Md5 } from 'ts-md5';

@Component({
  selector: 'app-alert-view',
  templateUrl: './alert-view.component.html',
  styleUrls: ['./alert-view.component.css']
})

export class AlertViewComponent{

  alert: Alert;
  pid: string;
  hash: string = "fcab0453879a2b2281bc5073e3f5fe54";
  
  constructor(private ActivatedRoute: ActivatedRoute ,private as: AlertService){

    this.pid = this.ActivatedRoute.snapshot.params['id'];
    this.alert = this.as.get().find(alert => alert.id === this.pid)!;
  }

  //Uses MD5 hash to ask for password before changing status of alert
  changeStatus(){
    const enteredPassword = prompt('Enter password to change status:\nHint: The password is "BaggyJeans"');

    if(enteredPassword !== null){
      const enteredHash = Md5.hashStr(enteredPassword).toString();

      if(enteredHash === this.hash){
     
        this.alert.status = this.alert.status === 'OPEN' ? 'RESOLVED' : 'OPEN';
        this.as.updateStatus(this.pid);
      } 
      else{
        alert('Incorrect password, status change denied');
      }
    }
  }
}
