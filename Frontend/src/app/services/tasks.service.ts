import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private apiUrl = 'http://172.168.161.212:3000/api/mains'; // Update with your actual base URL

  constructor(private http: HttpClient) {}

  // Get task overview
  getTaskOverview(userId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/task-overview/${userId}`);
  }

  // Get task stats
  getTaskStats(userId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/task-stats/${userId}`);
  }

  // Get task overview
  getTaskPriority(userId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/task-priority/${userId}`);
  }

  // Get task stats
  getTaskPriorityStats(userId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/priority-stats/${userId}`);
  }

}