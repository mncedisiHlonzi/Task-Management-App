import { Component, OnInit } from '@angular/core';
import { TaskService } from '../services/tasks.service';
import { Chart, ChartType, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, DoughnutController, ArcElement, PieController, BarController, LineController } from 'chart.js';

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
  incompleteRate = 0;
  averageTimeToComplete = 0;
  LowPriorityTasks = 0;
  mediumPriorityTasks = 0;
  highPriorityTasks = 0;
  lowRate = 0;
  mediumRate = 0;
  highRate = 0;

  public chart: any;  // Chart variable
  chartType: ChartType = 'line';  // Default chart type

  isLoading: boolean = true;

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

  fetchTaskStats() {
    this.taskService.getTaskStats(this.userId!).subscribe(
      (data) => {
        this.pendingRate = data.pendingRate;
        this.completionRate = data.completionRate;
        this.cancellationRate = data.cancellationRate;
        this.incompleteRate = data.incompleteRate;
        this.averageTimeToComplete = data.averageTimeToComplete;

        // Now create the chart
        this.createChart();
      },
      (error) => {
        console.error('Error fetching task stats:', error);
      }
    );
  }

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
  
      const isDarkMode = document.body.classList.contains('dark');
      const gridColor = isDarkMode ? '#444' : '#e0e0e0';
      const textColor = isDarkMode ? '#fff' : '#666';
  
      // Get the 2D rendering context
      const chartCtx = ctx.getContext('2d');
      if (!chartCtx) {
        console.error('Could not get 2D context');
        return;
      }
  
      const gradient = chartCtx.createLinearGradient(0, 0, 0, 400);
      gradient.addColorStop(0, 'rgb(161, 63, 231)');
      gradient.addColorStop(1, 'rgba(161, 63, 231, 0)');
  
      // Apply gradient to pie/doughnut charts
      const getGradient = (ctx: CanvasRenderingContext2D) => {
        const gradient = ctx.createLinearGradient(0, 0, 0, 400);
        gradient.addColorStop(0, 'rgb(161, 63, 231)');
        gradient.addColorStop(1, 'rgba(161, 63, 231, 0)');
        return gradient;
      };
  
      this.chart = new Chart(ctx, {
        type: this.chartType,
        data: {
          labels: ['Pending', 'Completed', 'Cancelled', 'Incomplete'],
          datasets: [{
            label: 'Task Status',
            data: [this.pendingRate, this.completionRate, this.cancellationRate, this.incompleteRate],
            backgroundColor: this.chartType === 'pie' || this.chartType === 'doughnut' 
              ? [getGradient(chartCtx), getGradient(chartCtx), getGradient(chartCtx), getGradient(chartCtx)] // Apply gradient to each segment
              : gradient, // Use gradient for bar/line charts
            borderColor: this.chartType === 'line' ? 'rgb(161, 63, 231)' : this.chartType === 'bar' ? '#fff' : '#fff',
            borderWidth: this.chartType === 'pie' || this.chartType === 'doughnut' || this.chartType === 'bar' ? 2 : 3,
            pointBackgroundColor: this.chartType === 'line' ? 'rgb(161, 63, 231)' : 'rgb(161, 63, 231)',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointRadius: 5,
            pointHoverRadius: 7,
            fill: this.chartType === 'line',
            tension: this.chartType === 'line' ? 0.4 : 0, // Smooth curves for line chart
            borderRadius: this.chartType === 'bar' ? 7 : this.chartType === 'pie' || this.chartType === 'doughnut' ? 10 : 0, // Rounded corners for bar/pie/doughnut
            spacing: this.chartType === 'pie' || this.chartType === 'doughnut' ? 5 : 0, // Spacing between segments
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              display: false, // Hide legend for a cleaner look
            },
            tooltip: {
              enabled: true,
              backgroundColor: isDarkMode ? '#333' : '#fff',
              titleColor: isDarkMode ? '#fff' : '#333',
              bodyColor: isDarkMode ? '#fff' : '#333',
              borderColor: this.chartType === 'line' ? 'rgb(161, 63, 231)' : this.chartType === 'bar' ? 'rgb(161, 63, 231)' : gradient,
              borderWidth: 1,
              cornerRadius: 5,
            }
          },
          scales: this.chartType === 'pie' || this.chartType === 'doughnut' ? {} : {
            x: {
              grid: {
                display: false, // Hide x-axis grid lines
              },
              ticks: {
                color: textColor, // X-axis label color
              }
            },
            y: {
              grid: {
                display: false, // Hide y-axis grid lines
              },
              ticks: {
                color: textColor, // Y-axis label color
              }
            }
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