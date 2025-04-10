import { Component, inject } from '@angular/core';
import { MatDrawer, MatDrawerContainer, MatDrawerContent, MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { Router, RouterOutlet } from '@angular/router';
import { PresentationItem } from '../../model/presentation-item.model';

@Component({
  selector: 'app-main-screen',
  templateUrl: './main-screen.component.html',
  styleUrl: './main-screen.component.scss',
  imports: [
    RouterOutlet,
    MatDrawer,
    MatDrawerContainer,
    MatDrawerContent,
    MatSidenavModule,
    MatListModule,
  ]
})
export class MainScreenComponent {
  private router = inject(Router);

  public navItems = [
    {name: 'ToDo', url: '/todo'},
    {name: 'Questions', url: `/categories/${PresentationItem.Category}/`},
  ];

  public navigate(url: string): void {
    this.router.navigate([url]);
  }
}
