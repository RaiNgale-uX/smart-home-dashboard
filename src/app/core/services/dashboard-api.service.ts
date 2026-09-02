import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../config';
import { DashboardSnapshot, DbTestResponse, SensorReadingPayload } from '../models/dashboard.model';

@Injectable({ providedIn: 'root' })
export class DashboardApiService {
  private readonly http = inject(HttpClient);

  getDashboard(): Observable<DashboardSnapshot> {
    return this.http.get<DashboardSnapshot>(`${API_BASE_URL}/api/v1/dashboard`);
  }

  testConnection(): Observable<DbTestResponse> {
    return this.http.get<DbTestResponse>(`${API_BASE_URL}/api/v1/db-test`);
  }

  postSensorReading(payload: SensorReadingPayload): Observable<unknown> {
    return this.http.post(`${API_BASE_URL}/api/v1/sensors`, payload);
  }
}
