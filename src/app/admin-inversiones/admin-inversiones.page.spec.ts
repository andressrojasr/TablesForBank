import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminInversionesPage } from './admin-inversiones.page';

describe('AdminInversionesPage', () => {
  let component: AdminInversionesPage;
  let fixture: ComponentFixture<AdminInversionesPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminInversionesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
