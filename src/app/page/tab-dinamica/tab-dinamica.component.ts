import {

  Component, Input, OnDestroy, OnInit, SimpleChanges, ViewChild,
  ViewContainerRef
} from '@angular/core';
import {MatCheckboxChange} from '@angular/material/checkbox';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {MatTableDataSource} from '@angular/material/table';
import {Subscription} from 'rxjs';
import {expandRowAnimation} from 'src/app/animations/expand-row.animations';
import {LoaderService} from 'src/app/components/loader/loader.service';
import {InfoService} from 'src/app/services/common/info.service';
import {ItemService} from 'src/app/services/common/item.service';
import {ModalService} from 'src/app/services/common/modal.service';
import {ResponseCheckerService} from 'src/app/services/common/response.checker.service';
import {CommonService} from 'src/app/services/gate/common.service';

@Component({
  selector: 'app-tab-dinamica',
  templateUrl: './tab-dinamica.component.html',
  styleUrls: ['./tab-dinamica.component.css'],
  animations: [expandRowAnimation],
})
export class TabDinamicaComponent implements OnInit,OnDestroy {
  @Input() res: any;  // Riceve i dati dal padre
  @Input() config: any;//info di configurarezione
  @ViewChild('dynamicComponentContainer', {read: ViewContainerRef, static: true}) viewContainerRef: ViewContainerRef;

  public modalData: any;
  public filterObj: any;
  @Input() inputService: any; //service da usare ricevuto dal padre
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  public lista: any;
  public displayedColumns: any;
  public sortableColumns: any;
  public allColumns: any[];
  public dataSource: MatTableDataSource<any>;
  public mappaColonne: Map<string, string>;
  public columnsOrderTypes: any;
  public ordinamentiColonne: any;
  private filterTipo: any;
  public showAccordion: boolean = false;
  public expandedElement: any;

  public info: any;
  public eur: any[] = [];

  public model: {
    pagination: { indexPagination: number; totalResult: number };
  };
  public allRequestObj: any;

  private selectedFilters: any;
  private genericSrv: any;
  selectedCheckboxes: any;
  allChecked: boolean;
  private subscriptions: Subscription = new Subscription();
  public showDynamicAccordion: boolean;
  public titleAccordion: string;
  public showTitleAccordion: boolean;


  constructor(
    private loaderSrv: LoaderService,
    private commonSrv: CommonService,
    private modalSrv: ModalService,
    private itemSrv: ItemService,
    private infoSrv: InfoService,
  ) {

    this.showDynamicAccordion = false;
    this.showTitleAccordion = false;

  }

  ngOnInit(): void {
    this.loadDynamicComponent();

  }


