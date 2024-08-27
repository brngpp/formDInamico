import { FormControl } from '@angular/forms';

// Enum per i tipi ammessi
export enum ControlType {
  Text = 'text',
  Number = 'number',
  Date = 'date',
  Select = 'select',
}

export class myFormControl<T> extends FormControl {
  private _type: ControlType; // Utilizza l'enum come tipo
  private _list?: any[]; // Campo list reso opzionale

  constructor(value: T, type: ControlType, list?: any[], validatorOrOpts?: any, asyncValidator?: any) {
    super(value, validatorOrOpts, asyncValidator);
    this._type = type;
    this._list = list;
  }

  // Getter per il campo type
  get type(): ControlType {
    return this._type;
  }

  // Setter per il campo type
  set type(value: ControlType) {
    this._type = value;
  }

  // Getter per il campo list
  get list(): any[] | undefined {
    return this._list;
  }

  // Setter per il campo list
  set list(value: any[] | undefined) {
    this._list = value;
  }
} 