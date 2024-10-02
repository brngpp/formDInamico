import {listaIndaginiStrumentaliService} from "../gate/lista-indagini-strumentali.service";
import {MagazzinoFarmaciService} from "src/app/services/gate/magazzinoFarmaci.service";
import {Injectable} from "@angular/core";
import {LottoService} from "../gate/lotto.service";
import {Router, ROUTER_CONFIGURATION} from "@angular/router";
import {ROUTING_PATH_CONSTANTS} from "../../constants/app.path-constants";
import {PrescrizioniService} from "../gate/prescrizioni.service";
import {
  DettaglioPrescrizioniComponent
} from "src/app/components/dettaglio-prescrizioni/dettaglio-prescrizioni.component";
import {PazientiService} from "../gate/pazienti.service";
//  GUIDA UTILIZZO COMPONENTE DINAMICO
//       1) dichiarare componente padre che avrà il nome della pagina ceh si vuole creare.
//       2) inserire la tabella come figlio all'interno del componente padre , passargli i seguenti input
//             a.inputService il service che userà la tabDinamica , creata appositamente per la pagina
//             b.callBy valore striga dichiarato nell'app routing della pagina , servirà a richiare le info di
//               configurazione della pagina
//             c.res , è la resolve della pagina padre che contiene i dati della pagina
interface info {
  accordion: boolean; //booleano per sapere se cè un accordion
  whoIsAccordion: string; //key nel valore nel json se l accordion è un campo del json
  typeAccordion: string; //due tipi di accordion innestatic classic e table, classic lista di informazioni adatto a piccoli accordion
  //    table una piccola tabella con possibilità di bottoni , nel caso va creata l info anche della tableAccordion
  titleAccordion: string; //titolo dell'accordion
  edit: boolean; //se la pagina ha un pulsante aggiungi/modifica(classico pulsante verde il alto a sinistra sopra prima colonna)
  haveImport: boolean; //se ha la funzione di import(pulsante blu in alto a destra)
  haveExport: boolean; //se ha la funzione di export(pulsante verde export in alto a destra)
  hidden: any[]; //quali colonne vanno nascoste
  ordine: any; //nel caso il json arrivasse disordinato a con label sconcluse andrebbe riformattato qui.
  haveEdit: boolean,
  haveMenu: boolean; //se ha un menu
  listMenu: any[]; //lista bottoni menu ,ogni bottone deve essere cosi formato :{icon: "delete",label: "Cancella",value:"cancella", action: (element, data) => {console.log(element);this.magazzinoFarmaciSrv.cancella(element);}}
  haveFilter: boolean; //se ha i filtri
  haveCheckbox: boolean; //se ha una colonna di checkbox
  filterConfig: string; //riferimento alla configurazione del filtro
  color: any[];
  setValue: any[];
  dynamicComponents: any;
  campoOrdinamento?: string;
}

@Injectable({
  providedIn: "root",
})
export class InfoService {
  public map = new Map<any, info>();

  constructor(
    private magazzinoFarmaciSrv: MagazzinoFarmaciService,
    private router: Router,
    private lottoSrv: LottoService,
    private prescrizioniSrv: PrescrizioniService,
    private listaIndaginiStrumentaliSrv: listaIndaginiStrumentaliService,
    private pazientiSrv: PazientiService
  ) {


    //Ogni volta che si crea una nuova configurazione INFO bisogna aggiungerla qui con ("callBy",this.nuovaInfo)
    this.map.set("default", this.default);
    this.map.set("magazzinoFarmaci", this.MagazzinoFarmaci);
    this.map.set("somministrazioni", this.somministrazione);
    this.map.set("lotto", this.lotto);
    this.map.set("paziente", this.pazientiList);
    this.map.set("indaginiStrumentali", this.IndaginiStrumentali)
    this.map.set("Prescrizioni", this.prescrizioni);
  }


  public getInfo(s: any) {


    return this.map.get(s);
  }

  public getDefaultConfig() {
    return this.default;
  }

  private default: info = {
    accordion: false,
    whoIsAccordion: null,
    typeAccordion: null,
    titleAccordion: null,
    color: null,
    haveImport: false,
    haveExport: false,
    hidden: null,
    ordine: null,
    edit: false,
    haveEdit: false,
    haveMenu: false,
    listMenu: null,
    haveFilter: false,
    haveCheckbox: false,
    filterConfig: "default",
    setValue: null,
    dynamicComponents: null,
    campoOrdinamento: null
  };

  public getLottoDefault() {
    return this.lotto;
  }

  private lotto: info = {
    filterConfig: "lotto",
    accordion: false,
    whoIsAccordion: null,
    typeAccordion: null,
    titleAccordion: null,
    color: null,
    haveImport: false,
    haveExport: false,
    hidden: null,
    ordine: null,
    edit: true,
    haveEdit: true,
    haveMenu: true,
    listMenu: [
      {
        icon: "edit",
        label: "Modifica lotto",
        value: "modificaLotto",
        action: (element, data) => {
          console.log(element);
          this.lottoSrv.modificaLotto(element);
        },
      },
      {
        icon: "delete",
        label: "Cancella",
        value: "cancella",
        action: (element, data) => {
          console.log(element);
          this.lottoSrv.cancella(element);
        },
      },
    ],
    haveFilter: false,
    haveCheckbox: false,
    setValue: null,
    dynamicComponents: null,
  };

  public getPazientiListaConfig() {
    return this.pazientiList;
  }

