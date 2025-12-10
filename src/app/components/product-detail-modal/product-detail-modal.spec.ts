import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductDetailModal } from './product-detail-modal';

describe('ProductDetailModal', () => {
  let component: ProductDetailModal;
  let fixture: ComponentFixture<ProductDetailModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductDetailModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductDetailModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
