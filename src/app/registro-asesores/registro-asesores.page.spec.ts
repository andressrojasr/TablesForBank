import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RegistroAsesoresPage } from './registro-asesores.page';

describe('RegistroAsesoresPage', () => {
  let component: RegistroAsesoresPage;
  let fixture: ComponentFixture<RegistroAsesoresPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(RegistroAsesoresPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
