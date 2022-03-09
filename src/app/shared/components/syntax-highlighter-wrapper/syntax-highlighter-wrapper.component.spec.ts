import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SyntaxHighlighterWrapperComponent } from './syntax-highlighter-wrapper.component';

describe('SyntaxHighlighterWrapperComponent', () => {
  let component: SyntaxHighlighterWrapperComponent;
  let fixture: ComponentFixture<SyntaxHighlighterWrapperComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SyntaxHighlighterWrapperComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SyntaxHighlighterWrapperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
