import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { CategoryList } from './category-list';
import { environment } from '../../../../environments/environment';

describe('CategoryList', () => {
  let component: CategoryList;
  let fixture: ComponentFixture<CategoryList>;
  let http: HttpTestingController;
  const url = `${environment.apiUrl}/categories`;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CategoryList],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(CategoryList);
    component = fixture.componentInstance;
    http = TestBed.inject(HttpTestingController);
    fixture.detectChanges(); // triggers ngOnInit -> loadCategories()
  });

  afterEach(() => http.verify());

  it('loads categories on init', () => {
    http.expectOne(url).flush({
      success: true,
      message: 'ok',
      data: [{ id: 1, name: 'Books' }, { id: 2, name: 'Electronics' }],
    });

    expect(component.categories().length).toBe(2);
    expect(component.categoryCount()).toBe(2);
  });

  it('filters categories with the search term (case-insensitive)', () => {
    http.expectOne(url).flush({
      success: true,
      message: 'ok',
      data: [{ id: 1, name: 'Books' }, { id: 2, name: 'Electronics' }],
    });

    component.searchTerm.set('  ELEC ');
    expect(component.filteredCategories().map((c) => c.name)).toEqual(['Electronics']);
  });

  it('refuses to save an empty name', () => {
    http.expectOne(url).flush({ success: true, message: 'ok', data: [] });

    component.categoryName.set('   ');
    component.saveCategory();

    http.expectNone(url); // no POST must be sent
    expect(component.toast()?.type).toBe('error');
  });

  it('shows a friendly message when the category is still used (409)', () => {
    http.expectOne(url).flush({ success: true, message: 'ok', data: [{ id: 3, name: 'Books' }] });

    component.deleteCategory({ id: 3, name: 'Books' });
    component['confirmDialog']().confirm();

    http.expectOne(`${url}/3`).flush({ success: false, message: 'x' }, { status: 409, statusText: 'Conflict' });
    expect(component.toast()?.message).toContain('contient encore des produits');
  });
});