  private pazientiList: info = {
    filterConfig: "paziente",
    accordion: true,
    whoIsAccordion: null,
    typeAccordion: "classic",
    titleAccordion: "Percorso migratorio",
    color: ["attivo", "deceduto"],
    haveImport: false,
    haveExport: false,
    hidden: ["id"],
    ordine: (element) => {
      let tmp = this.pazientiSrv.rename(element);
      return tmp;
    },
    haveEdit: true,
    edit: true,
    haveMenu: true,
    listMenu: [
      {
        icon: "accessible",
        label: "Cartella clinica",
        action: (element) => {
          this.pazientiSrv.getCartellaClinica(element);
        },
      },
      {icon: "event_note", label: "Viste", action: "visualizzaPrestazioni"},
      {icon: "add", label: "Aggiungi vista", action: "aggiungiPrestazioni"},
      {
        icon: "sentiment_very_dissatisfied",
        label: "Comunica decesso",
        action: "comunicaDecesso",
      },
    ],
    haveFilter: false,
    haveCheckbox: false,
    setValue: null,
    dynamicComponents: null,
  };

  public getSomministrazioneConfig() {
    return this.somministrazione;
  }

  private somministrazione: info = {
    filterConfig: "somministrazioni",
    accordion: true,
    whoIsAccordion: null,
    typeAccordion: "table",
    titleAccordion: "Prescrizioni",
    color: ["DA_ASSUMERE", "ASSUNTA"],
    haveImport: false,
    haveExport: false,
    hidden: ["idPrescrizione", "idSomministrazione", "idTerapiaFarmacologica", "note", "nomePaziente", "cognomePaziente", "idPaziente", "idLotto"],
    ordine: null,
    edit: false,
    haveEdit: false,
    haveMenu: false,
    listMenu: null,
    haveFilter: true,
    haveCheckbox: false,
    setValue: null,
    dynamicComponents: null,
  };

  public getMagazzinoFarmaciConfig() {
    return this.MagazzinoFarmaci;
  }

  private MagazzinoFarmaci: info = {
    filterConfig: "magazzinoFarmaci",
    accordion: true,
    whoIsAccordion: null,
    typeAccordion: "table",
    titleAccordion: "Lotti",
    color: null,
    haveImport: false,
    haveExport: false,
    hidden: [
      "idMagazzino",
      "doseSingolaUnita",
      "lotti",
      "dataCreazione",
      "dataModifica",
    ],
    ordine: null,
    edit: true,
    haveEdit: true,
    haveMenu: true,
    listMenu: [
      {
        icon: "add",
        label: "Aggiungi lotto",
        value: "aggiungiLotto",
        action: (element, data) => {
          console.log(data);
          this.magazzinoFarmaciSrv.aggiungiLotto(element);
        },
      },
      {
        icon: "delete",
        label: "Cancella",
        value: "cancella",
        action: (element, data) => {
          console.log(element);
          this.magazzinoFarmaciSrv.cancella(element);
        },
      },
    ],
    haveFilter: true,
    haveCheckbox: false,
    setValue: null,
    dynamicComponents: null,
    campoOrdinamento: 'nomeFarmaco'
  };

  public getPrescrizioneConfig() {
    return this.prescrizioni;
  }

  private prescrizioni: info = {
    accordion: false,
    whoIsAccordion: null,
    typeAccordion: null,
    titleAccordion: null,
    color: null,
    haveImport: false,
    haveExport: false,
    hidden: ["idPrescrizione", "somministrazioni", "idPrescrizioni", "nomeFarmaco", "codiceAIC", "statoTerapia", "idTerapiaFarmacolocia"],
    ordine: null,
    edit: false,
    haveEdit: false,
    haveMenu: false,
    listMenu: null,
    haveFilter: false,
    haveCheckbox: false,
    filterConfig: "default",
    setValue: [
      {durata: "giorni", frequenza: "dosi al giorno", intervallo: "ore"},
    ],
    dynamicComponents: null,
  };

  public getIndaginiStrumentaliConfig() {
    return this.IndaginiStrumentali;
  }

  private IndaginiStrumentali: info = {
    accordion: true,
    whoIsAccordion: null,
    typeAccordion: "dynamic",
    titleAccordion: "Prescrizioni",
    color: ["DA_ESEGUIRE", "ESEGUITA"],
    haveImport: false,
    haveExport: false,
    hidden: null,
    ordine: null,
    edit: true,
    haveEdit: false,
    haveMenu: true,
    listMenu: [
      {
        icon: "info",
        label: "Dettagli",
        value: "dettagliInsaginiStrumentali",
        action: (element) => {
          this.router.navigate([ROUTING_PATH_CONSTANTS.DETTAGLIO_PAZIENTE]);
        },
      },
    ],
    haveFilter: true,
    haveCheckbox: false,
    filterConfig: "indaginiStrumentali",
    setValue: null,
    dynamicComponents: DettaglioPrescrizioniComponent
  }

  public getListaTerapieConfig() {
    return this.listaTerapie;
  }

  private listaTerapie: info = {
    accordion: false,
    whoIsAccordion: null,
    typeAccordion: null,
    titleAccordion: null,
    color: ["DA_ESEGUIRE", "ESEGUITA"],
    haveImport: false,
    haveExport: false,
    hidden: ["idTerapiaFarmacologica", "idPaziente"],
    ordine: null,
    edit: true,
    haveEdit: false,
    haveMenu: true,
    listMenu: [{
      icon: "accessible", label: "Cartella clinica", action: (element) => {
        element.element.id = element.element.idPaziente;
        this.pazientiSrv.getCartellaClinica(element);
      }
    }],
    haveFilter: true,
    haveCheckbox: false,
    filterConfig: "listaTerapie",
    setValue: [{durata: "giorni", frequenza: "dosi al giorno", intervallo: "ore"}],
    dynamicComponents: null

  }
}
