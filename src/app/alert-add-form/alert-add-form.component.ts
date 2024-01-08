import { Component } from '@angular/core';
import { FormControl, FormGroup , Validators, ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
import { Alert, AlertService } from '../alert.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { LocationsService, MapLocation } from '../locations.service';

const NORTHERN_LIMIT = 49.35;
const SOUTHERN_LIMIT = 49.10;
const WESTERN_LIMIT = -123.30;
const EASTERN_LIMIT = -122.60;

@Component({
  selector: 'app-alert-add-form',
  templateUrl: './alert-add-form.component.html',
  styleUrls: ['./alert-add-form.component.css']
})

export class AlertAddFormComponent {
  form: FormGroup
  useCustom: boolean = false;
  locations: MapLocation[];
  private subscription: Subscription = new Subscription();

  constructor(private as: AlertService, private router: Router, private ls: LocationsService){

    this.locations = [];

    let formControls = {
      name: new FormControl('', [
        Validators.required,
        Validators.minLength(1),
        this.maxLengthValidator(30),
      ]),
      location: new FormControl('', [
        Validators.required,
      ]),
      phone: new FormControl('', [
        Validators.required,
        Validators.minLength(1),
        this.phoneFormatValidator(),
      ]),
      y: new FormControl('', []),
      x: new FormControl('', []),
      reporter: new FormControl('', [
        Validators.required,
        Validators.minLength(1),
      ]),
      extra: new FormControl('', [
        Validators.required,
        Validators.minLength(1),
      ]),
      imageUrl: new FormControl('', [
        this.imageUrlFormatValidator(),
      ]),
    }
  
    this.form = new FormGroup(formControls);
    
    this.form.get('x')!.clearValidators();
    this.form.get('y')!.clearValidators();
  }

  ngOnInit(): void{
    this.locations = this.ls.get();
    this.subscription = this.ls.locationSubject.subscribe(() =>{
      this.locations = this.ls.get(); 
    });
  }

  ngOnDestroy(): void{
    this.subscription.unsubscribe();
  }

  imageUrlFormatValidator(): ValidatorFn{
    return (control: AbstractControl): ValidationErrors | null =>{
      const imageUrl = control.value;
      const imageUrlRegex = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/;
  
      if(imageUrl && !imageUrlRegex.test(imageUrl)){
        return {invalidImageUrlFormat: true, message: 'Please enter a valid URL or leave blank.'};
      }

      return null;
    };
  }

  phoneFormatValidator(): ValidatorFn{
    return (control: AbstractControl): ValidationErrors | null =>{
      const phoneNumber = control.value;
      const phoneRegex = /^\d{3}-\d{3}-\d{4}$/;

      if(!phoneRegex.test(phoneNumber)){
        return {invalidPhoneFormat: true, message: 'Phone number must be in the format: ###-###-####'};
      }

      return null;
    };
  }

  maxLengthValidator(maxLength: number): ValidatorFn{
    return (control: AbstractControl): ValidationErrors | null =>{
      const value = control.value;
  
      if(value && value.length > maxLength){
        return{
          maxLengthExceeded: true,
          message: `Villain name cannot exceed ${maxLength} characters.`,
        };
      }
  
      return null;
    };
  }

  //Ensures custom entered coordinates are within the lower mainland of BC
  validateCoordinate(coordinate: string): ValidatorFn{
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
  
      if(coordinate === 'y'){

        if(value < WESTERN_LIMIT || value > EASTERN_LIMIT){
          return { invalidCoordinate: true, message: `Longitude must be between ${WESTERN_LIMIT}°W and ${EASTERN_LIMIT}°W `};
        }
      } 
      else if(coordinate === 'x'){ 

        if(value < SOUTHERN_LIMIT || value > NORTHERN_LIMIT){
          return { invalidCoordinate: true, message: `Latitude must be between ${SOUTHERN_LIMIT}°N and ${NORTHERN_LIMIT}°N`};
        }
      }
  
      return null;
    };
  }

  onSubmit(){
    const xControl = this.form.get('x');
    const yControl = this.form.get('y');
    const newLocation = this.form.get('location')!.value;

    const newAlert: Alert = {
      id: this.generateUniqueId(),
      name: this.form.get('name')!.value,
      phone: this.form.get('phone')!.value,
      reporter: this.form.get('reporter')!.value,
      location:"",
      x:0,
      y:0,
      extra: this.form.get('extra')!.value,
      imageUrl: this.form.get('imageUrl')!.value,
      time: new Date().getTime(),
      status: 'OPEN',
    };

    if(this.useCustom){
      const temp_location: MapLocation ={
        location_id: this.ls.generateRandomKey(),
        location_name: newLocation,
        location_x: +xControl!.value,
        location_y: +yControl!.value
      }

      const exists = this.locations.some(location => location.location_name === temp_location.location_name);

      /*If a location is already in the predetermined list, user should change name or use that option*/
      if(!exists){
        this.ls.add(temp_location);
      } 
      else{
        window.alert("Location name already available, please use a different name or pick from the pre-defined location list");
        return;
      }

      newAlert.location = newLocation;
      newAlert.x = +xControl!.value; 
      newAlert.y = +yControl!.value;
    } 
    else{
      newAlert.location = newLocation;
      let foundLocation = this.locations.find(location => location.location_name === newLocation);
      newAlert.x = foundLocation!.location_x;
      newAlert.y = foundLocation!.location_y;
    }

    this.as.add(newAlert);
    this.router.navigate(['/alerts']);
  }

  //Unique ID used to identify objects when deleting or searching
  generateUniqueId(): string{
    return Date.now().toString() + Math.random().toString(36).substring(2);
  }

  //Custom switch box for location
  onCheckboxChange(){
    this.useCustom = !this.useCustom;
  
    const locationControl = this.form.get('location')!;
    const xControl = this.form.get('x')!;
    const yControl = this.form.get('y')!;
  
    if(this.useCustom){
      locationControl.clearValidators();
      locationControl.setValidators(Validators.required);
  
      xControl.setValidators([Validators.required, this.validateCoordinate('x')]);
      yControl.setValidators([Validators.required, this.validateCoordinate('y')]);
    } 
    else{
      locationControl.clearValidators();
      locationControl.setValidators(Validators.required);
  
      xControl.clearValidators();
      yControl.clearValidators();
    }
  
    locationControl.updateValueAndValidity();
    xControl.updateValueAndValidity();
    yControl.updateValueAndValidity();
  }
}


