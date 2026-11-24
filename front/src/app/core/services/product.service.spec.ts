import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ProductService } from './product.service';
import { environment } from '../../../environments/environment';

describe('ProductService', () => {
  let service: ProductService;
  let http: HttpTestingController;
  const base = `${environment.apiUrl}/products`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ProductService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('sends pagination, search and status filters as query params', () => {
    service.getAll({ page: 2, limit: 10, search: 'mouse', is_active: 1 }).subscribe();

    const req = http.expectOne((r) => r.url === base);
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('page')).toBe('2');
    expect(req.request.params.get('limit')).toBe('10');
    expect(req.request.params.get('search')).toBe('mouse');
    expect(req.request.params.get('is_active')).toBe('1');
    req.flush({ success: true, data: [], meta: { total: 0, page: 2, limit: 10, totalPages: 0 } });
  });

  it('omits empty filters', () => {
    service.getAll({ page: 1, limit: 10 }).subscribe();

    const req = http.expectOne((r) => r.url === base);
    expect(req.request.params.has('search')).toBe(false);
    expect(req.request.params.has('is_active')).toBe(false);
    req.flush({ success: true, data: [], meta: { total: 0, page: 1, limit: 10, totalPages: 0 } });
  });

  it('loads the dashboard counters from /stats', () => {
    let active = -1;
    service.getStats().subscribe((res) => (active = res.data.active));

    const req = http.expectOne(`${base}/stats`);
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, data: { total: 4, active: 3, out_of_stock: 1 } });
    expect(active).toBe(3);
  });

  it('deletes a product by id', () => {
    service.delete(7).subscribe();
    const req = http.expectOne(`${base}/7`);
    expect(req.request.method).toBe('DELETE');
    req.flush({ success: true });
  });
});
