import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminInstitucionPage } from './admin-institucion.page';

describe('AdminInstitucionPage', () => {
  let component: AdminInstitucionPage;
  let fixture: ComponentFixture<AdminInstitucionPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminInstitucionPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
