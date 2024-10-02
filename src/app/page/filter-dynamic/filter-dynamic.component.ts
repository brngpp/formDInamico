import { DinamicValidator } from "../../services/validators/Dinamic.validator";
import {
  Component,
  ElementRef,
  EventEmitter,
  Inject,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";

import { ControlType, myFormControl } from "src/app/interfaces/myFormControl";
import { ItemService } from "src/app/services/common/item.service";
import { CommonService } from "src/app/services/gate/common.service";

@Component({
  selector: "sadi-dinamic-filter",
  templateUrl: "./dinamic-filter.component.html",
  styleUrls: ["./dinamic-filter.component.scss"],
})
export class DinamicFilterComponent implements OnInit  ,OnChanges{
  @Input() legacyData: any;
  @Output() Outputdata = new EventEmitter<any>();
  public modalData: any;
  public model: { form: any };
  public onSuccessUpdate: boolean;
  public loading: boolean;
  public onErrorUpdate: boolean | string;
  public form: FormGroup;
  public titolo: string;
  public icona: string;
  public listControl: any;

  constructor(
    private itemSrv: ItemService,
    private DinamicVal: DinamicValidator,
    private commonSrv:CommonService
  ) {}
  async ngOnChanges(changes: SimpleChanges):Promise<void> {
    if(changes['legacyData']){
      if(this.legacyData!="default"){
        this.modalData = { callBy: "filter" + this.legacyData, data: null };
        console.log(this.modalData)
        this.form = await this.DinamicVal.getForm(
          this.modalData.callBy,
          this.modalData.data
        );
        this.listControl = this.getformControlsNames();
        this.titolo = this.modalData.titolo;
        this.icona = this.modalData.icona;
      }

    }
  }


  ngOnInit() {

  }



  getFormControlValue(controlName: string): string {
    const control = this.form.get(controlName);
    if (control instanceof FormControl) {
      return control.value;
    }
    return "";
  }

  getList(controlName: any, value?: string): any[] | null {
    const control = this.form.get(controlName.value.toString());
    let list = [];

    if (control instanceof myFormControl && control.list) {
      list = control.list;
      if (value && value.length > 2) {
        console.log("list:", list);
        return this.filterList(list, value, controlName);
      }
      return list;
    }

    return null;
  }

  print(s: any) {
    console.log(this.form.get(s)?.value);
  }

  getformControlsNames(): any {
    let list = Object.keys(this.form.controls);
    let newlist = this.itemSrv.trasformation(list);
    return newlist;
  }

  getControlType(controlName: string): any {
    const control = this.form.get(controlName);
    if (control instanceof myFormControl) {
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
      throw new Error("Il controllo non è un FormControl");
    }
    return control;
  }

  saveFiltro() {
for (const element in this.form.value) {
      console.log(element);
      if(element.includes("data") && this.form.get(element).value){
          let tmp=this.commonSrv.getMomentOperation(
            {
              operation: "format",
              date: this.form.get(element).value,
              format: "YYYY-MM-DD  HH:mm",
            },
            true
          );
          console.log("tmp2:",tmp);
          this.form.get(element).setValue(tmp);
      }
}


    this.Outputdata.emit(this.form.value);
  }

  clearField(controlName: string): void {
    const control = this.form.get(controlName);
    if (control instanceof FormControl) {
      control.reset(); // Imposta il valore del controllo a vuoto
    }
  }

  annulla() {
    this.form.reset();
  }

  getListNazioni(controlName: any, value?: string): any[] | null {
    const control = this.form.get(controlName.value.toString());
    let list = [];

    if (control instanceof myFormControl && control.list) {
      list = control.list;
      if (value && value.length > 2) {
        // Assicurati che il valore di input venga utilizzato per filtrare la lista
        return this.filterListNazioni(list, value, controlName);
      }
      return list;
    }

    return null;
  }

  filterList(list: any[], value: string, controlName: any): string[] {
    controlName.icon = "loading";
    controlName.ToolTip = "ricerca";
    const filterValue = value.toLowerCase();

    let list2 = list.filter((item) => item.toLowerCase().includes(filterValue));
    if (list2.length > 0) {
      controlName.icon = "auto_fix_high";
      controlName.ToolTip = "autocomplete dal terzo carattere";
    } else if (!list2 || list2.length == 0) {
      controlName.icon = "close";
      controlName.ToolTip = "nessun risultato trovato";
    }

    list = list2;
    return list;
  }

  filterListNazioni(list: any[], value: string, controlName: any): any[] {
    controlName.icon = "loading";
    controlName.ToolTip = "ricerca";
    const filterValue = value.toLowerCase();
    // Filtra la lista in base al valore di input
    let list2 = list.filter((item) =>
      item.denominazione.toLowerCase().includes(filterValue)
    );
    if (list2.length > 0) {
      controlName.icon = "auto_fix_high";
      controlName.ToolTip = "autocomplete dal terzo carattere";
    } else if (!list2 || list2.length == 0) {
      controlName.icon = "close";
      controlName.ToolTip = "nessun risultato trovato";
    }

    list = list2;
    return list;
  }
  onOptionSelected(event: any) {
    const selectedOptionId = event.option.value;
    const selectedOption = this.getList("nazioni", "")?.find(
      (option) => option.idCittadinanza === selectedOptionId
    );
    if (selectedOption) {
      // Imposta il valore del form control al testo dell'opzione selezionata
      this.form.get("nazioni")?.setValue(selectedOption.denominazione);
    }
  }
}
