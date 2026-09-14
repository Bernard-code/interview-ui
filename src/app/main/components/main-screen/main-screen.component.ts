import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { StateService } from '../../services/state.service';

@Component({
  selector: 'app-main-screen',
  templateUrl: './main-screen.component.html',
  styleUrl: './main-screen.component.scss',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    AsyncPipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainScreenComponent {
  private stateService = inject(StateService);

  public alwaysShowAnswers$ = this.stateService.alwaysShowAnswers$;
  public navItems = [
    { name: 'Questions', url: '/questions', icon: 'quiz' },
    { name: 'ToDo', url: '/todo', icon: 'checklist' },
  ];

  public toggleAlwaysShowAnswers(): void {
    this.stateService.toggleAlwaysShowAnswers();
  }
}
