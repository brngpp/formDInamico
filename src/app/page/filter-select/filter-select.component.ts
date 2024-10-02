import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-filter-select',
  templateUrl: './filter-select.component.html',
  styleUrls: ['./filter-select.component.css']
})
export class FilterSelectComponent implements OnInit, OnChanges, AfterViewInit  {
  @Output() filterEvent = new EventEmitter();
  @Input() filterObj;
  @Input() fixedFilters:any[];
  public formGroup: FormGroup;
  public listFiltri: any;
  public listSelectedFilters: any[];
  public placeholder: any;

  constructor() {

    this.formGroup = new FormGroup({
      filter: new FormControl('',[]),
      valore: new FormControl('',[])
    });

    this.listSelectedFilters = [];
  }

  ngAfterViewInit(): void {
    console.log("filterObj:",this.filterObj);
    if(this.fixedFilters){
      this.listSelectedFilters=[this.fixedFilters];
      let selectedObj = this.getFilterRequest(this.listSelectedFilters);
      this.filterEvent.emit(selectedObj);
      this.listSelectedFilters.map(a => {
        this.removeSelectedFilter(a.filter);
      });
      this.listSelectedFilters = this.uniqueValues(this.listSelectedFilters, 'filter')
    }
  }


  ngOnInit(): void {
  }

  public saveFiltro() {
    let valueFilter = this.formGroup.get('filter').value;
    this.listSelectedFilters.push({
      'filter': valueFilter,
      'filtroLabel': this.getFormLabel(this.formGroup.get('filter').value).label,
      'valore': this.formGroup.get('valore').value
    });
    this.formGroup.reset();
    this.removeSelectedFilter(valueFilter);
    let selectedObj = this.getFilterRequest(this.listSelectedFilters);
    this.filterEvent.emit(selectedObj);

    this.listSelectedFilters = this.uniqueValues(this.listSelectedFilters, 'filter')
  }

  public removeSelectedFilter(valueFilter){
    this.listFiltri.map((a, i) => {
      if(a.filter == valueFilter){
        this.listFiltri.splice(i, 1);
        this.listFiltri = Object.assign([], this.listFiltri);
      }
    });
  }

  public deleteAllFilters() {
    this.listSelectedFilters = this.fixedFilters? this.fixedFilters : [];
    let selectedObj = this.getFilterRequest(this.listSelectedFilters);
    this.filterEvent.emit(selectedObj);
    this.listFiltri = Object.assign([], this.filterObj);
  }

  public deleteSingleFilter(item: any) {

    const index = this.listSelectedFilters.indexOf(item);
    if (index >= 0) {
      this.listSelectedFilters.splice(index, 1);
    }
    let selectedObj = this.getFilterRequest(this.listSelectedFilters);
    this.filterEvent.emit(selectedObj);
    this.filterObj.map((a, i) => {
      if(a.filter == item.filter){
        this.listFiltri.push(a);
        this.listFiltri = Object.assign([], this.listFiltri);
      }
    });
  }

  public getFormLabel(value){
    let selectedObj = this.filterObj.find(a => a.filter == value);
    return selectedObj? selectedObj : value;
  }

  public getFilterRequest(selectedArr:any[]){
    let dataArr = {};
    if(selectedArr.length>0){
      selectedArr.map(val=>{

        let valoreFiltro = this.changeType(val.valore, this.getFormLabel(val.filter).type);
        if(val['filter'].includes('.')){
          let elements = val['filter'].split('.');
          elements.reverse();
          const nestedObject = elements.reduce((prev, current, i) => {
            return i==0?  {[current]: valoreFiltro} : {[current]:{...prev}}
          }, {});
          dataArr = nestedObject
        } else {
          dataArr[val.filter] = valoreFiltro;
        }
      });
    }

    return dataArr;
  }

  public changeType(value, type){
    if(type == 'boolean') {
      if(value.toUpperCase() == 'NO' || value.toUpperCase() == 'FALSE') return false;
      if(value.toUpperCase() == 'SI' || value.toUpperCase() == 'TRUE') return true;
    } else if(type == 'number') {
      return parseInt(value);
    } else if(type == 'date') {
      let dd = value.split('/')[0];
      let mm = value.split('/')[1];
      let yy = value.split('/')[2];
      return yy + '-' + mm + '-' + dd;
    } else if(type == 'month') {
      let dd = '01';
      let mm = value.split('/')[0];
      let yy = value.split('/')[1];
      //return new Date(yy + '-' + mm + '-' + dd);
      return yy + '-' + mm + '-' + dd;
    }
    else {
      return value;
    }
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if(changes.filterObj){
      this.filterObj = changes.filterObj.currentValue;
      this.listFiltri = Object.assign([], this.filterObj);
      this.listSelectedFilters.map(a => {
        this.removeSelectedFilter(a.filter);
      });
      this.listSelectedFilters = this.uniqueValues(this.listSelectedFilters, 'filter')
    }

    if(changes.fixedFilters){
      this.listFiltri = Object.assign([], this.filterObj);
      this.listSelectedFilters = changes.fixedFilters.currentValue;
      let selectedObj = this.getFilterRequest(this.listSelectedFilters);
      this.filterEvent.emit(selectedObj);
      this.listSelectedFilters.map(a => {
        this.removeSelectedFilter(a.filter);
      });
      this.listSelectedFilters = this.uniqueValues(this.listSelectedFilters, 'filter')
    }
  }

  public uniqueValues(array, field){
    let uniqueArray = [];
    array.map(val=>{
      let value = uniqueArray.find(a => a[field] == val[field]);
      if(!value){
        uniqueArray.push(val);
      }
    });
    return uniqueArray;
  }
}
