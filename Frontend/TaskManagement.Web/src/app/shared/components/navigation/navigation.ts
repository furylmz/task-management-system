import { Component, computed, inject, signal } from '@angular/core';

import { RouterLink, RouterLinkActive } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';

import { AuthService } from '../../../core/services/auth';
import { ThemeService } from '../../../core/services/theme';

@Component({
  selector: 'app-navigation',
  imports: [
    RouterLink,
    RouterLinkActive,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatToolbarModule,
    MatTooltipModule,
  ],
  templateUrl: './navigation.html',
  styleUrl: './navigation.css',
})
export class Navigation {
  private readonly authService = inject(AuthService);
  readonly themeService = inject(ThemeService);

  readonly currentUser = signal(this.authService.getCurrentUser());

  readonly displayName = computed(() => {
    const user = this.currentUser();

    if (!user) {
      return 'Kullanıcı';
    }

    const fullName = `${user.firstName} ${user.lastName}`.trim();

    return fullName || user.username;
  });

  logout(): void {
    this.authService.logout();
  }
}
