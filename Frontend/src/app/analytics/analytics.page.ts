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

  isLoading: boolean = true; // Add loading state

  constructor(private taskService: TaskService) {}

  ngOnInit() {
    this.getUserFromLocalStorage();

    if (this.userId) {
      this.fetchTaskOverview();
      this.fetchTaskPriority();
      this.fetchTaskStats();
      this.fetchTaskPriorityStats();
    } else {
      console.error('User not found in localStorage');
    }

    // Delay the hiding of the skeleton and ensure chart loads after DOM update
    setTimeout(() => {
      this.isLoading = false;
    }, 1000);
  }

  // Wait for the view to be initialized before rendering the chart
  ngAfterViewInit() {
    setTimeout(() => {
      if (!this.isLoading) {
        this.createChart();
      }
    }, 1100); // Small delay to ensure the DOM updates first
  }
  
  // Fetch user from local storage
  getUserFromLocalStorage() {
    const user = localStorage.getItem('user');
    if (user) {
      const parsedUser = JSON.parse(user);
      this.userId = parsedUser.id;
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
    setTimeout(() => {
      if (this.chart) {
        this.chart.destroy(); // Destroy previous instance
      }

      const ctx = document.getElementById('taskChart') as HTMLCanvasElement;
      if (!ctx) {
        console.error('Canvas element not found!');
        return;
      }

      this.chart = new Chart(ctx, {
        type: this.chartType,
        data: {
          labels: ['Pending', 'Completed', 'Cancelled', 'Incomplete'],
          datasets: [{
            data: [this.pendingRate, this.completionRate, this.cancellationRate, this.incompleteRate],
            backgroundColor: ['#92949c', '#12e44a', '#c5000f', '#ffc409'],
            hoverBackgroundColor: ['#92949c', '#218838', '#c82333', '#e0a800']
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { position: 'top' },
            tooltip: { enabled: true }
          }
        }
      });
    }, 100); // Small delay to ensure canvas is available
  }

  // Method to change the chart type dynamically
  changeChartType(newChartType: ChartType) {
    this.chartType = newChartType;
    this.createChart(); // Re-create the chart with the new type
  }  
}