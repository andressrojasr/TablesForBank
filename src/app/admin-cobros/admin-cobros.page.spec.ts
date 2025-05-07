import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminCobrosPage } from './admin-cobros.page';

describe('AdminCobrosPage', () => {
  let component: AdminCobrosPage;
  let fixture: ComponentFixture<AdminCobrosPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminCobrosPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
