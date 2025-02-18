import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dateAgo'
})
export class DatePipe implements PipeTransform {

  transform(value: any, ...args: any[]): string {
    if (typeof value === 'string') {
      value = new Date(value);
    }
    return this.convertToDisplayDateAgo(value);
  }

  private convertToDisplayDateAgo(date: Date): string {
    const currDateInSeconds = this.convertDateToSeconds(new Date());
    const inputDateInSeconds = this.convertDateToSeconds(date);
    const differenceInSeconds = currDateInSeconds - inputDateInSeconds;
    let intervalValue: number;

    if (differenceInSeconds < 60) return 'Just now';
    else if (differenceInSeconds >= 60 && differenceInSeconds <= 3600) {
      intervalValue = this.convertSecondToMinute(differenceInSeconds);
      return `${intervalValue}m${intervalValue > 1 ? '' : ''}`;
    }
    else if (differenceInSeconds > 3600 && differenceInSeconds <= 86400) {
      intervalValue = this.convertSecondToHours(differenceInSeconds);
      return `${intervalValue}h${intervalValue > 1 ? '' : ''}`;
    }
    else if (differenceInSeconds > 86400 && differenceInSeconds <= 2629746) {
      intervalValue = this.convertSecondToDays(differenceInSeconds);
      return `${intervalValue}d${intervalValue > 1 ? '' : ''}`;
    }
    else if (differenceInSeconds > 2629746 && differenceInSeconds <= 31536000) {
      intervalValue = this.convertSecondToMonths(differenceInSeconds);
      return `${intervalValue} Mon${intervalValue > 1 ? '' : ''}`;
    }
    else if (differenceInSeconds > 31536000) {
      intervalValue = this.convertSecondToYears(differenceInSeconds);
      return `${intervalValue} year${intervalValue > 1 ? '' : ''}`;
    }
    return '';
  }

  private convertSecondToMinute(seconds: number): number {
    return Math.floor(seconds / 60);
  }

  private convertSecondToHours(seconds: number): number {
    return Math.floor(seconds / 3600);
  }

  private convertSecondToDays(seconds: number): number {
    return Math.floor(seconds / 86400);
  }

  private convertSecondToMonths(seconds: number): number {
    return Math.floor(seconds / 2629746);
  }

  private convertSecondToYears(seconds: number): number {
    return Math.floor(seconds / 31536000);
  }

  private convertDateToSeconds(date: Date): number {
    return Math.floor(date.getTime() / 1000);
  }
}