  ngOnChanges(changes: SimpleChanges): void {
    if (changes['res'] && changes['config']) {  //appena arriva la response parte la costruzione della tabella
      console.log(this.config)
      this.initializeComponent();
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();


  }


  loadDynamicComponent(): void {
    return;


  }

  private initializeComponent(): void {
    if (this.res) {

      this.genericSrv = this.inputService; //castizzazione del service in entrata


      if (this.res?.data?.body?.payload?.data) {
        this.populateTable(this.res.data.body.payload.data);

      } else {
        this.populateTable(this.res.data);
      }


      this.columnsOrderTypes = ["CREATED", "DESC", "ASC"];
      this.ordinamentiColonne = this.initOrdinamentiColonne(
        this.sortableColumns,
        this.columnsOrderTypes
      );
      this.model = {
        pagination: {
          indexPagination: 0,
          totalResult:
            this.res.data.body && this.res.data.body.payload.data
              ? this.res.data.body.payload.total
              : [],
        }

      }
      this.allRequestObj = this.getRequestObject();
    } else {
      this.dataSource = new MatTableDataSource([]);
      this.config = this.infoSrv.getInfo('default'); //get delle info di configurazione di default
    }
  }

  public print() {
  }


//FUNZIONI :
//le funzioni non sono realmente scritte nel componente,
//richiamano altre funzioni create o nell info o nel service specializzato del padre

  public add(label, element?) { //funzione di aggiunta
    let data = {
      element: element ? element : null,
      callBy: "",
      titolo: "",
      icona: "add",
    };
    this.genericSrv[label](data);
    this.subscriptions.add(
      this.genericSrv.emit.subscribe((res) => {
        if (res) {
          this.applyFilter();
        }
      })
    );
  }


  //i bottoni sono presi dall info di configurazione
  //i bottoni sono oggetti formati da più informazioni fra cui la funzione che devono usare
  //che è descritta nel campo action .
  //

  public actionClickButtonItemMenuContestuale(item, element?) {
    let data = {
      element: element ? element : null,
      callBy: item.value,
      titolo: "",
      icona: element ? "edit" : "add",
    };
    item.action(data, item);
    this.subscriptions.add(
      this.genericSrv.emit.subscribe((res) => {
        if (res) {
          this.applyFilter();
        }
      })
    );
  }

  public base64ToExcel(base64String, fileName) {
    const binaryString = atob(base64String);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    const arrayBuffer = bytes.buffer;
    const blob = new Blob([arrayBuffer], {type: "application/vnd.ms-excel"});
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();

    // Clean up
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }


  //la configurazione ha fra le sue informazioni anche la presenza o meno di un accordion
  //nel caso ci fosse un accordion questo può essere presente giò nel json della resolve e
  //viene dichiarato in info.whoIsAccordion oppure essere richiamato da una funzione che penderà il nome
  //sempre di getAccordionData nel service padre.
  public getAccordionData(element: any) {
    this.showTitleAccordion = false;
    if (this.config.accordion) {
      if (element[this.config.whoIsAccordion]) {
        element.dataAccordion = element[this.config.whoIsAccordion];
        element.dataAccordion.info = this.config.whoIsAccordion;
        element.dataAccordion.idPadre = element.id ? element.id : 99;
        this.titleAccordion = this.config.titleAccordion;
        this.showTitleAccordion = true;
        element.showAccordion = true;

        return;
      } else if (this.config.typeAccordion == "dynamic") {
        this.showDynamicAccordion = true;
        //  this.loadDynamicComponent();
        return;

      } else {
        this.genericSrv.getAccordionData(element).then(res => {
          if (res.body.result == "SUCCESS") {
            if (!res.body.payload) {
              element.dataAccordion = false;

              this.titleAccordion = "Nessun " + this.config.titleAccordion + " presente";

              this.titleAccordion = this.titleAccordion.toLowerCase();

              this.showTitleAccordion = true;
              return;


            }
            let ret = res.body.payload;
            this.titleAccordion = this.config.titleAccordion;
            this.showTitleAccordion = true;

            if (typeof this.genericSrv.modifyData=="function") {
              ret = this.genericSrv.modifyData(ret);
            }
            element.dataAccordion = ret;
            if(ret.terapie){
              element.dataAccordion=ret.terapie;
            }

              element.dataAccordion.info = this.config.titleAccordion;
            element.dataAccordion.idPadre = element.id ? element.id : 99;

            element.showAccordion = true;
            return;
          }
        })


      }
    }
  }

  public getData() {
    let params = {
      page: 0,
      pageable: true,
      numeroElementi: 20,
      ordinamento: "ASC",
      campoOrdinamento: this.config.campoOrdinamento ? this.config.campoOrdinamento
        : "id",
      filter: this.selectedFilters || {},
    };
    this.genericSrv
      .getAll(params)
      .then((resp) => {
        if (ResponseCheckerService.isSuccessResponse(resp.body)) {
          this.populateTable(resp.body.payload.data);
          this.columnsOrderTypes = ["CREATED", "DESC", "ASC"];
          this.ordinamentiColonne = this.initOrdinamentiColonne(
            this.sortableColumns,
            this.columnsOrderTypes
          );
          this.res = resp;

          this.model = {
            pagination: {
              indexPagination: 0,
              totalResult:
                this.res.body && this.res.body.payload
                  ? this.res.body.payload.total
                  : this.res.data.body && this.res.data.body.payload
                    ? this.res.data.body.payload.total
                    : [],
            },
          };
        } else {
          let mess = ResponseCheckerService.getErrorMessage(resp.body);
          this.modalSrv.openErrorDialog(
            mess || "Errore di comunicazione con il server"
          );
          this.dataSource = new MatTableDataSource();
        }
      })
      .finally(() => {
        this.loaderSrv.hide();
      });
  }

  public upload() {
    let params = {
      title: "Import",
      width: "500px",
      dataParam: {
        editable: true,
        pageable: false,
        import: true,
        hideDescription: true,
        filter: {},
      },
    };
    let ret = this.genericSrv.input(params);
    this.subscriptions.add(
      this.genericSrv.eventEmit.subscribe((res) => {
        if (res.resultAllegati == "ELABORAZIONE ESEGUITA CON SUCCESSO") {
          this.applyFilter();
        } else {
          this.modalSrv.openErrorDialog("caricamento non andato a buon fine");
        }
      })
    );
  }

  public onUpload(e) {

    const file = e.target.files[0];
    const reader = new FileReader();
    let param = {};
    reader.readAsDataURL(file);
    reader.onload = () => {
      param["base64"] = reader.result?.toString()?.split("base64,")[1];
      param["nomeFile"] = file.name;
      this.genericSrv.postExport(param).then((resp) => {
        if (ResponseCheckerService.isSuccessResponse(resp.body)) {

          if (resp.body.payload.errore) {
            this.modalSrv.openErrorDialog(resp.body.payload.errore);
          } else {
            this.modalSrv.openFeedbackModal({
              success: "File importato con successo.",
            });
          }
        }
      });
    };
  }

  public actionClickExport() {

    let params = {
      page: 0,
      pageable: false,
      numeroElementi: 0,


      orderBy: "id",
      sorterOrder: "DESC",
    };
    for (let key in this.selectedFilters) {
      params[key] = this.selectedFilters[key];
    }
    this.genericSrv.export(params);
    this.subscriptions.add(
      this.genericSrv.eventEmit.subscribe((res) => {
      }));
  }


  public getRequestObject(event?, campoOrdinamento?, orderType?, element?) {
    let filter;

    let obj = {
      page: event
        ? event.pageIndex
        : this.paginator
          ? this.paginator.pageIndex
          : 0,
      numeroElementi: this.paginator ? this.paginator.pageSize : 20,
      pageable: true,
    };
    filter = this.selectedFilters ? this.selectedFilters : {};
    filter["tipo"] = this.filterTipo;
    obj["campoOrdinamento"] =
      campoOrdinamento && orderType && orderType != "CREATED"
        ? campoOrdinamento
        : null;
    obj["ordinamento"] =
      orderType && orderType != "CREATED" ? orderType : "DESC";
    filter = this.commonSrv.clearFilters(filter);
    obj["filter"] = filter;

    return obj;
  }

  public setValue(el: any, col: any) {
    if( typeof el =="string" && el.includes("_")){
       let words=el.toLowerCase().split("_");
       let formatString=words.map((word,index) =>{
        return index ===0  ? word.charAt(0).toUpperCase() + word.slice(1) : word
       }

      )


 el=formatString.join(' ');



    }
    if (!el && el != 0) {
      return "N/D";
    }
    if (el == 0 && typeof el == "number") {
      return el;
    }
    if (typeof el == "string") {
      return el.charAt(0).toUpperCase() + el.slice(1);
    }
    if (el == "") {
      return "N/D";
    }
    let ret: any;
    if (col.includes("Date")) {
      let str: string = el;
      if (str.length > 4) {
        let num = str.indexOf("T");

        str = str.slice(0, num);
        return str;
      } else {
        return el;
      }
    }

    if (this.eur.includes(col)) {
      el = Number(el);
      ret = el.toLocaleString() + "€";
      return ret;
    }

    return el.toString().toLowerCase();
  }


  //tutti i campi del json vengono trasformati in colonne nessuna eccezione ,
  //se ce ne fossero alcuni che non vogliamo vedere basterà inserirli nell 'array hidden presente nelle
  //info di configurazione.
  //Ad esempio se ci fosse un campo che per noi è un Accordion non vogliamo vederlo fra le colonne e allora andrebbe messo
  //hidden.
  public hidden(el: any) {
    if (this.config.hidden && this.config.hidden.includes(el)) {
      return true;
    }
    return false;
  }

  //Setta la classe di un particolre elemento , in via di definizione in maniera dinamica
  //sarà inserito un array "Color" in info a cui fare riferimento
  public setColor(val: any, col: any) {

//    }
    if (this.config.color && this.config.color.includes(col)) {
      let tmp = col.replace(/\s+/g, '').toUpperCase();

console.log(tmp)
      return tmp;
    }


    return "NOCLASS";
  }


  //populateTable è la funzione che is occupa di creare la tab.
  //tramite l itemSrv crea una coppia label value delle key del json
  //cosi che ad esempio che codiceFsicale diventi {label:Codice fiscale,value:codiceFiscale}
  //e possa essere usato nell html per avere una costruzione dinamica della tabella.
  //NB funziona solo se le keys del json sono scritte in camelCase

  private populateTable(response: any) {
    this.allColumns = [];


    if (this.config.edit) {
      this.allColumns.push("edit");
    }
    if (this.config.listMenu) {
      this.allColumns.push();
    }

    if (this.config.checkbox) {
      this.allColumns.push("checkbox");
      this.selectedCheckboxes = [];
    }
    if (this.config.import) {
      this.allColumns.push("import");
    }


    if (this.config.ordine) {
      response = this.config.ordine(response);
    }
    this.lista = this.itemSrv.simpleGetKeys(response);

    this.displayedColumns = this.lista;
    this.sortableColumns = this.displayedColumns;
    this.allColumns.push(...this.displayedColumns);
    if (this.config.accordion) {
      this.allColumns.push("iconAccordion")
    }

    this.displayedColumns = this.itemSrv.trasformation(this.displayedColumns);
    // this.dataSource = new MatTableDataSource(response.payload.list);
    this.dataSource = new MatTableDataSource(response);
    // this.filterObj = this.itemSrv.createFilter(
    //   this.displayedColumns,
    //   response.payload.list
    // );
    this.filterObj = this.itemSrv.createFilter(this.displayedColumns, response);

  }

  toggleCheckboxSelection(event: MatCheckboxChange, row: any) {
    if (event.checked) {
      this.selectedCheckboxes.push(row);
    } else {
      const index = this.selectedCheckboxes.indexOf(row);
      if (index > -1) {
        this.selectedCheckboxes.splice(index, 1);
      }
    }
  }


  public allSelection(event: MatCheckboxChange) {
    if (event.checked) {
      this.allChecked = true;
      this.dataSource.data.map((el) => {
        this.selectedCheckboxes.push(el);
      });
    } else {
      this.allChecked = false;
      this.selectedCheckboxes = [];
    }
  }

  //nel caso di checkbox chiama la funzione legata alle checkbox
  public sendSelected() {
    this.genericSrv.sendCheckbox();
    this.subscriptions.add(
      this.genericSrv.eventEmit.subscribe((res) => {
        if (res.body.result == "ELABORAZIONE ESEGUITA CON SUCCESSO") {
          this.applyFilter();
        } else {
          this.modalSrv.openErrorDialog(res.bosy.result);
        }
      })
    );
  }

  public applyFilter(
    event?,
    takeOrder?,
    campoOrdinamento?,
    orderType?,
    resetPaginator?,
    element?
  ): void {
    this.loaderSrv.show();
    if (!event && this.paginator) this.paginator.firstPage();
    if (this.paginator) this.paginator.pageIndex = event ? event.pageIndex : 0;
    if (resetPaginator) this.paginator.firstPage();
    this.allRequestObj = this.getRequestObject(
      event,
      this.allRequestObj["campoOrdinamento"] || "",
      this.allRequestObj["ordinamento"] || "desc",
      element
    );



    this.genericSrv
      .getAll(this.allRequestObj)
      .then((resp: any) => {
        if (resp.body && resp.body.payload) {
          this.res = resp;
          this.populateTable(resp.body.payload.data);
          this.dataSource.sort = this.sort;
          this.model = {
            pagination: {
              indexPagination: 0,
              totalResult:
                this.res.body && this.res.body.payload
                  ? this.res.body.payload.total
                  : this.res.data.body && this.res.data.body.payload
                    ? this.res.data.body.payload.total
                    : [],
            },
          };
        } else {
          this.modalSrv.openErrorDialog("Errore FILTRI");
        }
      })
      .finally(() => {
        this.loaderSrv.hide();
      });
  }

  public initOrdinamentiColonne(columnNames?: string[], orderTypes?) {
    orderTypes = orderTypes || ["id", "desc", "asc"];
    const ordinamentiColonne = [];
    columnNames.forEach((columnName) => {
      ordinamentiColonne.push(
        this.createOrdinamentoColonneObj(columnName, orderTypes)
      );
    });
    return ordinamentiColonne;
  }

  public createOrdinamentoColonneObj(
    columnName: string,
    orderTypes?: any[],
    orderTypeCounter?: number
  ) {
    return {
      columnName: columnName,
      orderTypes: orderTypes ? orderTypes : ["id", "desc", "asc"],
      orderTypeCounter: orderTypeCounter ? orderTypeCounter : 0,
    };
  }

  public getColumnByName(ordinamentiColonne, columnName) {
    let result;
    ordinamentiColonne.forEach((col) => {
      if (col.columnName === columnName) result = col;
    });
    return result;
  }

  public cycleOrdinamentoColonna(
    ordinamentiColonne,
    columnType: string,
    orderTypes: string[]
  ) {
    let maxCount = orderTypes.length;
    ordinamentiColonne.forEach((el) => {
      if (el.columnName === columnType) {
        el.orderTypeCounter =
          el.orderTypeCounter + 1 === maxCount ? 0 : el.orderTypeCounter + 1;
      }
    });
    return ordinamentiColonne;
  }

  public cercaFilters(selection: any) {
    this.selectedFilters = selection;
    this.applyFilter(
      null,
      null,
      this.allRequestObj["campoOrdinamento"] || "",
      this.allRequestObj["ordinamento"] || "desc",
      true
    );
  }

  public reload(element?) {
    return;
  }

  public orderByColumnName(campoOrdinamento?) {
    this.ordinamentiColonne = this.cycleOrdinamentoColonna(
      this.ordinamentiColonne,
      campoOrdinamento,
      this.columnsOrderTypes
    );
    let column = this.getColumnByName(
      this.ordinamentiColonne,
      campoOrdinamento
    );
    if (column) {
      this.loaderSrv.show();
      let orderType = column.orderTypes[column.orderTypeCounter];
      this.allRequestObj = this.getRequestObject(
        null,
        campoOrdinamento,
        orderType
      );
      this.genericSrv
        .getAll(this.allRequestObj)
        .then((resp) => {
          if (ResponseCheckerService.isSuccessResponse(resp.body)) {
            this.populateTable(resp.body.payload.data);
            this.model = {
              pagination: {
                indexPagination: 0,
                totalResult:
                  this.res.data.body && this.res.data.body.payload.data
                    ? this.res.data.body.payload.total
                    : [],
              }

            }
          } else {
            this.modalSrv.openErrorDialog("Internal server error");
          }
        })
        .finally(() => {
          this.loaderSrv.hide();
        });
    }
  }
}
