import { Component, OnInit } from '@angular/core';
import { TaskService } from '../services/tasks.service';
import { Chart, ChartType, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, DoughnutController, ArcElement, PieController, BarController, LineController } from 'chart.js'; // Import necessary elements for different chart types

// Register necessary components
Chart.register(
  CategoryScale,   // For bar and line charts
  LinearScale,     // For bar and line charts
  BarElement,      // For bar charts
  LineElement,     // For line charts
  PointElement,    // For line chart points
  ArcElement,      // For doughnut and pie charts
  DoughnutController, // For doughnut charts
  PieController,    // For pie charts
  BarController,   // For bar charts
  LineController,  // For line charts
  Tooltip,
  Legend,
  Title
);

@Component({
  selector: 'app-analytics',
  templateUrl: './analytics.page.html',
  styleUrls: ['./analytics.page.scss'],
})
export class AnalyticsPage implements OnInit {
  userId: number | null = null;
  totalTasks = 0;
  pendingTasks = 0;
  completedTasks = 0;
  incompleteTasks = 0;
  cancelledTasks = 0;

  pendingRate = 0;
  completionRate = 0;
  cancellationRate = 0;
  incompleteRate = 0; // New rate
  averageTimeToComplete = 0;

  LowPriorityTasks = 0;
  mediumPriorityTasks = 0;
  highPriorityTasks = 0;

  lowRate = 0;
  mediumRate = 0;
  highRate = 0;

  public chart: any;  // Chart variable
  chartType: ChartType = 'line';  // Default chart type

  constructor(private taskService: TaskService) {}

  ngOnInit() {
    this.getUserFromLocalStorage();  // Fetch user info from localStorage
  
    if (this.userId) {
      this.fetchTaskOverview();  // Fetch task overview for the logged-in user
      this.fetchTaskPriority();
      this.fetchTaskStats();     // Fetch task stats for the logged-in user
      this.fetchTaskPriorityStats();
    } else {
      console.error('User not found in localStorage');
      // Optionally redirect the user to the login page
    }
  }
  
  

  // Fetch user from local storage
  getUserFromLocalStorage() {
    const user = localStorage.getItem('user'); // Replace 'user' with the actual key used
    if (user) {
      const parsedUser = JSON.parse(user);
      this.userId = parsedUser.id; // Ensure the user object has an 'id' field
    }
  }

  //
  fetchTaskOverview() {
    this.taskService.getTaskOverview(this.userId!).subscribe(
      (data) => {
        this.totalTasks = data.totalTasks;
        this.pendingTasks = data.pendingTasks;
        this.completedTasks = data.completedTasks;
        this.incompleteTasks = data.incompleteTasks;
        this.cancelledTasks = data.cancelledTasks;
      },
      (error) => {
        console.error('Error fetching task overview:', error);
      }
    );
  }

  //
  fetchTaskPriority() {
    this.taskService.getTaskPriority(this.userId!).subscribe(
      (data) => {
        this.totalTasks = data.totalTasks;
        this.LowPriorityTasks = data.LowPriorityTasks;
        this.mediumPriorityTasks = data.mediumPriorityTasks;
        this.highPriorityTasks = data.highPriorityTasks;
      },
      (error) => {
        console.error('Error fetching task overview:', error);
      }
    );
  }

  //
  fetchTaskStats() {
    this.taskService.getTaskStats(this.userId!).subscribe(
      (data) => {
        this.pendingRate = data.pendingRate;
        this.completionRate = data.completionRate;
        this.cancellationRate = data.cancellationRate;
        this.incompleteRate = data.incompleteRate; // New incomplete rate
        this.averageTimeToComplete = data.averageTimeToComplete;

        // Now create the chart
        this.createChart();
      },
      (error) => {
        console.error('Error fetching task stats:', error);
      }
    );
  }

  //
  fetchTaskPriorityStats() {
    this.taskService.getTaskPriorityStats(this.userId!).subscribe(
      (data) => {
        this.lowRate = data.lowRate;
        this.mediumRate = data.mediumRate;
        this.highRate = data.highRate;
      },
      (error) => {
        console.error('Error fetching task stats:', error);
      }
    );
  }

  //
  get mostPrioritized(): string {
    if (this.highPriorityTasks >= this.mediumPriorityTasks && this.highPriorityTasks >= this.LowPriorityTasks) {
      return 'High';
    } else if (this.mediumPriorityTasks >= this.LowPriorityTasks) {
      return 'Medium';
    } else {
      return 'Low';
    }
  }
  

  // Create the chart using the task stats
  createChart() {
    // Destroy the existing chart if it exists
    if (this.chart) {
      this.chart.destroy();
    }

    // Create a new chart
    this.chart = new Chart('taskChart', {
      type: this.chartType,  // Use the chartType variable to dynamically change the type
      data: {
        labels: ['Pending', 'Completed', 'Cancelled', 'Incomplete'],  // Labels for each section
        datasets: [{
          data: [this.pendingRate, this.completionRate, this.cancellationRate, this.incompleteRate], // Values to display
          backgroundColor: ['#92949c', '#12e44a', '#c5000f', '#ffc409'],  // Colors for each section
          hoverBackgroundColor: ['#92949c', '#218838', '#c82333', '#e0a800']
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top'
          },
          tooltip: {
            enabled: true
          }
        }
      }
    });
  }

  // Method to change the chart type dynamically
  changeChartType(newChartType: ChartType) {
    this.chartType = newChartType;
    this.createChart(); // Re-create the chart with the new type
  }
  
}