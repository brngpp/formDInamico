import { Component, ElementRef, Renderer2, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ControlType, myFormControl } from './Class/myFormControl';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  form: FormGroup;

  constructor(private el: ElementRef) {
    this.form = new FormGroup({
nome: new myFormControl("giu",ControlType.Text)  as myFormControl<any>,
eta: new myFormControl(1,ControlType.Select,[0,1,2,3,4])  as myFormControl<any>,
birth:new myFormControl(new Date(),ControlType.Date)  as myFormControl<any>,

    });

  }


  getFormControlValue(controlName: string): string {
    const control = this.form.get(controlName);
    if (control instanceof FormControl) {
      return control.value;
    }
    return '';
  }

  getList(controlName: string): any[] | null  {
    const control = this.form.get(controlName) ;
    if (control instanceof myFormControl && control.list) {

      return control.list;
    }
    return null;
  }

  print(s:any){
    console.log(this.form.get(s)?.value)
  }

  formControlsNames(): string[] {
    return Object.keys(this.form.controls);
  }

  getControlType(controlName: string): any {
    const control = this.form.get(controlName) ;
    if (control instanceof myFormControl ) {

      return control.type;
    }
    return null;

  }

  getSelectOptions(controlName: string): string[] {
    return this.form.get(controlName)?.value?.options || [];
  }

  getFormControl(controlName: string): FormControl {
    const control = this.form.get(controlName);
    if (!(control instanceof FormControl)) {
      // Puoi gestire questo caso in modo appropriato (lanciare un'eccezione, restituire un FormControl di fallback, ecc.)
      throw new Error('Il controllo non è un FormControl');
    }
    return control;
  }








}

