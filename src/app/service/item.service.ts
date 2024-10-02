import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ItemService {

  constructor() { }

  public simpleGetKeys(json:any):any[]{
    let tmp=json;
    let ret=[];
    let campi = tmp[0];
    for(let key in campi){
      ret.push(key);
    }
    return ret;

  }

  public createFilter(column:any[],list:any[]){
    let ret=[];
    let element=list[0];
    column.map(el=>{
      let tmp={
        label:el.label,
        filter:el.value,
        type:typeof(element[el.value])
      }
      ret.push(tmp);
    })
    return ret;
  }


  public trasformation(arr: any[]) {

    // trasforma i campi json in label adatti
    let ret = [];
    for (let i = 0; i < arr.length; i++) {
      let str = arr[i];
      let tmp = str.split(/(?=[A-Z])/);
      let word: string = tmp[0];
      word = word.charAt(0).toUpperCase() + word.slice(1);

      for (let j = 1; j < tmp.length; j++) {
        word = word + " " + tmp[j].toLowerCase();
      }

      let map = { label: word, value: str };

      ret.push(map);
    }

    return ret;
  }
}
