import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminCreditosPage } from './admin-creditos.page';

describe('AdminCreditosPage', () => {
  let component: AdminCreditosPage;
  let fixture: ComponentFixture<AdminCreditosPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminCreditosPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
