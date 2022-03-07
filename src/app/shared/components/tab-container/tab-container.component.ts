import {AfterViewInit, Component, ElementRef, HostListener, Input, OnInit, ViewChild} from '@angular/core';
import {TabContainerSettings} from './tab-container-settings';

@Component({
  selector: 'app-tab-container',
  templateUrl: './tab-container.component.html',
  styleUrls: ['./tab-container.component.scss']
})
export class TabContainerComponent implements OnInit, AfterViewInit {
  @Input()
  public configuration: TabContainerSettings;

  @ViewChild('tabTarget') private tabTarget: ElementRef<HTMLElement>;

  public offset = -41;
  public targetOffset = -41;
  public needToScroll = false;
  public tabs: string[];
  public activeTab: string;

  constructor() {
  }

  public canScrollRight(): boolean {
    if (!this.needToScroll) {
      return false;
    }
    const total = this.getTotalLengthTabs() - window.innerWidth;
    return this.targetOffset < (total + 40);
  }

  public canScrollLeft(): boolean {
    if (!this.needToScroll) {
      return false;
    }
    const total = this.getTotalLengthTabs() - window.innerWidth;
    return this.targetOffset > -30;
  }

  public ngAfterViewInit(): void {
    const totalLengthList = this.getTotalLengthTabs();
    const totalLengthContainer = window.innerWidth;
    if (totalLengthList < totalLengthContainer) {
      this.offset = -32;
      this.needToScroll = false;
    } else {
      this.needToScroll = true;
    }
  }

  ngOnInit(): void {
    setInterval(() => {
      if (this.targetOffset === this.offset) {
        return;
      }
      if (this.targetOffset < this.offset) {
        this.offset-=5;
      } else {
        this.offset+=5;
      }
      if (Math.abs(this.targetOffset - this.offset) < 5) {
        this.offset = this.targetOffset;
      }
    }, 10);

    this.configuration.on('onChange').subscribe(data => this.tabs = data);
    this.configuration.on('onActivate').subscribe(data => this.activeTab = data);

    this.configuration.tabContainerReady();
  }

  scrollToRight() {
    this.targetOffset += 100;

    if (this.targetOffset > this.maxOffset()) {
      this.targetOffset = this.maxOffset();
    }
  }

  scrollToLeft() {
    this.targetOffset -= 100;

    if (this.targetOffset < -41) {
      this.targetOffset = -41;
    }
  }

  private maxOffset(): number {
    const total = this.getTotalLengthTabs() - window.innerWidth;
    if (total < 0) {
      return -35;
    }
    return total + 45;
  }

  // eslint-disable-next-line @typescript-eslint/member-ordering
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.ngAfterViewInit();
  }

  private getTotalLengthTabs(): number {
    const allTabs = this.tabTarget.nativeElement.querySelectorAll('li');
    let total = 0;
    allTabs.forEach(x => {
      total += x.offsetWidth;
    });
    return total;
  }

}
