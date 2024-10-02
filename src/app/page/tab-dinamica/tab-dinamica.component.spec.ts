import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TabDinamicaComponent } from './tab-dinamica.component';

describe('TabDinamicaComponent', () => {
  let component: TabDinamicaComponent;
  let fixture: ComponentFixture<TabDinamicaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TabDinamicaComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TabDinamicaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
